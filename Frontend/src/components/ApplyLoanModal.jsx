"use client"

import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db, auth } from "../firebase"
import { Dialog } from "@headlessui/react"
import { Button } from "./ui/button"
import { toast } from "sonner"

export default function ApplyLoanModal({ isOpen, onClose, lender }) {
  const [amount, setAmount] = useState("")
  const [duration, setDuration] = useState("")

  const handleApply = async () => {
    const borrower = auth.currentUser
    if (!borrower) {
      toast.error("User not authenticated")
      return
    }

    try {
      // Create the loan request
      const requestRef = await addDoc(collection(db, "loanRequests"), {
        lenderId: lender.uid,
        borrowerId: borrower.uid,
        amount: Number(amount),
        duration,
        interestRate: lender.interestRate,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      // Create a notification for the lender
      await addDoc(collection(db, "notifications"), {
        userId: lender.uid,
        type: "loan_request",
        message: `New loan request from ${borrower.email}`,
        requestId: requestRef.id,
        status: "unread",
        createdAt: serverTimestamp(),
      })

      toast.success("Loan request submitted successfully")
      onClose()
    } catch (error) {
      console.error("Loan request error:", error)
      toast.error("Failed to send loan request")
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-60">
        <Dialog.Panel className="bg-zinc-900 text-white rounded-xl shadow-xl w-full max-w-md p-6">
          <Dialog.Title className="text-xl font-semibold mb-4">Apply for Loan</Dialog.Title>

          <div className="mb-2">To Lender: <span className="text-purple-400">{lender.uid}</span></div>
          <div className="mb-4">Interest Rate: <span className="text-green-400">{lender.interestRate}%</span></div>

          <input
            type="number"
            placeholder="Loan Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 mb-3 rounded bg-zinc-800 border border-zinc-700"
          />

          <input
            type="text"
            placeholder="Repayment Duration (e.g., 6 months)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 mb-4 rounded bg-zinc-800 border border-zinc-700"
          />

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleApply}>Submit</Button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}