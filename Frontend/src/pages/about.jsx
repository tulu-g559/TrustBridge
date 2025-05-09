// AboutPage.jsx
import { useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, ShieldCheck, Wallet, ScanLine } from "lucide-react"
import AOS from "aos"
import "aos/dist/aos.css"
import Header from "../components/header"
import Footer from "../components/footer"

export default function AboutPage() {
  useEffect(() => {
    AOS.init({ duration: 1000 })
  }, [])

  return (
    <div>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white px-6 py-16 md:px-20 overflow-x-hidden">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl md:text-6xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent"
      >
        About Our Platform
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-center mt-6 text-lg text-zinc-400 max-w-3xl mx-auto"
      >
        Explore the future of decentralized finance with wallet-powered identity, AI-powered insights, and trustless loan experiences.
      </motion.p>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-10 mt-16">
        {features.map((f, i) => (
          <div
            key={i}
            data-aos="fade-up"
            data-aos-delay={`${i * 200}`}
            className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-cyan-800/10 hover:scale-[1.02] hover:shadow-purple-800/20 transition-all duration-500 relative group overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full blur-3xl bg-purple-800/20 group-hover:opacity-60 transition" />
            <div className="flex items-center gap-4">
              <f.icon className="w-8 h-8 text-cyan-400 animate-pulse" />
              <h3 className="text-xl font-semibold text-white">{f.title}</h3>
            </div>
            <p className="text-zinc-400 mt-3 leading-relaxed text-sm md:text-base">
              {f.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mission Section */}
      <div
        data-aos="zoom-in-up"
        className="mt-24 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black p-10 rounded-3xl shadow-lg border border-zinc-700 relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 w-40 h-40 blur-2xl bg-cyan-700/30 rounded-full animate-pulse" />
        <div className="absolute right-0 bottom-0 w-60 h-60 blur-3xl bg-purple-700/20 rounded-full animate-spin-slow" />

        <h2 className="text-3xl font-bold mb-4 text-white">Our Mission 🚀</h2>
        <p className="text-zinc-300 text-lg leading-loose">
          We're building a future where access to capital is borderless and intelligent.
          Our platform combines smart contracts, wallet identity, and AI-powered credit
          analysis to enable secure, permissionless borrowing and lending for everyone.
        </p>
      </div>
    </div>
    <Footer />
    </div>
  )
}

const features = [
  {
    title: "Smart Contract Lending",
    description:
      "Borrow or lend assets onchain with automated contracts that ensure secure repayment and transparency.",
    icon: ShieldCheck,
  },
  {
    title: "AI Document Vision",
    description:
      "Upload financial documents. Our AI reads and extracts income, identity, and risk data for eligibility.",
    icon: ScanLine,
  },
  {
    title: "Multi-Wallet Support",
    description:
      "Use Coinbase Wallet, MetaMask, or WalletConnect. Your wallet is your universal login.",
    icon: Wallet,
  },
  {
    title: "Decentralized Reputation",
    description:
      "Build onchain credit through past repayments, verified docs, and wallet activity logs.",
    icon: Sparkles,
  },
]

// Optional Tailwind animation
// In tailwind.config.js add:
// animation: {
//   'spin-slow': 'spin 10s linear infinite',
// },
