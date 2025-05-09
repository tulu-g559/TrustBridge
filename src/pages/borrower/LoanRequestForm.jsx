import React, { useState } from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Sparkles } from "lucide-react";

export default function LoanRequestForm() {
  const [formData, setFormData] = useState({
    amount: "",
    reason: "",
    duration: "",
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting loan request:", formData);
    // TODO: Add API integration
  };

  return (
    <DashboardWrapper>
      <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded-2xl shadow-md text-white">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="text-purple-400" /> Request a New Loan
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-1">Amount (INR)</label>
            <Input
              type="number"
              name="amount"
              placeholder="e.g. 5000"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Reason for Loan</label>
            <Textarea
              name="reason"
              placeholder="Explain why you need this loan"
              rows={4}
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Repayment Duration (months)</label>
            <Input
              type="number"
              name="duration"
              placeholder="e.g. 6"
              value={formData.duration}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold w-full"
          >
            Submit Request
          </Button>
        </form>
      </div>
    </DashboardWrapper>
  );
}
