from datetime import datetime, timezone
from dateutil.relativedelta import relativedelta
from firebase_admin import firestore
from typing import Union, Optional

def calculate_total_due(
    principal: float,
    issue_date: Union[str, datetime],
    due_date: Union[str, datetime],
    current_date: Union[str, datetime]
) -> float:
    """
    Calculate total amount due including penalties for overdue loans.
    
    Args:
        principal: Original loan amount
        issue_date: Date loan was issued
        due_date: Date loan is due
        current_date: Current date for calculation
    
    Returns:
        float: Total amount due with penalties
        
    Raises:
        ValueError: If dates are invalid or principal is negative
    """
    # Validate principal
    if not isinstance(principal, (int, float)) or principal <= 0:
        raise ValueError("Principal must be a positive number")

    # Convert string dates to datetime objects and handle timezone-naive dates
    try:
        if isinstance(issue_date, str):
            issue_date = datetime.strptime(issue_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)

        if isinstance(due_date, str):
            due_date = datetime.strptime(due_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)

        if isinstance(current_date, str):
            current_date = datetime.strptime(current_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)

    except ValueError as e:
        raise ValueError(f"Invalid date format. Use YYYY-MM-DD: {str(e)}")

    # Validate date order
    if issue_date > due_date:
        raise ValueError("Issue date cannot be after due date")
    if issue_date > current_date:
        raise ValueError("Issue date cannot be after current date")

    # Return principal if not overdue
    if current_date <= due_date:
        return float(principal)

    # Calculate overdue months (capped at 2)
    delta = relativedelta(current_date, due_date)
    months_overdue = delta.years * 12 + delta.months
    if delta.days > 0:
        months_overdue += 1
    months_overdue = min(months_overdue, 2)

    # Calculate total due with 5% compound interest per month overdue
    total_due = principal * ((1 + 0.05) ** months_overdue)
    return round(total_due, 2)

def check_and_release_documents(
    db: firestore.Client,  # Pass firestore client as parameter
    uid: str,
    loan_id: str,
    due_date: Union[str, datetime],
    current_date: Union[str, datetime]
) -> bool:
    # Validate inputs
    if not uid or not loan_id:
        raise ValueError("User ID and Loan ID cannot be empty")

    # Convert string dates to datetime objects
    try:
        if isinstance(due_date, str):
            due_date = datetime.strptime(due_date, "%Y-%m-%d")
        if isinstance(current_date, str):
            current_date = datetime.strptime(current_date, "%Y-%m-%d")
    except ValueError as e:
        raise ValueError(f"Invalid date format. Use YYYY-MM-DD: {str(e)}")

    # Calculate overdue months
    delta = relativedelta(current_date, due_date)
    months_overdue = delta.years * 12 + delta.months
    if delta.days > 0:
        months_overdue += 1

    # Release documents if overdue more than 2 months
    if months_overdue > 2:
        try:
            db.collection("users").document(uid).collection("loans").document(loan_id).update({
                "documents_released": True,
                "release_date": firestore.SERVER_TIMESTAMP
            })
            return True
        except Exception as e:
            print(f"Failed to update document release status: {str(e)}")
            raise

    return False