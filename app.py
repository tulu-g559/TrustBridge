from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, firestore
import os, re
from dotenv import load_dotenv
import google.generativeai as genai
from werkzeug.utils import secure_filename
import base64

from utils.loan_utils import calculate_total_due, check_and_release_documents
from datetime import datetime, timezone, timedelta

# Load environment variables from .env
load_dotenv()

# Firebase setup
cred = credentials.Certificate("firebase_config.json")  # Your Firebase service account key JSON file
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


######## particular Loan Status ##########
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
    

####### Loan approved or rejected #######
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








#######Upload docs############
@app.route("/vision/upload", methods=["POST"])  
def vision_upload():
    try:
        file = request.files.get("document")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        # Validate file type
        allowed_types = {'image/jpeg', 'image/png', 'image/pdf'}
        if file.mimetype not in allowed_types:
            return jsonify({"error": "Invalid file type. Only JPEG, PNG and PDF allowed"}), 400

        filename = secure_filename(file.filename)
        file_bytes = file.read()

        # Convert to base64
        image_parts = [
            {
                "mime_type": file.mimetype,
                "data": base64.b64encode(file_bytes).decode("utf-8")
            }
        ]

        prompt = """
        Extract important financial or identity details from this document.
        Focus on:
        - Income information
        - Payment history
        - Credit score
        - Identity verification
        Output in plain text format.
        """

        response = model.generate_content(
            contents=[{"parts": [{"text": prompt}, {"inline_data": image_parts[0]}]}]
        )

        if not response.text:
            raise ValueError("No text extracted from document")

        return jsonify({
            "extracted_text": response.text,
            "filename": filename
        }), 200

    except Exception as e:
        print(f"Document processing error: {str(e)}")  # Log error
        return jsonify({"error": "Failed to process document", "details": str(e)}), 500



# AI: Generate Trust Score using Gemini
@app.route("/ai/trust-score", methods=["POST"])
def trust_score():
    try:
        data = request.get_json()
        if not data or 'history' not in data:
            return jsonify({
                "error": "Missing history data in request"
            }), 400

        history_text = data.get("history")
        if not history_text:
            return jsonify({
                "error": "History text cannot be empty"
            }), 400

        prompt = f"""
        Based on the following user financial behavior, provide:
        1. A trust score between 0 and 100
        2. A brief explanation of the score

        User history: {history_text}

        Response format:
        Score: [number]
        Explanation: [text]
        """

        response = model.generate_content(prompt)
        if not response or not response.text:
            raise ValueError("Empty response from Gemini API")

        text_response = response.text
        
        # Extract score using regex
        score_match = re.search(r"Score:\s*(\d{1,3})", text_response, re.IGNORECASE)
        if not score_match:
            score = 50  # Default score if not found
        else:
            score = min(100, max(0, int(score_match.group(1))))  # Ensure score is 0-100

        # Extract explanation
        explanation_match = re.search(r"Explanation:\s*(.*)", text_response, re.IGNORECASE | re.DOTALL)
        explanation = explanation_match.group(1).strip() if explanation_match else text_response

        return jsonify({
            "trust_score": score,
            "explanation": explanation,
            "raw_response": text_response  # Helpful for debugging
        }), 200

    except Exception as e:
        print(f"Trust Score Error: {str(e)}")  # Log the actual error
        return jsonify({
            "error": "AI scoring failed",
            "details": str(e)
        }), 500






# ---- MAIN ----
if __name__ == "__main__":
    app.run(debug=True)