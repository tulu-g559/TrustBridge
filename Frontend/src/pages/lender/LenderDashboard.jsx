import React from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { Wallet, Users, BarChart2 } from "lucide-react";

export default function LenderDashboard() {
  // Example mock stats — replace with real data later
  const stats = [
    {
      label: "Total Lent",
      value: "₹75,000",
      icon: <Wallet className="w-6 h-6 text-green-400" />,
      color: "bg-green-900/40 border-green-700",
    },
    {
      label: "Active Borrowers",
      value: "12",
      icon: <Users className="w-6 h-6 text-blue-400" />,
      color: "bg-blue-900/40 border-blue-700",
    },
    {
      label: "Expected Returns",
      value: "₹8,450",
      icon: <BarChart2 className="w-6 h-6 text-purple-400" />,
      color: "bg-purple-900/40 border-purple-700",
    },
  ];

  return (
    <DashboardWrapper>
      <h1 className="text-3xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Welcome, Lender 👋
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
          <li className="bg-gray-800 rounded-md p-4">💸 You funded ₹5,000 to Aarti Sharma</li>
          <li className="bg-gray-800 rounded-md p-4">📨 Loan request received from Ramesh B.</li>
          <li className="bg-gray-800 rounded-md p-4">✅ Repayment received from Sunita K.</li>
        </ul>
      </section>
    </DashboardWrapper>
  );
}
