import React from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { CheckCircle, Clock, BadgeDollarSign } from "lucide-react";

export default function RepaymentTracker() {
  // Sample data — replace with actual repayment data
  const repayments = [
    { id: "rep001", borrower: "Sunita K.", amount: 2000, status: "paid", date: "2025-05-05" },
    { id: "rep002", borrower: "Ramesh B.", amount: 1500, status: "due", date: "2025-05-10" },
  ];

  return (
    <DashboardWrapper>
      <h1 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
        Repayment Tracker
      </h1>

      <div className="space-y-4">
        {repayments.map((item) => (
          <div
            key={item.id}
            className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex justify-between items-center"
          >
            <div>
              <div className="text-lg font-semibold flex items-center gap-2">
                <BadgeDollarSign className="w-5 h-5 text-purple-400" />
                ₹{item.amount} from {item.borrower}
              </div>
              <p className="text-sm text-gray-400">Due: {item.date}</p>
            </div>
            <div className="flex items-center gap-2">
              {item.status === "paid" ? (
                <CheckCircle className="text-green-400" />
              ) : (
                <Clock className="text-yellow-400" />
              )}
              <span
                className={`text-sm font-medium ${
                  item.status === "paid" ? "text-green-400" : "text-yellow-300"
                }`}
              >
                {item.status === "paid" ? "Paid" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardWrapper>
  );
}
