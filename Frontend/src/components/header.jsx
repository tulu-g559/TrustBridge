import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userType");
    setUserType(role);
  }, [user]); 
  

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const AuthButton = () => {
    if (user) {
      return (
        <Button
          onClick={handleSignOut}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      );
    }

    return (
      <Link to="/auth-selector">
        <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full">
          Sign In
        </Button>
      </Link>
    );
  };

 const RoleLinks = () => {
    // For authenticated users
    if (userType === "borrower") {
      return (
        <>
          <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
          <Link to="/about" className="text-gray-300 hover:text-white">About</Link>
          <Link to="/borrower/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
          <Link to="/borrower/profile" className="text-gray-300 hover:text-white">Profile</Link>
        </>
      );
    }
    if (userType === "lender") {
      return (
        <>
          <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
          <Link to="/about" className="text-gray-300 hover:text-white">About</Link>
          <Link to="/lender/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
          <Link to="/lender/profile" className="text-gray-300 hover:text-white">Profile</Link>
        </>
      );
    }

    // For non-authenticated users - add this block
    return (
      <>
        <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
        <Link to="/about" className="text-gray-300 hover:text-white">About</Link>
        <Link to="/team" className="text-gray-300 hover:text-white">Team</Link>
      </>
    );
};

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/tlogofinal.png"
              alt="TrustBridge Logo"
              className="h-13 w-auto pr-2 pt-[2px]"
            />
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
              TrustBridge
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <RoleLinks />
          <AuthButton />
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <RoleLinks />
            {/* <LanguageSelector /> */}
            <div onClick={() => setIsMenuOpen(false)} className="w-full">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
