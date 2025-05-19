import React, { useState, useEffect } from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { BadgeCheck, FileText, TrendingUp, Loader2 } from "lucide-react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';

export default function BorrowerDashboard() {
  const [currentUser] = useAuthState(auth);
  const [borrowedAmount, setBorrowedAmount] = useState(0);
  const [nextDueDate, setNextDueDate] = useState(null);
  const [trustScore, setTrustScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowerStats = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true);
        // Fetch loans
        const q = query(
          collection(db, "loanRequests"),
          where("borrowerId", "==", currentUser.uid),
          where("status", "==", "approved")
        );

        const querySnapshot = await getDocs(q);
        let totalBorrowed = 0;
        let earliestDueDate = null;

        querySnapshot.forEach((doc) => {
          const loan = doc.data();
          totalBorrowed += parseFloat(loan.amount);
          
          // Calculate due date (6 months from transferred date)
          if (loan.transferredAt) {
            const dueDate = new Date(loan.transferredAt.seconds * 1000);
            dueDate.setMonth(dueDate.getMonth() + 6);
            
            if (!earliestDueDate || dueDate < earliestDueDate) {
              earliestDueDate = dueDate;
            }
          }
        });

        setBorrowedAmount(totalBorrowed);
        setNextDueDate(earliestDueDate);

        // Fetch trust score
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.data();
        setTrustScore(userData?.trust_score?.current ?? null);

      } catch (error) {
        console.error("Error fetching borrower stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBorrowerStats();
  }, [currentUser]);

  const formatCurrency = (value) => {
    return value.toLocaleString("en-IN", {
      maximumFractionDigits: 3,
      style: "currency",
      currency: "ETH",
    });
  };

  const formatDueDate = (date) => {
    if (!date) return "No due date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const stats = [
    {
      label: "Borrowed Amount",
      value: isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatCurrency(borrowedAmount),
      icon: <FileText className="w-6 h-6 text-blue-400" />,
      color: "bg-blue-900/40 border-blue-700",
    },
    {
      label: "Next Due",
      value: isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatDueDate(nextDueDate),
      icon: <BadgeCheck className="w-6 h-6 text-yellow-400" />,
      color: "bg-yellow-900/40 border-yellow-700",
    },
    {
      label: "Trust Score",
      value: isLoading
        ? <Loader2 className="w-5 h-5 animate-spin" />
        : trustScore !== null
          ? `${trustScore} / 100`
          : "N/A",
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
          <li className="bg-gray-800 rounded-md p-4">🎯 Trust Score updated to {trustScore ?? "N/A"}</li>
        </ul>
      </section>
    </DashboardWrapper>
  );
}