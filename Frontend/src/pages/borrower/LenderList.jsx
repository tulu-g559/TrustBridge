import React, { useEffect, useState } from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, query, addDoc, serverTimestamp } from "firebase/firestore";
import { HandCoins, Percent, BadgeCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

const LenderList = () => {
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    const fetchLenders = async () => {
      try {
        const q = query(collection(db, "lenders"));
        const snapshot = await getDocs(q);

        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (lender) =>
              lender.maxAmount &&
              lender.interestRate &&
              !isNaN(parseFloat(lender.maxAmount)) &&
              !isNaN(parseFloat(lender.interestRate))
          );

        setLenders(data);
      } catch (err) {
        console.error("Error fetching lenders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLenders();
  }, []);

  const [user] = useAuthState(auth);

  const handleApply = async (lender) => {
    if (!user) {
      toast.error("Please log in to apply for a loan.");
      return;
    }

    setApplyingId(lender.id);
    try {
      await addDoc(collection(db, "loanRequests"), {
        lenderId: lender.id,
        borrowerId: user.uid,
        borrowerName: user.displayName || "Anonymous",
        amount: lender.maxAmount,
        interestRate: lender.interestRate,
        trustScore: "N/A", // or calculate based on borrower data
        reason: "Need a loan", // Optional: show a modal to collect reason
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast.success("Loan request sent!");
    } catch (err) {
      console.error("Error sending loan request:", err);
      toast.error("Failed to send request.");
    }
    setApplyingId(null);
  };

  return (
    <DashboardWrapper>
      <h1 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Available Lenders
      </h1>

      {loading ? (
        <p className="text-gray-400">Loading lenders...</p>
      ) : lenders.length === 0 ? (
        <p className="text-gray-400">No lenders available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lenders.map((lender) => (
            <div
              key={lender.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-purple-500/30 transition"
            >
              <div className="flex items-center gap-3 mb-2">
                <BadgeCheck className="text-green-400" />
                <h2 className="text-lg font-semibold">{lender.name || "Verified Lender"}</h2>
              </div>
              <p className="text-gray-400 mb-1 flex items-center gap-2">
                <HandCoins size={16} className="text-yellow-400" />
                Max Lend Amount:{" "}
                <span className="text-white font-medium">${lender.maxAmount}</span>
              </p>
              <p className="text-gray-400 mb-1 flex items-center gap-2">
                <Percent size={16} className="text-blue-400" />
                Interest Rate:{" "}
                <span className="text-white font-medium">{lender.interestRate}%</span>
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Location: {lender.location || "Anywhere"}
              </p>
              <Button
                className="bg-purple-600 hover:bg-purple-700 w-full"
                onClick={() => handleApply(lender)}
                disabled={applyingId === lender.id}
              >
                {applyingId === lender.id ? "Applying..." : "Apply for Loan"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardWrapper>
  );
};

export default LenderList;