import { Navigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// Protected route for authenticated users - redirects to dashboard if already logged in
export function AuthRoute({ children }) {
    const [user, loading] = useAuthState(auth);
  
    if (loading) {
      return <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white/30 border-t-white animate-spin rounded-full" />
      </div>;
    }
  
    if (user) {
      // Redirect to home page if user is logged in
      return <Navigate to="/" replace />;
    }
  
    return children;
  }

// Protected route for non-authenticated users - redirects to login if not logged in
export function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-white/30 border-t-white animate-spin rounded-full" />
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth-selector" replace />;
  }

  return children;
}