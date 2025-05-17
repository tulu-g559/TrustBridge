import { Button } from "../components/ui/button"
import { Mic, User } from "lucide-react"
import {Link} from "react-router-dom"
import { useEffect, useState } from "react"

export default function HeroSection() {

  const [role, setRole] = useState(null);
  useEffect(() => {
      const userType = localStorage.getItem("userType");
      setRole(userType);
    }, []);
    
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 to-transparent"></div>

      {/* Floating elements for visual interest */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Reimagining Trust.
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Unlocking Opportunity.
            </span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Access microloans without traditional credit scores. Powered by AI and blockchain technology to help
            underserved individuals build financial freedom.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {role === "borrower" && (
          <Link to="/trustscore">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full px-8 py-6 text-lg">
              Get Your Trust Score
            </Button>
            </Link>
            )}
            {role === "lender" && (
              <Link to="/lender/dashboard">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full px-8 py-6 text-lg">
              Dashboard
            </Button>
            </Link>
            )}

            {role === "borrower" && (
          <Link to="/borrower/profile">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white rounded-full px-6 py-6 flex items-center gap-2"
            >
              <User size={18} />
              <span>Check Profile</span>
            </Button>
            </Link>
            )}
            {role === "lender" && (
              <Link to="/lender/profile">
            <Button
              variant="outline"
              className="border-gray-700 text-gray-300 hover:text-white rounded-full px-6 py-6 flex items-center gap-2"
            >
              <User size={18} />
              <span>Check Profile</span>
            </Button>
            </Link>
            )}
          </div>

          <div className="mt-12 flex items-center justify-center">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center border-2 border-black"
                >
                  <span className="text-xs font-bold text-white">{i}</span>
                </div>
              ))}
            </div>
            <div className="ml-4 text-gray-300">
              <span className="font-bold text-white">1,000+</span> people funded this month
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
