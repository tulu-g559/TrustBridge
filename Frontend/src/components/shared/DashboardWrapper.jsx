import React from "react";
import Header from "../header"; // Your existing header
import Sidebar from "./Sidebar";

const DashboardWrapper = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto bg-neutral-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardWrapper;
