// src/pages/lender/LendForm.jsx
import { useState } from "react";
import { db, auth } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "../../components/ui/button";

export default function LendForm() {
  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("");
  const [user] = useAuthState(auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    await setDoc(doc(db, "lenders", user.uid), {
      uid: user.uid,
      maxAmount: parseFloat(amount),
      interestRate: parseFloat(interest),
    });

    alert("Lending preferences saved!");
    setAmount("");
    setInterest("");
  };

  return (
    <div className="bg-black min-h-screen text-white p-6">
      <h2 className="text-2xl font-bold mb-4">Set Your Lending Preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Max Lending Amount"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded"
        />
        <input
          type="number"
          step="0.01"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          placeholder="Interest Rate (%)"
          className="w-full px-4 py-2 bg-gray-800 text-white rounded"
        />
        <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white w-full">
          Save Preferences
        </Button>
      </form>
    </div>
  );
}
