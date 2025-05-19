# 🌉 TrustBridge

**TrustBridge** is a decentralized, AI-powered microloan platform designed to bring financial access to underserved individuals—no traditional credit scores needed.

---

## 🚀 What is TrustBridge?

TrustBridge enables peer-to-peer microloans using alternative financial data. Users without formal credit histories can upload everyday documents (like utility bills or tax receipts), which are analyzed by AI to produce a **TrustScore**. Loans are funded transparently via Ethereum wallets.

---

## 🌍 Why TrustBridge?

Millions remain unbanked due to lack of credit history. TrustBridge empowers them using:

- ✅ AI-based document analysis (ITR, bills, rent)
- ✅ Decentralized identity (Ethereum + Wagmi wallet)
- ✅ Peer-to-peer lending transparency
- ✅ TrustScore for fairness & accountability

---

## 🛠 Tech Stack

### ⚙️ Frontend
- React (Vite)
- Tailwind CSS
- Wagmi + Viem (Ethereum wallet integration)

### ⚙️ Backend
- Flask (Python REST API)
- Firebase (Authentication + Firestore)

### ⚙️ AI Integration
- Gemini Vision – document parsing
- Gemini Pro – TrustScore computation

### ⚙️ Blockchain
- Ethereum Sepolia Testnet
- Wagmi library (wallet connection)
- ⚠️ No smart contracts in MVP — payments are simulated

---

## 📊 Features

### ✅ TrustScore Generation
- Upload income or bill documents (PDF/images)
- AI extracts data and computes a score (0–100)
- Score improves with on-time repayments

### 👤 Borrower Workflow
1. Sign up and upload KYC
2. Get TrustScore
3. Apply for loan
4. Receive ETH via Sepolia wallet
5. Repay within 30 days

### 🧑‍💼 Lender Workflow
1. Register and post loan offers
2. Review borrower requests and TrustScore
3. Approve or reject requests
4. Access documents if borrower defaults (after 2+ months)

---

## 🔒 Privacy & Security

- 🔐 KYC and loan data stored in Firestore (not on-chain)
- 🔐 AI scoring processed server-side
- 🔐 Borrower docs shared only after default

---

## 🔁 User Journey

### Borrower:
`Register → Upload Docs → Get TrustScore → Apply for Loan → Connect Wallet → Receive ETH → Repay`

### Lender:
`Register → Post Offer → View Requests → Review TrustScore → Approve/Reject → Track Loan`

---

## 🧪 API Endpoints

### 📄 Document Parsing
- `POST /vision/first-trustscore` – Upload docs and generate TrustScore

### 📈 Trust Score Update
- `POST /trustscore/update/<uid>` – Update score post-repayment

### 💸 Loan Routes
- `POST /loan/request` – Request a loan
- `GET /loan/user/<uid>` – Fetch all user loans
- `GET /loan/status/<uid>/<loan_id>` – Get loan status
- `POST /loan/decision/<uid>/<loan_id>` – Lender approves/rejects

### 🏦 Lender Routes
- `POST /lender/register` – Register lender
- `POST /lender/offer` – Post a loan offer
- `GET /lender/offers/<uid>` – View own offers
- `GET /lender/borrowers` – View pending borrowers

---

## 🗂 Firestore Structure

```
users/
  └── {uid}/
        ├── loans/             # Subcollection: stores all loans requested by this borrower
        │     └── {loan_id}    # Individual loan documents with amount, purpose, status, etc.
        ├── trust_score/       # Subcollection: stores TrustScore records
        │     └── {score_id}   # Contains score value, explanation, and timestamp
        └── profile/           # Subcollection (or a document if simpler)
              └── metadata     # Contains user info like name, email, KYC flags, wallet

```
```
lenders/
  └── {lender_id}/
        ├── info/              # Subcollection: stores registration info of the lender
        │     └── metadata     # Contains PAN, interest preference, email, phone, etc.
        └── offers/            # Subcollection: list of loan offers posted
              └── {offer_id}   # Offer details like max amount, interest rate, wallet, etc.

```

---

## 🚀 Deployment

- **Frontend**: Vercel
- **Backend**: Render
- **Testing**: Firebase Emulator + SepoliaETH

---

## 🧠 Future Vision

- NFT-based identity badges
- Full loan escrow via smart contracts
- Android-first mobile app
- Real-world pilot (e.g., rural areas)

---

## 📮 Contact

- 📧 Email: [Arnab Ghosh](garnab559@gmail.com)
- 💬 Discord: *Coming Soon*
- 🛠 GitHub: [TrustBridge](https://github.com/tulu-g559/TrustBridge)