import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, User, FileText, Send, Users, BookOpen, Search} from "lucide-react";

const Sidebar = () => {
  const [role, setRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    setRole(userType);
  }, []);

  const isActive = (path) => location.pathname.includes(path);

  const baseStyle = "flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-800 transition";
  const activeStyle = "bg-gray-800 text-white";

  return (
    <aside className="bg-black text-gray-300 w-full md:w-64 h-full p-4 border-r border-gray-800">
      <h2 className="text-xl font-semibold text-purple-400 mb-4">Dashboard</h2>
      <nav className="flex flex-col space-y-2">
        {role === "borrower" && (
          <>
            <Link to="/borrower/dashboard" className={`${baseStyle} ${isActive("/borrower/dashboard") ? activeStyle : ""}`}>
              <Home size={18} /> Dashboard
            </Link>
            {/* <Link to="/borrower/loan-request" className={`${baseStyle} ${isActive("/loan-request") ? activeStyle : ""}`}>
              <Send size={18} /> Request Loan
            </Link> */}
            <Link to="/borrower/loans" className={`${baseStyle} ${isActive("/loans") ? activeStyle : ""}`}>
              <FileText size={18} /> My Loans
            </Link>
            <Link to="/borrower/find-lenders" className={`${baseStyle} ${isActive("/loans") ? activeStyle : ""}`}>
              <Search size={18} /> Find Lenders
            </Link>
            {/* <Link to="/borrower/profile" className={`${baseStyle} ${isActive("/profile") ? activeStyle : ""}`}>
              <User size={18} /> Profile
            </Link> */}
          </>
        )}

        {role === "lender" && (
          <>
            <Link to="/lender/dashboard" className={`${baseStyle} ${isActive("/lender/dashboard") ? activeStyle : ""}`}>
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/lender/requests" className={`${baseStyle} ${isActive("/requests") ? activeStyle : ""}`}>
              <Users size={18} /> Loan Requests
            </Link>
            <Link to="/lender/repayments" className={`${baseStyle} ${isActive("/repayments") ? activeStyle : ""}`}>
              <BookOpen size={18} /> Repayments
            </Link>
            <Link to="/lender/preferences" className={`${baseStyle} ${isActive("/repayments") ? activeStyle : ""}`}>
              <BookOpen size={18} /> Preferences
            </Link>
            {/* <Link to="/lender/profile" className={`${baseStyle} ${isActive("/profile") ? activeStyle : ""}`}>
              <User size={18} /> Profile
            </Link> */}
          </>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
