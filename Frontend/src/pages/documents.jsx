import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Wallet, ScanLine } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import Header from "../components/header";
import Footer from "../components/footer";

export default function ZenCueFullDocPage() {
  // ✅ Proper AOS init
  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  return (
    <>
      <div className="bg-gradient-to-br from-black to-[#232946] text-white min-h-screen overflow-x-hidden relative pb-0">
        {/* Hazy background overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="w-full h-full bg-white/10 backdrop-blur-2xl" />
        </div>

        {/* Animated floating shapes */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute animate-float-slow top-10 left-10 w-20 h-20 bg-purple-200 rounded-full blur-xl opacity-30" />
          <div className="absolute animate-float-fast top-1/3 right-10 w-32 h-32 bg-pink-200 rounded-full blur-xl opacity-20" />
          <div className="absolute animate-float-med bottom-10 left-1/4 w-24 h-24 bg-yellow-100 rounded-full blur-xl opacity-25" />
          {/* Additional circles for more visual interest, moved away from text sections */}
          <div className="absolute animate-float-slow top-1/4 left-1/2 w-28 h-28 bg-blue-200 rounded-full blur-2xl opacity-20" />
          <div className="absolute animate-float-fast bottom-1/3 right-1/3 w-16 h-16 bg-green-200 rounded-full blur-xl opacity-20" />
          <div className="absolute animate-float-slow top-0 right-1/4 w-24 h-24 bg-pink-100 rounded-full blur-2xl opacity-15" />
          <div className="absolute animate-float-med bottom-32 left-1/6 w-20 h-20 bg-indigo-200 rounded-full blur-xl opacity-20" />
        </div>

        {/* ✅ Use existing Header instead of Navigation (fixes potential undefined component) */}
        <Header />

        <main className="relative z-10 px-6 sm:px-12 py-16 max-w-5xl mx-auto">
          <motion.h1
            className="text-5xl font-extrabold text-center drop-shadow-lg mb-16 flex items-center justify-center gap-3
                      bg-gradient-to-r from-purple-400 via-blue-400 to-purple-700 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Sparkles className="w-10 h-10 text-pink-500" />
            TrustBridge: Documentation & User Guide
          </motion.h1>
          {/* Gradient Box with Welcome Content */}
          <div className="bg-gradient-to-r from-[#232946] to-[#181c2f] rounded-xl shadow-lg p-6 mb-12 max-w-3xl mx-auto border border-[#232946]/60 shimmer">
            <h3 className="text-2xl font-bold mb-2 text-white">Welcome to TrustBridge!</h3>
            <p className="text-gray-300 text-lg">
              Welcome to the official documentation for TrustBridge — a decentralized, AI-powered microloan platform designed to bring financial access to underserved individuals, without relying on traditional credit scores.
            </p>
          </div>

          <div className="space-y-24">
            {sections.map((section, i) => (
              <motion.section
                key={i}
                className="w-full max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              >
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-700 bg-clip-text text-transparent">{section.title}</h2>
                <div className="prose prose-lg prose-pink max-w-none text-gray-400 text-md space-y-3">
                  {section.content}
                </div>
              </motion.section>
            ))}
          </div>
        </main>
      </div>
      {/* Footer is outside the background overlays, so it is not blurred or covered */}
      <Footer />
    </>
  );
}

// ⬇️ (Unchanged) Section content stays as-is
const sections = [
  {
    title: "What is TrustBridge?",
    content: (
      <>
        <p>TrustBridge bridges the financial trust gap by enabling peer-to-peer microloans using alternative data. Users without formal credit histories can gain credibility by uploading everyday documents like utility bills, tax receipts, and rent slips. These documents are analysed using AI to generate a TrustScore, allowing borrowers to get funded transparently via Ethereum wallets.</p>
      </>
    ),
  },
  {
    title: "Why TrustBridge?",
    content: (
      <>
      <p>Millions remain unbanked or underbanked due to lack of credit history. TrustBridge empowers them by leveraging:</p>
      <ul className="list-disc pl-6">
        <li>AI-based document analysis (e.g., ITR, bills, rent)</li>
        <li>Decentralized identity (Ethereum + Wagmi wallet)</li>
        <li>Peer-to-peer lending transparency</li>
        <li>TrustScore to ensure fairness & accountability</li>
      </ul>
      </>
    ),
  },
  {
    title: "Tech Stack Overview",
    content: (
      <>
        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Frontend:</strong></p>
        <ul className="list-disc pl-6"></ul>
        <li>React (Vite)</li>
        <li>Tailwind CSS</li>
        <li>Wagmi + Viem – for Sepolia Ethereum wallet integration</li>

        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Backend:</strong></p>
        <ul className="list-disc pl-6"></ul>
        <li>Flask (Python REST API)</li>
        <li>Firebase (Authentication + Firestore DB)</li>
        
        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>AI Integration:</strong></p>
        <ul className="list-disc pl-6"></ul>
        <li>Gemini Vision – document text extraction (images, PDFs)</li>
        <li>Gemini Pro– TrustScore generation based on extracted financial data</li>

        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Blockchain (Web3):</strong></p>
        <ul className="list-disc pl-6"></ul>
        <li>Ethereum Sepolia Testnet – for demo payments</li>
        <li>Wagmi library for wallet connection</li>
        <li>No smart contracts in MVP — payments are simulated via frontend</li>


        
      </>
    ),
  },
  {
    title: "Key Features",
    content: (
        <>
        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>TrustScore Generation</strong></p>
        <ul className="list-disc pl-6"></ul>
        <li>Upload income or bill documents (PDF/images)</li>
        <li>AI extracts key details and computes a TrustScore (0–100)</li>
        <li>Score improves with on-time repayments</li>

        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Borrower Workflow</strong></p>
        <ul className="list-disc pl-6"></ul>
        <li>Sign up and upload KYC (mock Aadhar/PAN)</li>
        <li>Get a TrustScore</li>
        <li>Apply for loan: enter amount, reason, and wallet</li>
        <li>Receive loan in your wallet (mock transaction)</li>
        <li>If approved, receive funds via Sepolia wallet</li>
        <li>Repay loan within 30 days; score increases if on-time</li>
        
        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Lender Workflow:</strong></p>
        <ul className="list-disc pl-6"></ul>
        <li>Register as lender and post loan offers (amount, interest)</li>
        <li>Review loan requests from borrowers</li>
        <li>View borrower's TrustScore and wallet</li>
        <li>Approve or reject loan requests</li>
        <li>If borrower defaults (2+ months), gets access to documents</li>
        </>
    ),
  },
  {
    title: "Privacy & Security",
    content: (
      <ul className="list-disc pl-6">
        <li>User data (KYC, loan info) is stored in Firestore — not on-chain</li>
        <li>All AI parsing and scoring happens securely server-side</li>
        <li>Borrower documents are only shared with lender after default</li>
      </ul>
    ),
  },
  {
    title: "User Journey",
    content: (
      <ul className="list-disc pl-6">
        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Borrower:</strong></p>
        <li>Register → Upload Docs → Get TrustScore → Apply for Loan → Connect Wallet → Receive ETH → Repay</li>
        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Lender:</strong></p>
        <li>Register → Post Offer → View Borrower Requests → Review TrustScore → Approve/Reject → Track Loan</li>
      </ul>
    ),
  },
  // Find and replace the API Routes section content with:
{
    title: "API Routes (Flask)",
    content: (
      <>
      <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Document Parsing</strong></p>
        <ul className="list-disc pl-6">
        <li>POST /vision/first-trustscore</li>
        <li>Uploads one or more financial docs → parses → scores</li>
        </ul>

        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Trust Score Update</strong></p>
        <ul className="list-disc pl-6">
        <li>POST /trustscore/update/${'{userId}'}</li>
        <li>Increases score after successful loan repayment</li>
        </ul>
        
        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Loan Routes:</strong></p>
        <ul className="list-disc pl-6">
        <li>POST /loan/request → Borrower requests a loan</li>
        <li>GET /loan/user/${'{userId}'} → Get all borrower's loans</li>
        <li>GET /loan/status/${'{userId}'}/${'{loanId}'} → Get loan repayment status</li>
        <li>POST /loan/decision/${'{userId}'}/${'{loanId}'} → Lender approves/rejects loan</li>
        </ul>
        
        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent"><strong>Lender Routes</strong></p>
        <ul className="list-disc pl-6">
        <li>POST /lender/register → Save lender profile in lenders/${'{userId}'}/info</li>
        <li>POST /lender/offer → Lender posts offer in lenders/${'{userId}'}/offers</li>
        <li>GET /lender/offers/${'{userId}'} → View own posted offers</li>
        <li>GET /lender/borrowers → View all borrowers with pending loans</li>
        </ul>
        </>
    ),
},
  {
    title: "Testing & Deployment",
    content: (
      <>
        <ul className="list-disc pl-6"></ul>
        <li>Use SepoliaETH to get test ETH</li>
        <li>Wallet connections handled by <b>Wagmi + Viem</b></li>
        <li>Local testing supported using <b>Firebase Emulator Suite</b></li>
        <li>Deployment:</li>
        <ul className="list-disc pl-6"></ul>
          <li>Frontend → Vercel</li>
          <li>Backend → Render</li>
      </>
    ),
  },
  {
    title: "Future Vision",
    content: (
      <ul className="list-disc pl-6">
        <li>Add NFT-based identity badges</li>
        <li>Use smart contracts for full loan escrow</li>
        <li>Build an Android-first mobile app</li>
        <li>Launch in real-world pilot communities (e.g., rural areas)</li>
      </ul>
    ),
  },
  {
    title: "📬 Contact & Feedback",
    content: (
      <ul className="list-disc pl-6">
        <p className="font-bold bg-gradient-to-r from-purple-500 to-blue-300 bg-clip-text text-transparent">For support or collaboration:</p>
        <li>Email: <a href="mailto:trustbridge@project.org" className="text-blue-600 underline">trustbridge@project.org</a></li>
        <li>Slack/Discord (coming soon)</li>
        <li>GitHub:<a href="https://github.com/tulu-g559/TrustBridge" className="text-blue-700 underline">https://github.com/tulu-g559/TrustBridge</a></li>
      </ul>
    ),
  },
];
