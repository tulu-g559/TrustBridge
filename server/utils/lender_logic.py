from firebase_admin import firestore

def register_lender(db, uid, lender_data):
    try:
        info_ref = db.collection("lenders").document(uid).collection("info").document("metadata")
        info_ref.set(lender_data)
        return {"status": "success", "message": "Lender registered"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def post_lender_offer(db, uid, offer_data):
    try:
        offer_ref = db.collection("lenders").document(uid).collection("offers")
        offer_ref.add(offer_data)
        return {"status": "success", "message": "Offer posted"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def get_lender_offers(db, uid):
    try:
        offers = db.collection("lenders").document(uid).collection("offers").stream()
        return [doc.to_dict() | {"id": doc.id} for doc in offers]
    except Exception as e:
        return {"status": "error", "message": str(e)}

def fetch_all_borrowers(db):
    users_ref = db.collection("users")
    borrowers = []

    for user_doc in users_ref.stream():
        uid = user_doc.id
        loans = db.collection("users").document(uid).collection("loans").stream()

        for loan in loans:
            loan_data = loan.to_dict()
            if loan_data.get("status") == "pending":
                borrowers.append({
                    "uid": uid,
                    "loan_id": loan.id,
                    "amount": loan_data.get("amount"),
                    "purpose": loan_data.get("purpose"),
                    "timestamp": str(loan_data.get("timestamp")),
                    "wallet": loan_data.get("wallet"),
                    "status": loan_data.get("status", "unknown")
                })

    return borrowers