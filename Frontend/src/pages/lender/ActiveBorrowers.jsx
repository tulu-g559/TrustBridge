import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { Loader2, ExternalLink } from "lucide-react";

export default function ActiveBorrowers() {
  const [currentUser, authLoading, authError] = useAuthState(auth);
  const [loanRequests, setLoanRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const fetchLoanRequests = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        setFetchError(null);

        const q = query(
          collection(db, "loanRequests"),
          where("lenderId", "==", currentUser.uid),
          where("status", "==", "approved")
        );

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLoanRequests(results);
      } catch (error) {
        console.error("Error fetching loan requests:", error);
        setFetchError(
          "Failed to fetch active borrowers. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoanRequests();
  }, [currentUser]);

  if (authLoading || isLoading) {
    return (
      <DashboardWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </DashboardWrapper>
    );
  }

  if (authError || fetchError) {
    return (
      <DashboardWrapper>
        <div className="text-white p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{authError?.message || fetchError}</p>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <div className="text-white p-6">
        <h2 className="text-3xl font-bold mb-4 text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Active Borrowers
        </h2>

        {loanRequests.length === 0 ? (
          <p className="text-gray-400">No active borrowers found.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loanRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gray-800/50 backdrop-blur p-6 rounded-lg border border-gray-700 shadow-xl hover:border-purple-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-semibold text-blue-500">
                        {request.borrowerName}
                      </h3>
                      <span className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-s">
                        Due: {calculateDueDate(request.transferredAt)}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <p className="text-green-400 text-sm font-medium">
                      {request.status}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <p className="text-gray-400">
                      <span className="font-medium text-white">Amount:</span>{" "}
                      {request.amount} ETH
                    </p>
                    <p className="text-gray-400">
                      <span className="font-medium text-white">Interest:</span>{" "}
                      {request.interestRate}%
                    </p>
                    <p className="text-gray-400">
                      <span className="font-medium text-white">
                        Trust Score:
                      </span>{" "}
                      {request.trustScore}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-400">
                      <span className="font-medium text-white">Created:</span>{" "}
                      <span className="text-blue-300">
                        {formatDate(request.createdAt)}
                      </span>
                    </p>
                    <p className="text-gray-400">
                      <span className="font-medium text-white">
                        Transferred:
                      </span>{" "}
                      <span className="text-emerald-300">
                        {formatDate(request.transferredAt)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-400">
                    <span className="font-medium text-white">Reason:</span>{" "}
                    {request.reason}
                  </p>
                  {request.transactionHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${request.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors text-sm mt-2"
                    >
                      View Transaction <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}

const calculateDueDate = (transferredAt) => {
  if (!transferredAt) return "N/A";
  const dueDate = new Date(transferredAt.seconds * 1000);
  dueDate.setMonth(dueDate.getMonth() + 6);
  return dueDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};