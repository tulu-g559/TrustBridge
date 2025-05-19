import React from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { UserCircle, ShieldCheck } from "lucide-react";

export default function BorrowerList() {
  // Mock data — replace with live data from Firestore
  const borrowers = [
    { id: "u001", name: "Aarti Sharma", trustScore: 720, email: "aarti@example.com" },
    { id: "u002", name: "Ramesh Verma", trustScore: 665, email: "ramesh@example.com" },
    { id: "u003", name: "Fatima B.", trustScore: 750, email: "fatima@example.com" },
  ];

  return (
    <DashboardWrapper>
      <h1 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        All Borrowers
      </h1>

      <div className="grid gap-4">
        {borrowers.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between bg-gray-900 border border-gray-700 p-4 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <UserCircle className="w-10 h-10 text-purple-400" />
              <div>
                <div className="font-semibold">{b.name}</div>
                <div className="text-sm text-gray-400">{b.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-green-300">{b.trustScore}</span>
            </div>
          </div>
        ))}
      </div>
    </DashboardWrapper>
  );
}