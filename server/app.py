from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, firestore
import os, re
from dotenv import load_dotenv
import google.generativeai as genai
from werkzeug.utils import secure_filename
import base64
from datetime import datetime, timezone, timedelta

from utils.loan_utils import calculate_total_due, check_and_release_documents
from utils.lender_logic import register_lender, post_lender_offer, get_lender_offers, fetch_all_borrowers


# Load environment variables from .env
load_dotenv()

firebase_config = {
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL")
}

# Firebase setup
cred = credentials.Certificate(firebase_config)  # Your Firebase service account key JSON file
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Gemini API setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash') # for getting parse text and generate trust score #get docs -> parse text -> send to /ai/trust-score

# Helper to verify Firebase ID token
def verify_token(token):
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except Exception as e:
        print("Token verification failed:", e)
        return None



# ---- ROUTES ----

# Health check
@app.route("/")
def home():
    return jsonify({"message": "TrustBridge Backend Running"}), 200


# Auth verification (Frontend sends Firebase ID token)
@app.route("/auth/verify", methods=["POST"])
def auth_verify():
    data = request.get_json()
    token = data.get("token")
    uid = verify_token(token)
    if uid:
        return jsonify({"status": "success", "uid": uid}), 200
    else:
        return jsonify({"status": "error", "message": "Invalid token"}), 401


# Get or update user profile
@app.route("/user/profile/<uid>", methods=["GET", "POST"])
def user_profile(uid):
    if request.method == "GET":
        doc = db.collection("users").document(uid).get()
        if doc.exists:
            return jsonify(doc.to_dict()), 200
        else:
            return jsonify({"error": "User not found"}), 404
    elif request.method == "POST":
        data = request.get_json()
        db.collection("users").document(uid).set(data, merge=True)
        return jsonify({"status": "profile updated"}), 200


