import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { Dialog } from "@headlessui/react";
import { Button } from "./ui/button";

export default function ApplyLoanModal({ isOpen, onClose, lender }) {
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");

  const handleApply = async () => {
    const borrower = auth.currentUser;
    if (!borrower) return;

    await addDoc(collection(db, "loanRequests"), {
      lenderId: lender.uid,
      borrowerId: borrower.uid,
      amount: Number(amount),
      duration,
      interestRate: lender.interestRate,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    onClose();
    alert("Loan request sent!");
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-70">
        <Dialog.Panel className="bg-gray-900 rounded-lg p-6 max-w-md w-full text-white">
          <Dialog.Title className="text-lg font-semibold mb-4">Apply for Loan</Dialog.Title>
          <p className="mb-2">To Lender: <span className="text-purple-400">{lender.uid}</span></p>
          <p className="mb-4">Interest Rate: {lender.interestRate}%</p>

          <input
            type="number"
            placeholder="Loan Amount"
            className="w-full mb-3 p-2 rounded bg-gray-800 border border-gray-700"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Repayment Duration (e.g., 6 months)"
            className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleApply}>Submit</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
