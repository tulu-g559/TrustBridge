import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { Wallet, Users, BarChart2 } from "lucide-react";
import { Loader2 } from "lucide-react";
import { flame } from "wagmi/chains";

export default function LenderDashboard() {
  const [currentUser] = useAuthState(auth);
  const [activeBorrowers, setActiveBorrowers] = useState(0);
  const [totalLent, setTotalLent] = useState(0);
  const [expectedReturns, setExpectedReturns] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchLoanStats = async () => {
      if (!currentUser) return;

      try {
        setIsLoading(true); // Start loading
        const q = query(
          collection(db, "loanRequests"),
          where("lenderId", "==", currentUser.uid),
          where("status", "==", "approved")
        );

        const querySnapshot = await getDocs(q);
        setActiveBorrowers(querySnapshot.size);

        let lentAmount = 0;
        let totalExpectedReturns = 0;

        querySnapshot.forEach((doc) => {
          const loan = doc.data();
          const amount = parseFloat(loan.amount);
          const interestRate = parseFloat(loan.interestRate);

          lentAmount += amount;
          // Calculate total expected return (principal + interest) for all loans
          const principalPlusInterest = amount + amount * (interestRate / 100);
          totalExpectedReturns += principalPlusInterest;
        });

        setTotalLent(lentAmount);
        setExpectedReturns(totalExpectedReturns);
      } catch (error) {
        console.error("Error fetching loan stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoanStats();
  }, [currentUser]);

  // Format currency helper
  const formatCurrency = (value) => {
    return value.toLocaleString("en-IN", {
      maximumFractionDigits: 3,
      style: "currency",
      currency: "ETH",
    });
  };

  const stats = [
    {
      label: "Total Lent",
      value: isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatCurrency(totalLent),
      icon: <Wallet className="w-6 h-6 text-green-400" />,
      color: "bg-green-900/40 border-green-700",
    },
    {
      label: "Active Borrowers",
      value: isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> :  activeBorrowers.toString(),
      icon: <Users className="w-6 h-6 text-blue-400" />,
      color: "bg-blue-900/40 border-blue-700",
      link: "/lender/active-borrowers",
    },
    {
      label: "Expected Returns",
      value:  isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : formatCurrency(expectedReturns),
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
        {stats.map((stat, index) => {
          const content = (
            <div
              className={`rounded-xl p-5 border ${stat.color} text-white shadow-md hover:bg-opacity-80 transition`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-black/40">{stat.icon}</div>
                <div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                  <div className="text-xl font-bold">{stat.value}</div>
                </div>
              </div>
            </div>
          );

          // Wrap in Link if 'link' field exists
          return stat.link && !isLoading ? (
            <Link key={index} to={stat.link}>
              {content}
            </Link>
          ) : (
            <div key={index}>{content}</div>
          );
        })}
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Recent Activity
        </h2>
        <ul className="space-y-3">
          <li className="bg-gray-800 rounded-md p-4">
            💸 You funded ₹5,000 to Aarti Sharma
          </li>
          <li className="bg-gray-800 rounded-md p-4">
            📨 Loan request received from Ramesh B.
          </li>
          <li className="bg-gray-800 rounded-md p-4">
            ✅ Repayment received from Sunita K.
          </li>
        </ul>
      </section>
    </DashboardWrapper>
  );
}