# Submit a loan request
@app.route("/loan/request", methods=["POST"])
def loan_request():
    data = request.get_json()
    
    # Validate required fields
    required_fields = ["uid", "amount", "purpose", "wallet"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
        
    # Validate amount is positive number
    try:
        amount = float(data.get("amount"))
        if amount <= 0:
            return jsonify({"error": "Amount must be positive"}), 400
    except ValueError:
        return jsonify({"error": "Invalid amount"}), 400

    uid = data.get("uid")
    loan_data = {
    "amount": amount,
    "purpose": data.get("purpose"),
    "timestamp": firestore.SERVER_TIMESTAMP,
    "due_date": datetime.now(timezone.utc) + timedelta(days=30), 
    "status": "pending",
    "wallet": data.get("wallet")
}
    
    try:
        db.collection("users").document(uid).collection("loans").add(loan_data)
        return jsonify({"status": "loan request submitted"}), 200
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


# Get all loans for a user
@app.route("/loan/user/<uid>", methods=["GET"])
def user_loans(uid):
    loans = db.collection("users").document(uid).collection("loans").stream()
    loan_list = []
    for loan in loans:
        loan_entry = loan.to_dict()
        loan_entry["id"] = loan.id
        loan_list.append(loan_entry)
    return jsonify(loan_list), 200

##----Fetch Trust Score----##
@app.route("/user/trust-score/<uid>", methods=["GET"])
def get_trust_score(uid):
    try:
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({
                "error": "User not found"
            }), 404
            
        user_data = user_doc.to_dict()
        trust_score = user_data.get("trust_score", {
            "current": 0,
            "updated_at": None,
            "history": []
        })
        
        return jsonify({
            "status": "success",
            "trust_score": trust_score
        }), 200
        
    except Exception as e:
        print(f"Error fetching trust score: {str(e)}")
        return jsonify({
            "error": "Failed to fetch trust score",
            "details": str(e)
        }), 500

######## particular Loan Status 

@app.route("/loan/status/<uid>/<loan_id>", methods=["GET"])
def loan_status(uid: str, loan_id: str):
    try:
        loan_ref = db.collection("users").document(uid).collection("loans").document(loan_id)
        loan = loan_ref.get()
        
        if not loan.exists:
            return jsonify({"error": "Loan not found"}), 404

        loan_data = loan.to_dict()
        
        # Validate required loan data
        required_fields = ["amount", "timestamp", "due_date"]
        if not all(field in loan_data for field in required_fields):
            return jsonify({"error": "Invalid loan data"}), 400

        principal = float(loan_data["amount"])
        
        # Handle timestamp
        issue_date_dt = loan_data["timestamp"]
        if isinstance(issue_date_dt, datetime):
            issue_date = issue_date_dt.astimezone(timezone.utc).strftime("%Y-%m-%d")
        else:
            issue_date = issue_date_dt.strftime("%Y-%m-%d")

        # Handle due_date
        due_date = loan_data["due_date"]
        if isinstance(due_date, datetime):
            due_date = due_date.astimezone(timezone.utc).strftime("%Y-%m-%d")
        elif isinstance(due_date, str):
            # If it's already a string, ensure it's in YYYY-MM-DD format
            due_date = datetime.strptime(due_date, "%Y-%m-%d").strftime("%Y-%m-%d")

        # Get current date in UTC
        current_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        total_due = calculate_total_due(principal, issue_date, due_date, current_date)
        docs_released = check_and_release_documents(db, uid, loan_id, due_date, current_date)

        return jsonify({
            "loan_id": loan_id,
            "principal": principal,
            "total_due": total_due,
            "issue_date": issue_date,
            "due_date": due_date,
            "current_date": current_date,
            "documents_released": docs_released,
            "status": loan_data.get("status", "unknown")
        }), 200

    except ValueError as ve:
        print(f"Value Error in loan status: {str(ve)}")
        return jsonify({"error": "Invalid date format", "details": str(ve)}), 400
    except Exception as e:
        print(f"Loan status error: {str(e)}")
        return jsonify({"error": "Failed to fetch loan status", "details": str(e)}), 500
    

###Loan approved or rejected

@app.route("/loan/decision/<uid>/<loan_id>", methods=["POST"])
def loan_decision(uid, loan_id):
    try:
        data = request.get_json()
        decision = data.get("decision")  # Should be "approved" or "rejected"

        if decision not in ["approved", "rejected"]:
            return jsonify({"error": "Decision must be either 'approved' or 'rejected'"}), 400

        loan_ref = db.collection("users").document(uid).collection("loans").document(loan_id)
        loan = loan_ref.get()

        if not loan.exists:
            return jsonify({"error": "Loan not found"}), 404

        # Update status
        loan_ref.update({"status": decision})

        return jsonify({
            "message": f"Loan {loan_id} has been {decision}"
        }), 200

    except Exception as e:
        print(f"Loan decision error: {str(e)}")
        return jsonify({"error": "Failed to update loan decision", "details": str(e)}), 500






##---- Lender Routes ----##

@app.route("/lender/register", methods=["POST"])
def lender_register():
    data = request.get_json()
    uid = data.get("uid")

    if not uid:
        return jsonify({"status": "error", "message": "UID is required"}), 400

    result = register_lender(db, uid, data)
    return jsonify(result), 200 if result["status"] == "success" else 500

# Post a lender offer
@app.route("/lender/offer", methods=["POST"])
def lender_offer():
    data = request.get_json()
    uid = data.get("uid")
    offer_data = {
        "amount": data.get("amount"),
        "interest_rate": data.get("interest_rate"),
        "timestamp": firestore.SERVER_TIMESTAMP,
        "wallet": data.get("wallet")
    }

    result = post_lender_offer(db, uid, offer_data)
    status = 200 if result["status"] == "success" else 500
    return jsonify(result), status


# Get all offers from a lender
@app.route("/lender/offers/<uid>", methods=["GET"])
def lender_offers(uid):
    result = get_lender_offers(db, uid)
    if "status" in result and result["status"] == "error":
        return jsonify(result), 500
    return jsonify(result), 200


@app.route("/lender/borrowers", methods=["GET"])
def get_borrowers_for_lender():
    try:
        borrowers = fetch_all_borrowers(db)
        return jsonify(borrowers), 200
    except Exception as e:
        print(f"Error fetching borrowers: {str(e)}")
        return jsonify({"error": "Failed to fetch borrowers", "details": str(e)}), 500









##------ Upload Docs & get TrustScore-------##

@app.route("/vision/first-trustscore", methods=["POST"])
def vision_upload():
    try:
        uid = request.form.get("uid")
        if not uid:
            return jsonify({"error": "User ID required"}), 400

        if 'document' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        files = request.files.getlist('document')
        if not files or len(files) == 0:
            return jsonify({"error": "No files uploaded"}), 400

        allowed_types = {'image/jpeg', 'image/png', 'application/pdf'} 
        extracted_results = []

        for file in files:
            if file.mimetype not in allowed_types:
                print(f"Skipping invalid file type: {file.filename} ({file.mimetype})")
                continue

            filename = secure_filename(file.filename)
            file_bytes = file.read()

            image_parts = [{
                "mime_type": file.mimetype,
                "data": base64.b64encode(file_bytes).decode("utf-8")
            }]

            vision_prompt = """
            Extract important financial or identity details from this document.
            Focus specifically on:
            - Income information (e.g., salary slips, ITR, tax documents)
            - Payment history (e.g., utility bills like electricity, gas, rent receipts)
            - Credit score or references to loans
            - Identity verification (e.g., PAN, Aadhaar)

            Output the extracted data in clear plain text.
            If this is an invalid or irrelevant document (e.g., a photo, blank page, or unrelated file), return only: "Invalid document"
            """

            vision_response = model.generate_content(
                contents=[{"parts": [{"text": vision_prompt}, {"inline_data": image_parts[0]}]}],
                generation_config={"temperature": 0.0}
            )

            extracted_text = vision_response.text.strip() if vision_response.text else "No text extracted"
            extracted_results.append({
                "filename": filename,
                "extracted_text": extracted_text
            })

        if not extracted_results:
            return jsonify({"error": "No valid documents processed"}), 400

        # Check if all docs are invalid
        if all("Invalid document" in res["extracted_text"] or "No text extracted" in res["extracted_text"] for res in extracted_results):
            return jsonify({
                "trust_score": 5,
                "explanation": "Submitted documents were invalid or unreadable.",
                "results": extracted_results
            }), 200

        # Combine text for TrustScore
        combined_history = "\n\n".join([res["extracted_text"] for res in extracted_results])

        trust_prompt = f"""
        You are evaluating a user's trustworthiness based on their submitted financial documents.

Scoring Criteria:
High Trust Score (85-95)
•	User has provided 3 or more valid financial documents from the following categories:
o	Income Tax Returns (ITR)
o	Electricity bills
o	Gas bills
o	Rent receipts
o	Water bills
o	Phone/Internet bills
o	Bank statements
o	Property tax receipts
o	Insurance premium receipts
•	Documents show consistent financial patterns
•	No overdue payments or significant arrears
•	Documents are recent (within last 12 months preferred)
•	All documents contain proper identification details (name, address, dates)
Moderate Trust Score (50-70)
•	User has provided 1-2 valid financial documents
•	Documents show mixed financial reliability (some late payments but generally stable)
•	Minor inconsistencies in documentation
•	Some documents may be older than 12 months
•	Limited variety in document types
Low Trust Score (0-30)
•	Fewer than 3 documents provided OR documents are clearly invalid
•	Significant inconsistencies in financial data
•	Multiple overdue payments or defaults visible
•	Documents are incomplete, illegible, or suspicious
•	Missing critical information (names, dates, amounts)
Additional Positive Indicators:
•	No outstanding dues or overdue payments
•	Consistent payment history across documents
•	Regular income patterns (for ITR/salary documents)
•	Utilities paid on time consistently
•	Documents from verified/official sources
Additional Negative Indicators:
•	Frequent late payment notices
•	Disconnection warnings
•	Large outstanding balances
•	Irregular income patterns
•	Suspicious document formatting or information

User document data: {combined_history}
Response format: Score: [number] Explanation: [text]
        """

        trust_response = model.generate_content(trust_prompt, generation_config={"temperature": 0.0})
        text_response = trust_response.text if trust_response and trust_response.text else ""

        # Extract score
        score_match = re.search(r"Score:\s*(\d{1,3})", text_response, re.IGNORECASE)
        if not score_match:
            score = 5
            explanation = "Score could not be determined from the extracted document data."
        else:
            score = min(100, max(0, int(score_match.group(1))))
            explanation_match = re.search(r"Explanation:\s*(.*)", text_response, re.IGNORECASE | re.DOTALL)
            explanation = explanation_match.group(1).strip() if explanation_match else "No explanation provided."

        # ✅ Save score to Firestore under users/{uid}/trust_score
        try:
            user_ref = db.collection("users").document(uid)
            
            # Create the history entry first
            history_entry = {
                "score": score,
                "reason": explanation,
                "date": datetime.now(timezone.utc).isoformat() 
            }

            # Get current document to check if history exists
            doc = user_ref.get()
            current_data = doc.to_dict() if doc.exists else {}
            
            # Replace the section where you initialize the trust_score:

            # Initialize history array if it doesn't exist
            if not current_data.get('trust_score', {}).get('history'):
                user_ref.set({
                    'trust_score': {
                        'current': score,  # Use the actual score instead of 0
                        'updated_at': firestore.SERVER_TIMESTAMP,
                        'history': [history_entry]  # Add initial history entry
                    }
                }, merge=True)
            else:
                # Append to existing history
                user_ref.update({
                    'trust_score.history': firestore.ArrayUnion([history_entry])
                })

            # Update current score and timestamp
            user_ref.update({
                'trust_score.current': score,
                'trust_score.updated_at': firestore.SERVER_TIMESTAMP
            })

            return jsonify({
                "trust_score": score,
                "explanation": explanation,
                "results": extracted_results,
                "status": "success",
                "message": "Trust score updated successfully"
            }), 200

        except Exception as db_error:
            print(f"Firestore update error: {str(db_error)}")
            return jsonify({
                "error": "Failed to store trust score",
                "details": str(db_error)
            }), 500

    except Exception as e:
        print(f"Processing error: {str(e)}")
        return jsonify({
            "error": "Failed to process documents",
            "details": str(e)
        }), 500
    


# ---- MAIN ----
if __name__ == "__main__":
    app.run(debug=True)