import React, { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  getDoc,
} from "firebase/firestore"
import { auth, db as firestore } from "../../firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import DashboardWrapper from "../../components/shared/DashboardWrapper"
import { User, Timer, Trash2, Wallet } from "lucide-react"
import { toast } from "sonner"
import { ethers } from 'ethers'
import { useAccount, useBalance, useChainId } from 'wagmi'

// Sepolia Network Configuration
const SEPOLIA_CHAIN_ID = 11155111
const SEPOLIA_RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL // Replace with your Alchemy API key

const isSepoliaNetwork = (chainId) => chainId === SEPOLIA_CHAIN_ID

export default function LoanRequests() {
  const [user] = useAuthState(auth)
  const [requests, setRequests] = useState([])
  const [loadingStates, setLoadingStates] = useState({})
  const { address: walletAddress, isConnected } = useAccount()
  // const { chain } = useNetwork()
  const { data: balance } = useBalance({
    address: walletAddress,
    watch: true,
  })

   const chainId = useChainId()
  const isValidNetwork = isSepoliaNetwork(chainId)

  // Add Sepolia network to MetaMask
  const addSepoliaNetwork = async () => {
    if (!window.ethereum) return
    
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
          chainName: 'Sepolia Test Network',
          nativeCurrency: {
            name: 'Sepolia ETH',
            symbol: 'SEP',
            decimals: 18
          },
          rpcUrls: [SEPOLIA_RPC_URL],
          blockExplorerUrls: ['https://sepolia.etherscan.io/']
        }]
      })
    } catch (error) {
      console.error('Error adding Sepolia network:', error)
    }
  }

  // Fetch loan requests
  // useEffect(() => {
  //   if (!user) return

  //   const q = query(
  //     collection(firestore, "loanRequests"),
  //     where("lenderId", "==", user.uid)
  //   )

  //   const unsubscribe = onSnapshot(q, async (snapshot) => {
  //     const fetchedRequests = await Promise.all(
  //       snapshot.docs.map(async (docSnap) => {
  //         const data = docSnap.data()
  //         const borrowerId = data.borrowerId

  //         try {
  //           const borrowerDoc = await getDoc(doc(firestore, "users", borrowerId))
  //           const borrowerData = borrowerDoc.data()
  //           return { 
  //             id: docSnap.id, 
  //             ...data, 
  //             borrowerName: borrowerData?.fullName || "Anonymous",
  //             borrowerWallet: borrowerData?.walletAddress
  //           }
  //         } catch (error) {
  //           console.error("Error fetching borrower details:", error)
  //           return { 
  //             id: docSnap.id, 
  //             ...data, 
  //             borrowerName: "Anonymous",
  //             borrowerWallet: null
  //           }
  //         }
  //       })
  //     )
  useEffect(() => {
    if (!user) return;

    const q = query(
        collection(firestore, "loanRequests"),
        where("lenderId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
        const fetchedRequests = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                const borrowerId = data.borrowerId;

                try {
                    const borrowerDoc = await getDoc(doc(firestore, "users", borrowerId));
                    const borrowerData = borrowerDoc.data();
                    
                    // Get trust score from borrower data
                    const trustScore = borrowerData?.trust_score?.current || "N/A";
                    const lastUpdated = borrowerData?.trust_score?.updated_at;
                    
                    return { 
                        id: docSnap.id, 
                        ...data, 
                        borrowerName: borrowerData?.fullName || "Anonymous",
                        borrowerWallet: borrowerData?.walletAddress,
                        trustScore,
                        trustScoreUpdated: lastUpdated
                    };
                } catch (error) {
                    console.error("Error fetching borrower details:", error);
                    return { 
                        id: docSnap.id, 
                        ...data, 
                        borrowerName: "Anonymous",
                        borrowerWallet: null,
                        trustScore: "N/A"
                    };
                }
            })
        );

      const sorted = fetchedRequests.sort((a, b) => {
        const statusOrder = { pending: 0, approved: 1, rejected: 2 }
        return statusOrder[a.status] - statusOrder[b.status]
      })

      setRequests(sorted)
    })

    return () => unsubscribe()
  }, [user])

  const handleUpdate = async (id, status) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!isValidNetwork) {
      toast.error("Please switch to Sepolia network")
      addSepoliaNetwork()
      return
    }

    setLoadingStates((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [status]: true }
    }))

    try {
      const requestRef = doc(firestore, "loanRequests", id)
      const requestSnap = await getDoc(requestRef)
      const request = requestSnap.data()

      if (status === "approved") {
        if (!window.ethereum) {
          throw new Error("Please install MetaMask")
        }

        if (!request.borrowerWallet) {
          throw new Error("Borrower wallet address not found")
        }

        try {
          // Initialize provider
          const provider = new ethers.BrowserProvider(window.ethereum)
          const signer = await provider.getSigner()

          // Convert amount to wei
          const amount = ethers.parseEther(request.amount.toString())

          // Check balance
          const balance = await provider.getBalance(walletAddress)
          if (balance < amount) {
            throw new Error("Insufficient Sepolia ETH balance")
          }

          // Send transaction
          const tx = await signer.sendTransaction({
            to: request.borrowerWallet,
            value: amount
          })

          toast.info("Transaction submitted, waiting for confirmation...")

          // Wait for confirmation
          const receipt = await tx.wait()

          // Update loan request status
          await updateDoc(requestRef, {
            status,
            transactionHash: receipt.hash,
            transferredAt: serverTimestamp(),
            transferAmount: request.amount,
            chainId: SEPOLIA_CHAIN_ID
          })

          // Create notification
          await addDoc(collection(firestore, "notifications"), {
            userId: request.borrowerId,
            type: "loan_status_update",
            status,
            message: `Your loan request for ${request.amount} Sepolia ETH has been approved and transferred!`,
            requestId: id,
            transactionHash: receipt.hash,
            createdAt: serverTimestamp(),
          })

          toast.success("Loan approved and Sepolia ETH transferred successfully!")
        } catch (error) {
          console.error("Transaction error:", error)
          throw new Error(error.message || "Failed to transfer Sepolia ETH")
        }
      } else {
        // Handle rejection
        await updateDoc(requestRef, { 
          status,
          updatedAt: serverTimestamp()
        })

        await addDoc(collection(firestore, "notifications"), {
          userId: request.borrowerId,
          type: "loan_status_update",
          status,
          message: `Your loan request has been ${status}.`,
          requestId: id,
          createdAt: serverTimestamp(),
        })

        toast.success(`Loan request ${status}`)
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error(error.message || "Failed to update loan request")
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), [status]: false }
      }))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this loan request?")) return
    try {
      await deleteDoc(doc(firestore, "loanRequests", id))
      toast.success("Loan request deleted")
    } catch (error) {
      console.error("Error deleting request:", error)
      toast.error("Failed to delete request")
    }
  }

  return (
    <DashboardWrapper>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Loan Requests
        </h1>
        
        {balance && (
          <div className="flex items-center gap-2 text-gray-400">
            <Wallet className="w-4 h-4" />
            Balance: {ethers.formatEther(balance.value)} SEP
          </div>
        )}
      </div>

      {!isConnected && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <p className="text-yellow-400">Please connect your wallet to process loans</p>
        </div>
      )}

      {!isValidNetwork && isConnected && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-400">Please switch to Sepolia network to process loans</p>
          <button
            onClick={addSepoliaNetwork}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            Add Sepolia Network to MetaMask
          </button>
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-gray-400">No requests found.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-gray-900 p-5 border border-gray-700 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <User className="w-5 h-5 text-blue-400" />
                  {req.borrowerName}
                </div>
                {req.reason && (
                  <p className="text-sm text-gray-400">Reason: {req.reason}</p>
                )}
                <p className="text-sm text-gray-400">
                  Amount: {req.amount} SEP | Interest: {req.interestRate || 0}%
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  Trust Score:{" "}
                  <span className={`${
                      req.trustScore === "N/A" 
                          ? "text-gray-400" 
                          : parseInt(req.trustScore) > 70 
                              ? "text-green-400"
                              : parseInt(req.trustScore) > 40 
                                  ? "text-yellow-400" 
                                  : "text-red-400"
                  }`}>
                      {req.trustScore}
                      {req.trustScore !== "N/A" && "/100"}
                  </span>
                  {req.trustScoreUpdated && (
                      <span className="text-xs text-gray-500 ml-1">
                          ({new Date(req.trustScoreUpdated.toDate()).toLocaleDateString()})
                      </span>
                  )}
              </p>
                <p className="text-sm mt-1">
                  Status:{" "}
                  <span
                    className={`${
                      req.status === "approved"
                        ? "text-green-400"
                        : req.status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {req.status}
                  </span>
                </p>
                {req.transactionHash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${req.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 mt-1 inline-block"
                  >
                    View Transaction ↗
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-4 items-center">
                {req.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleUpdate(req.id, "approved")}
                      disabled={loadingStates[req.id]?.approved || !isConnected || !isValidNetwork}
                      className={`px-3 py-1.5 text-sm rounded transition text-white ${
                        loadingStates[req.id]?.approved || !isConnected || !isValidNetwork
                          ? "bg-green-300 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {loadingStates[req.id]?.approved
                        ? "Processing..."
                        : "Approve & Transfer"}
                    </button>
                    <button
                      onClick={() => handleUpdate(req.id, "rejected")}
                      disabled={loadingStates[req.id]?.rejected}
                      className={`px-3 py-1.5 text-sm rounded transition text-white ${
                        loadingStates[req.id]?.rejected
                          ? "bg-red-300 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {loadingStates[req.id]?.rejected
                        ? "Rejecting..."
                        : "Reject"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="flex items-center text-red-400 hover:text-red-500 text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardWrapper>
  )
}