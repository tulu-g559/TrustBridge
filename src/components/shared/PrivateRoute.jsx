import { Navigate, Outlet } from "react-router-dom";
import { auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

/**
 * PrivateRoute protects nested routes and optionally checks userType.
 * @param {string} requiredRole - 'borrower' or 'lender' (optional)
 */
export default function PrivateRoute({ requiredRole }) {
  const [user, loading] = useAuthState(auth);
  const role = localStorage.getItem("userType");

  // Still loading auth state or role not yet available
  if (loading || !role) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white bg-black">
        Checking authentication...
      </div>
    );
  }

  // User not logged in
  if (!user) {
    return <Navigate to="/auth-selector" replace />;
  }

  // Logged in but wrong role
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  // Access granted
  return <Outlet />;
}
