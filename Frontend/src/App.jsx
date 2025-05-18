import { Routes, Route } from "react-router-dom";
import About from "./pages/about";
import Home from "./pages/home";
import ScrollToTop from "./components/ui/ScrollToTop";
import RoleSelectionPage from "./components/auth/RoleSelectionPage";
import AuthBorrower from "./components/auth/AuthBorrower";
import AuthLender from "./components/auth/AuthLender";
import { AuthRoute } from "./components/auth/ProtectedRoute";
import PrivateRoute from "./components/shared/PrivateRoute";
import Profile from "./pages/Profile"
import TrustScore from "./pages/TrustScore";
import Team from "./pages/members"
import LenderPreferencesForm from "./pages/lender/LenderPreferencesForm";
import LenderList from "./pages/borrower/LenderList";
import DocPage from "./pages/documents";


// Borrower Pages
import BorrowerDashboard from "./pages/borrower/BorrowerDashboard";
import LoanRequestForm from "./pages/borrower/LoanRequestForm";
import MyLoans from "./pages/borrower/MyLoans";
import RepayLoan from "./pages/borrower/RepayLoan";

// Lender Pages
import LenderDashboard from "./pages/lender/LenderDashboard";
import LendForm from "./pages/lender/LendForm";
import LoanRequests from "./pages/lender/LoanRequests";
import BorrowerList from "./pages/lender/BorrowerList";
import RepaymentTracker from "./pages/lender/RepaymentTracker";

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/trustscore" element={<TrustScore />} />
        <Route path="/team" element={<Team />} />
        <Route path="/documents" element={<DocPage />} />
        <Route
          path="/auth-selector"
          element={
            <AuthRoute>
              <RoleSelectionPage />
            </AuthRoute>
          }
        />
        <Route
          path="/auth/borrower"
          element={
            <AuthRoute>
              <AuthBorrower />
            </AuthRoute>
          }
        />
        <Route
          path="/auth/lender"
          element={
            <AuthRoute>
              <AuthLender />
            </AuthRoute>
          }
        />

        {/* Borrower Dashboard Routes */}
        <Route element={<PrivateRoute requiredRole="borrower" />}>
          <Route path="/borrower/dashboard" element={<BorrowerDashboard />} />
          <Route path="/borrower/loan-request" element={<LoanRequestForm />} />
          <Route path="/borrower/loans" element={<MyLoans />} />
          <Route path="/borrower/repay" element={<RepayLoan />} />
          <Route path="/borrower/profile" element={<Profile />} />
        </Route>

        {/* Lender Dashboard Routes */}
        <Route element={<PrivateRoute requiredRole="lender" />}>
          <Route path="/lender/dashboard" element={<LenderDashboard />} />
          <Route path="/lender/lend" element={<LendForm />} />
          <Route path="/lender/requests" element={<LoanRequests />} />
          <Route path="/lender/borrowers" element={<BorrowerList />} />
          <Route path="/lender/repayments" element={<RepaymentTracker />} />
          <Route path="/lender/profile" element={<Profile />} />
          <Route path="/trustscore" element={<TrustScore />} />
        </Route>

        <Route path="/lender/preferences" element={<PrivateRoute requiredRole="lender" />}>
          <Route index element={<LenderPreferencesForm />} />
        </Route>

        <Route path="/borrower/find-lenders" element={<PrivateRoute requiredRole="borrower" />}>
          <Route index element={<LenderList />} />
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={
            <div className="p-10 text-white bg-black min-h-screen text-center">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </div>
  );
}
