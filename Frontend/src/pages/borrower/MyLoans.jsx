import React from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { BadgeCheck, FileText, Clock } from "lucide-react";

export default function MyLoans() {
  // Example data — replace with actual data from Firebase or API
  const loans = [
    {
      id: "LOAN001",
      amount: 5000,
      status: "approved",
      dueDate: "2025-06-15",
      repaid: false,
    },
    {
      id: "LOAN002",
      amount: 3000,
      status: "repaid",
      dueDate: "2025-04-10",
      repaid: true,
    },
  ];

  return (
    <DashboardWrapper>
      <h1 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        My Loans
      </h1>

      <div className="space-y-4">
        {loans.map((loan) => (
          <div
            key={loan.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex justify-between items-center text-white"
          >
            <div>
              <div className="text-sm text-gray-400">Loan ID: {loan.id}</div>
              <div className="text-lg font-bold">₹{loan.amount}</div>
              <div className="text-sm text-gray-400">Due: {loan.dueDate}</div>
            </div>
            <div className="flex items-center gap-2">
              {loan.repaid ? (
                <BadgeCheck className="text-green-400" />
              ) : (
                <Clock className="text-yellow-400" />
              )}
              <span className={`text-sm font-medium ${loan.repaid ? "text-green-400" : "text-yellow-300"}`}>
                {loan.repaid ? "Repaid" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardWrapper>
  );
}
