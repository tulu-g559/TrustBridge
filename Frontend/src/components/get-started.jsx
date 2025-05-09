import { Button } from "../components/ui/button"
import { ArrowRight } from "lucide-react"
import {Link} from "react-router-dom"

export default function GetStarted() {
  return (
    <section id="get-started" className="py-20 bg-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-blue-900/10"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto bg-gray-900/70 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-gray-800">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Ready to Get Started?
            </h2>
            <p className="text-gray-300">
              Join thousands of people who have discovered financial opportunity through TrustBridge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">3 min</div>
              <p className="text-gray-300">Application Time</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">24 hrs</div>
              <p className="text-gray-300">Approval Time</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">$2,500</div>
              <p className="text-gray-300">Average Loan</p>
            </div>
          </div>

          <div className="flex flex-col items-center">
          <Link to="/trustscore">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-full px-8 py-6 text-lg flex items-center gap-2 w-full md:w-auto">
              <span>Get Your Trust Score</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
            <p className="mt-4 text-gray-400 text-sm">No credit check required. Free and secure.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
