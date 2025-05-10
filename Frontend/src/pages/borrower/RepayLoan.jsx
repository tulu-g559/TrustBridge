import React, { useState } from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { IndianRupee } from "lucide-react";

export default function RepayLoan() {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Repaying:", amount);
    // TODO: Integrate with payment API or blockchain
  };

  return (
    <DashboardWrapper>
      <div className="max-w-lg mx-auto bg-gray-900 p-8 rounded-2xl text-white shadow-md">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <IndianRupee className="text-green-400" /> Repay Loan
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-1">Repayment Amount (INR)</label>
            <Input
              type="number"
              placeholder="e.g. 3333"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 w-full text-white font-semibold"
          >
            Make Payment
          </Button>
        </form>
      </div>
    </DashboardWrapper>
  );
}
