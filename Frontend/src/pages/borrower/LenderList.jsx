import React, { useEffect, useState } from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { HandCoins, Percent, BadgeCheck } from "lucide-react";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { useAccount } from "wagmi";

const LenderList = () => {
  const [lenders, setLenders] = useState([]);
  const [loanRequests, setLoanRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [user] = useAuthState(auth);
  const { address: walletAddress, isConnected } = useAccount();

  // Fetch all lenders
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
        toast.error("Failed to fetch lenders.");
      }
    };

    fetchLenders();
  }, []);

  // Fetch all loan requests made by current borrower
  useEffect(() => {
    if (!user) return;

    const fetchLoanRequests = async () => {
      try {
        const q = query(
          collection(db, "loanRequests"),
          where("borrowerId", "==", user.uid)
        );
        const snapshot = await getDocs(q);

        const requestsMap = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          requestsMap[data.lenderId] = data.status;
        });

        setLoanRequests(requestsMap);
      } catch (err) {
        console.error("Error fetching loan requests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanRequests();
  }, [user]);

  const handleApply = async (lender) => {
    if (!user) {
      toast.error("Please log in to apply for a loan.");
      return;
    }

    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!walletAddress) {
      toast.error("Please connect your wallet to continue");
      return;
    }

    setApplyingId(lender.id);
    try {
      const borrowerDoc = await getDoc(doc(db, "users", user.uid));
      const borrowerData = borrowerDoc.data();

      if (!borrowerData?.walletAddress) {
        // Update borrower's wallet address if not set
        await updateDoc(doc(db, "users", user.uid), {
          walletAddress: walletAddress
        });
      }

      await addDoc(collection(db, "loanRequests"), {
        lenderId: lender.id,
        borrowerId: user.uid,
        borrowerName: borrowerData?.fullName || "Anonymous",
        borrowerWallet: walletAddress,
        amount: lender.maxAmount,
        interestRate: lender.interestRate,
        trustScore: "N/A",
        reason: "Need a loan",
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast.success("Loan request sent!");

      setLoanRequests((prev) => ({
        ...prev,
        [lender.id]: "pending",
      }));
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
          {lenders.map((lender) => {
            const status = loanRequests[lender.id];

            return (
              <div
                key={lender.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-purple-500/30 transition"
              >
                <div className="flex items-center gap-3 mb-2">
                  <BadgeCheck className="text-green-400" />
                  <h2 className="text-lg font-semibold">
                    {lender.name || "Verified Lender"}
                  </h2>
                </div>
                <p className="text-gray-400 mb-1 flex items-center gap-2">
                  <HandCoins size={16} className="text-yellow-400" />
                  Max Lend Amount:{" "}
                  <span className="text-white font-medium">
                    ₹{lender.maxAmount}
                  </span>
                </p>
                <p className="text-gray-400 mb-1 flex items-center gap-2">
                  <Percent size={16} className="text-blue-400" />
                  Interest Rate:{" "}
                  <span className="text-white font-medium">
                    {lender.interestRate}%
                  </span>
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  Location: {lender.location || "Anywhere"}
                </p>

                {!isConnected ? (
                  <Button
                    disabled
                    className="bg-gray-600 text-white w-full cursor-not-allowed"
                  >
                    Connect Wallet First
                  </Button>
                ) :
                   status === "approved" ? (
                    <Button disabled className="bg-green-700 text-white w-full cursor-default">
                      Approved
                    </Button>
                  ) : status === "rejected" ? (
                    <Button disabled className="bg-red-600 text-white w-full cursor-default">
                      Rejected
                    </Button>
                  ) : status === "pending" ? (
                    <Button disabled className="bg-yellow-600 text-white w-full cursor-default">
                      Applied
                    </Button>
                  ) : (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 w-full"
                      onClick={() => handleApply(lender)}
                      disabled={applyingId === lender.id}
                    >
                      {applyingId === lender.id ? "Applying..." : "Apply for Loan"}
                    </Button>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardWrapper>
  );
};

export default LenderList;
