import { Smartphone, Shield, BarChart3, CreditCard } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Smartphone className="w-10 h-10 text-purple-400" />,
      title: "Connect Your Data",
      description: "Securely link your digital footprint to build your Trust Score.",
    },
    {
      icon: <Shield className="w-10 h-10 text-blue-400" />,
      title: "Get Your Trust Score",
      description: "Our AI analyzes your data to create a personalized Trust Score.",
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-purple-400" />,
      title: "Access Microloans",
      description: "Qualify for microloans based on your Trust Score, not traditional credit.",
    },
    {
      icon: <CreditCard className="w-10 h-10 text-blue-400" />,
      title: "Build Your Future",
      description: "Repay loans to increase your Trust Score and unlock more opportunities.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            How It Works
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            TrustBridge uses AI and blockchain to create a new way of establishing financial trust.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-purple-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            >
              <div className="bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">{step.title}</h3>
              <p className="text-gray-400 text-center">{step.description}</p>
              <div className="mt-4 flex justify-center">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute transform translate-x-[140px] translate-y-[20px]">
                    <svg width="64" height="16" viewBox="0 0 64 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M63.7071 8.70711C64.0976 8.31658 64.0976 7.68342 63.7071 7.29289L57.3431 0.928932C56.9526 0.538408 56.3195 0.538408 55.9289 0.928932C55.5384 1.31946 55.5384 1.95262 55.9289 2.34315L61.5858 8L55.9289 13.6569C55.5384 14.0474 55.5384 14.6805 55.9289 15.0711C56.3195 15.4616 56.9526 15.4616 57.3431 15.0711L63.7071 8.70711ZM0 9H63V7H0V9Z"
                        fill="url(#paint0_linear)"
                      />
                      <defs>
                        <linearGradient id="paint0_linear" x1="0" y1="8" x2="63" y2="8" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#A855F7" stopOpacity="0.5" />
                          <stop offset="1" stopColor="#3B82F6" stopOpacity="0.5" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
