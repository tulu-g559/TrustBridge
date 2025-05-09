import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { HandCoins, User, Timer } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function LoanRequests() {
  const [user] = useAuthState(auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch loan requests for current lender
  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      try {
        const q = query(
          collection(firestore, "loanRequests"),
          where("lenderId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRequests(data);
      } catch (error) {
        console.error("Error fetching loan requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      const requestRef = doc(firestore, "loanRequests", id);
      await updateDoc(requestRef, { status });
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <DashboardWrapper>
        <div className="text-white">Loading requests...</div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <h1 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Pending Loan Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-gray-400">No requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-gray-900 p-5 border border-gray-700 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <User className="w-5 h-5 text-blue-400" />
                  {req.borrowerName || "Borrower"}
                </div>
                <p className="text-sm text-gray-400">Reason: {req.reason}</p>
                <p className="text-sm text-gray-400">
                  Amount: ₹{req.amount} | Interest: {req.interest}%
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  Trust Score: <span className="text-green-400">{req.trustScore}</span>
                </p>
                <p className="text-sm mt-1">
                  Status:{" "}
                  <span
                    className={`${
                      req.status === "approved"
                        ? "text-green-400"
                        : req.status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {req.status}
                  </span>
                </p>
              </div>

              {req.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateStatus(req.id, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => updateStatus(req.id, "rejected")}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardWrapper>
  );
}
