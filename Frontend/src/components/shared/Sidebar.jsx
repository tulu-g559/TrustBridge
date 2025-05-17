import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, Search, Users, CreditCard, BookOpen, ShieldCheck } from "lucide-react";

const Sidebar = () => {
  const [role, setRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle dropdown menu
  const location = useLocation();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    setRole(userType);
  }, []);

  const isActive = (path) => location.pathname.includes(path);

  const baseStyle = "flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-800 transition";
  const activeStyle = "bg-gray-800 text-white";

  return (
    <div className="relative">
      {/* Menu Toggle Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="bg-black text-gray-300 px-4 py-2 rounded hover:bg-gray-800 transition"
      >
        {isMenuOpen ? "Close Menu" : "Open Menu"}
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 bg-black text-gray-300 w-64 mt-2 rounded shadow-lg z-50">
          <div className="p-4">
            {role === "borrower" && (
              <>
                <Link
                  to="/borrower/dashboard"
                  className={`${baseStyle} ${isActive("/borrower/dashboard") ? activeStyle : ""}`}
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  <Home size={18} /> Dashboard
                </Link>
                <Link
                  to="/trustscore"
                  className={`${baseStyle} ${isActive("/trustscore") ? activeStyle : ""}`}
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  <ShieldCheck size={18} /> Trust Score
                </Link>
                <Link
                  to="/borrower/find-lenders"
                  className={`${baseStyle} ${isActive("/find-lenders") ? activeStyle : ""}`}
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  <Search size={18} /> Find Lenders
                </Link>
                <Link
                  to="/borrower/repay"
                  className={`${baseStyle} ${isActive("/borrower/repay") ? activeStyle : ""}`}
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  <FileText size={18} /> Repay Loan
                </Link>
              </>
            )}

            {role === "lender" && (
              <>
                <Link
                  to="/lender/dashboard"
                  className={`${baseStyle} ${isActive("/lender/dashboard") ? activeStyle : ""}`}
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  <Home size={18} /> Dashboard
                </Link>
                <Link
                  to="/lender/requests"
                  className={`${baseStyle} ${isActive("/requests") ? activeStyle : ""}`}
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  <Users size={18} /> Loan Requests
                </Link>
                <Link
                  to="/lender/repayments"
                  className={`${baseStyle} ${isActive("/repayments") ? activeStyle : ""}`}
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  <CreditCard size={18} /> Repayments
                </Link>
                <Link
                  to="/lender/preferences"
                  className={`${baseStyle} ${isActive("/preferences") ? activeStyle : ""}`}
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  <BookOpen size={18} /> Preferences
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;