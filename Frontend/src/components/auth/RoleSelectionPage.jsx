import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    localStorage.setItem("userType", role);
    navigate(`/auth/${role}`);
  };
  

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to TrustBridge</h1>
        <p style={styles.subtitle}>Choose your role to continue:</p>
        <button style={styles.buttonBorrower} onClick={() => handleSelectRole("borrower")}>
          Continue as Borrower
        </button>
        <button style={styles.buttonLender} onClick={() => handleSelectRole("lender")}>
          Continue as Lender
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "linear-gradient(to bottom right, #6a11cb, #2575fc)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "rgba(0, 0, 0, 0.6)",
    padding: "40px",
    borderRadius: "16px",
    textAlign: "center",
    color: "white",
    boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
    backdropFilter: "blur(10px)",
  },
  title: {
    fontSize: "28px",
    marginBottom: "10px",
  },
  subtitle: {
    marginBottom: "30px",
    color: "#ccc",
  },
  buttonBorrower: {
    width: "100%",
    padding: "12px",
    marginBottom: "10px",
    backgroundColor: "#8e44ad",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
  buttonLender: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2980b9",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default RoleSelectionPage;
