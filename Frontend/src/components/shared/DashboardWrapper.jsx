import React from "react";
import Header from "../header"; // Your existing header
import Footer from "../footer"; // Your existing footer
import Sidebar from "./Sidebar"; // Import the updated Sidebar

const DashboardWrapper = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col overflow-x-hidden">
      <Header />
      <div className="p-4">
        <Sidebar /> {/* Sidebar now behaves as a dropdown menu */}
      </div>
      <main className="flex-1 p-6 overflow-y-auto bg-neutral-900">{children}</main>
      <Footer />
    </div>
  );
};

export default DashboardWrapper;