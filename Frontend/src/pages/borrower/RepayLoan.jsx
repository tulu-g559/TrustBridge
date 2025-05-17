import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { db, auth } from "../../firebase";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const SEPOLIA_CHAIN_ID = 11155111;

export default function RepayLoan() {
  const [user] = useAuthState(auth);
  const { address: borrowerAddress, isConnected } = useAccount();
  const [approvedLoans, setApprovedLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchApprovedLoans = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const q = query(
        collection(db, "loanRequests"),
        where("borrowerId", "==", user.uid),
        where("status", "==", "approved")
      );

      const snapshot = await getDocs(q);

      const loansData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const loan = { id: docSnap.id, ...docSnap.data() };

          try {
            // Get lender details from lenders collection
            const lenderDoc = await getDoc(doc(db, "lenders", loan.lenderId));
            if (!lenderDoc.exists()) {
              console.log(`Lender ${loan.lenderId} not found for loan ${loan.id}`);
              return null;
            }

            const lenderData = lenderDoc.data();
            
            // Get repayments for this loan
            const repaymentsQuery = query(
              collection(db, "repayments"),
              where("loanId", "==", docSnap.id),
              where("borrowerId", "==", user.uid)
            );
            const repaymentsSnapshot = await getDocs(repaymentsQuery);
            const repayments = repaymentsSnapshot.docs;

            // Calculate loan details
            const totalAmount = parseFloat(loan.amount);
            const interestRate = parseFloat(loan.interestRate);
            const totalWithInterest = totalAmount * (1 + interestRate / 100);
            const emi = totalWithInterest / 6;

            // Get stored and actual repayments
            const storedRepayments = loan.repaidInstallments || 0;
            const actualRepayments = repayments.length;
            const repaidInstallments = Math.max(storedRepayments, actualRepayments);

            return {
              ...loan,
              lenderWallet: lenderData.walletAddress,
              lenderName: lenderData.name || "Anonymous",
              repaidInstallments,
              totalAmount,
              totalWithInterest,
              emi,
              remainingAmount: totalWithInterest - (repaidInstallments * emi),
              lastRepaymentHash: loan.lastRepaymentHash,
              lastRepaymentDate: loan.lastRepaymentDate?.toDate()
            };
          } catch (error) {
            console.error(`Error processing loan ${loan.id}:`, error);
            return null;
          }
        })
      );

      // Filter out invalid loans
      const validLoans = loansData.filter(loan =>
        loan &&
        ethers.isAddress(loan.lenderWallet) &&
        loan.repaidInstallments < 6
      );

      setApprovedLoans(validLoans);

    } catch (error) {
      console.error("Error fetching approved loans:", error);
      toast.error("Failed to load approved loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isConnected) {
      fetchApprovedLoans();
    }
  }, [user, isConnected]);

  const handleSelect = async (loan) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!loan.lenderWallet || !ethers.isAddress(loan.lenderWallet)) {
      toast.error("Invalid lender wallet address");
      return;
    }

    if (loan.repaidInstallments >= 6) {
      toast.error("All installments have been paid");
      return;
    }

    setSelectedLoan(loan);
  };

  const handleRepayInstallment = async () => {
    if (!selectedLoan || !isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!selectedLoan.lenderWallet || !ethers.isAddress(selectedLoan.lenderWallet)) {
      toast.error("Invalid lender wallet address");
      return;
    }

    setProcessing(true);

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      // Initialize provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Check network
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(SEPOLIA_CHAIN_ID)) {
        throw new Error("Please switch to Sepolia network");
      }

      // Check balance
      const balance = await provider.getBalance(borrowerAddress);
      const amountInWei = ethers.parseEther(selectedLoan.emi.toString());
      if (balance < amountInWei) {
        throw new Error("Insufficient Sepolia ETH balance");
      }

      // Send transaction
      const tx = await signer.sendTransaction({
        to: selectedLoan.lenderWallet,
        value: amountInWei,
        gasLimit: 21000
      });

      toast.info("Transaction submitted, waiting for confirmation...");

      // Wait for confirmation
      const receipt = await tx.wait();

      // Record repayment in Firebase
      await addDoc(collection(db, "repayments"), {
        loanId: selectedLoan.id,
        borrowerId: user.uid,
        lenderId: selectedLoan.lenderId,
        amount: selectedLoan.emi,
        transactionHash: receipt.hash,
        installmentNumber: selectedLoan.repaidInstallments + 1,
        createdAt: serverTimestamp(),
      });

      // Update loan document
      const loanDocRef = doc(db, "loanRequests", selectedLoan.id);
      await updateDoc(loanDocRef, {
        repaidInstallments: increment(1),
        lastRepaymentHash: receipt.hash,
        lastRepaymentDate: serverTimestamp(),
        remainingAmount: selectedLoan.remainingAmount - selectedLoan.emi
      });

      await fetchApprovedLoans();
      
      toast.success(`Installment ${selectedLoan.repaidInstallments + 1} of 6 paid successfully!`, {
        action: {
          label: "View Transaction",
          onClick: () => window.open(`https://sepolia.etherscan.io/tx/${receipt.hash}`, '_blank')
        },
      });

      setSelectedLoan(null);
    } catch (error) {
      console.error("Repayment failed:", error);
      toast.error(error.message || "Failed to process repayment");
    } finally {
      setProcessing(false);
    }
  };

  const calculateEMI = (amount, rate) => {
    const total = amount * (1 + rate / 100);
    return total / 6;
  };

  return (
    <DashboardWrapper>
      <h1 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
        Repay Approved Loans
      </h1>

      {!isConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <p className="text-yellow-400">Please connect your wallet to make repayments</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : approvedLoans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No approved loans to repay.</p>
        </div>
      ) : selectedLoan ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Repayment to {selectedLoan.lenderName || "Lender"}
          </h2>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-300">
              Principal: {selectedLoan.totalAmount.toFixed(2)} SEP
            </p>
            <p className="text-sm text-gray-300">
              Total with Interest: {selectedLoan.totalWithInterest.toFixed(2)} SEP
            </p>
            <p className="text-sm text-gray-300">
              Monthly EMI: {selectedLoan.emi.toFixed(2)} SEP
            </p>
            <p className="text-sm text-gray-300">
              Remaining: {selectedLoan.remainingAmount.toFixed(2)} SEP
            </p>
            <p className="text-sm text-gray-300">
              Lender: {selectedLoan.lenderWallet?.slice(0, 6)}...{selectedLoan.lenderWallet?.slice(-4)}
            </p>
            <p className="text-sm text-gray-400">
              Installments Paid: {selectedLoan.repaidInstallments || 0} / 6
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              disabled={
                selectedLoan.repaidInstallments >= 6 ||
                processing ||
                !isConnected
              }
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50"
              onClick={handleRepayInstallment}
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                "Pay Installment"
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setSelectedLoan(null)}
            >
              Back
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedLoans.map((loan) => (
            <div
              key={loan.id}
              className="bg-gray-800 p-5 border border-gray-700 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold text-white mb-2">
                {loan.lenderName || "Lender"}
              </h3>
              <div className="space-y-2 mb-3">
                <p className="text-sm text-gray-400">
                  Principal: {loan.totalAmount.toFixed(2)} SEP
                </p>
                <p className="text-sm text-gray-400">
                  Interest Rate: {loan.interestRate}%
                </p>
                <p className="text-sm text-gray-400">
                  Monthly EMI: {loan.emi.toFixed(2)} SEP
                </p>
                <p className="text-sm text-gray-400">
                  Remaining: {loan.remainingAmount.toFixed(2)} SEP
                </p>
                <p className="text-sm text-gray-400">
                  Installments: {loan.repaidInstallments || 0}/6
                </p>
              </div>
              
              {loan.lastRepaymentHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${loan.lastRepaymentHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mb-3"
                >
                  View Last Payment
                  <Loader2 className="w-3 h-3" />
                </a>
              )}
              
              <Button
                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50"
                onClick={() => handleSelect(loan)}
                disabled={!isConnected || loan.repaidInstallments >= 6}
              >
                {loan.repaidInstallments >= 6 ? "Fully Paid" : "Repay"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardWrapper>
  );
}