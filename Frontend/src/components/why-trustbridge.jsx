import { CheckCircle2 } from "lucide-react"

export default function WhyTrustBridge() {
  const benefits = [
    {
      title: "No Traditional Credit Required",
      description: "Access financial services without a traditional credit history.",
    },
    {
      title: "Secure Blockchain Technology",
      description: "Your data is secure and transactions are transparent on the blockchain.",
    },
    {
      title: "AI-Powered Trust Scoring",
      description: "Our advanced AI analyzes alternative data to establish your trustworthiness.",
    },
    {
      title: "Global Accessibility",
      description: "Available to underserved individuals worldwide, regardless of location.",
    },
    {
      title: "Fast Approval Process",
      description: "Get approved for microloans in minutes, not days or weeks.",
    },
    {
      title: "Build Financial History",
      description: "Establish a financial record that grows with you over time.",
    },
  ]

  return (
    <section id="why-trustbridge" className="py-20 bg-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Why TrustBridge
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">We're reimagining financial inclusion for the digital age.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-blue-500/30 transition-all duration-300"
            >
              <div className="flex items-start mb-4">
                <CheckCircle2 className="w-6 h-6 text-blue-400 mr-3 flex-shrink-0" />
                <h3 className="text-xl font-bold">{benefit.title}</h3>
              </div>
              <p className="text-gray-400 ml-9">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
