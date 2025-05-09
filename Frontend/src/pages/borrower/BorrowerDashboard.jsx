import React from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { BadgeCheck, FileText, TrendingUp } from "lucide-react";

export default function BorrowerDashboard() {
  // Mock stats (replace with live data as needed)
  const stats = [
    {
      label: "Borrowed Amount",
      value: "₹10,000",
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      color: "bg-blue-900/40 border-blue-700",
    },
    {
      label: "Next Due",
      value: "₹3,333 on May 30",
      icon: <BadgeCheck className="w-6 h-6 text-yellow-400" />,
      color: "bg-yellow-900/40 border-yellow-700",
    },
    {
      label: "Trust Score",
      value: "762",
      icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
      color: "bg-purple-900/40 border-purple-700",
    },
  ];

  return (
    <DashboardWrapper>
      <h1 className="text-3xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Welcome, Borrower 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-xl p-5 border ${stat.color} text-white shadow-md`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-black/40">{stat.icon}</div>
              <div>
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className="text-xl font-bold">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-white">Recent Activity</h2>
        <ul className="space-y-3">
          <li className="bg-gray-800 rounded-md p-4">✅ Last payment of ₹3,333 paid on Apr 30</li>
          <li className="bg-gray-800 rounded-md p-4">📨 New loan offer approved: ₹5,000</li>
          <li className="bg-gray-800 rounded-md p-4">🎯 Trust Score updated to 762</li>
        </ul>
      </section>
    </DashboardWrapper>
  );
}
