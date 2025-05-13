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
import { auth, firestore } from "../../firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import DashboardWrapper from "../../components/shared/DashboardWrapper"
import { User, Timer, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function LoanRequests() {
  const [user] = useAuthState(auth)
  const [requests, setRequests] = useState([])
  const [loadingStates, setLoadingStates] = useState({})

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(firestore, "loanRequests"),
      where("lenderId", "==", user.uid)
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedRequests = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data()
          const borrowerId = data.borrowerId

          let borrowerName = "Borrower"
          try {
            const borrowerRef = doc(firestore, "users", borrowerId)
            const borrowerSnap = await getDoc(borrowerRef)
            if (borrowerSnap.exists()) {
              borrowerName = borrowerSnap.data().name || borrowerName
            }
          } catch (err) {
            console.error("Failed to fetch borrower name:", err)
          }

          return { id: docSnap.id, ...data, borrowerName }
        })
      )

      // Sort: pending first, then approved/rejected
      const sorted = fetchedRequests.sort((a, b) => {
        const statusOrder = { pending: 0, approved: 1, rejected: 2 }
        return statusOrder[a.status] - statusOrder[b.status]
      })

      setRequests(sorted)
    })

    return () => unsubscribe()
  }, [user])

  const handleUpdate = async (id, status) => {
    setLoadingStates((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [status]: true }
    }))
    try {
      const requestRef = doc(firestore, "loanRequests", id)
      await updateDoc(requestRef, { status })

      const requestSnap = await getDoc(requestRef)
      const request = requestSnap.data()

      await addDoc(collection(firestore, "notifications"), {
        userId: request.borrowerId,
        type: "loan_status_update",
        status,
        message: `Your loan request has been ${status}.`,
        requestId: id,
        createdAt: serverTimestamp(),
      })

      toast.success(`Loan request ${status}`)
    } catch (error) {
      console.error("Error updating status:", error)
      toast.error("Failed to update loan request")
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
      <h1 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Pending Loan Requests
      </h1>

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
                  {req.borrowerName || "Borrower"}
                </div>
                {req.reason && (
                  <p className="text-sm text-gray-400">Reason: {req.reason}</p>
                )}
                <p className="text-sm text-gray-400">
                  Amount: ₹{req.amount} | Interest: {req.interestRate || 0}%
                </p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  <Timer className="w-4 h-4" />
                  Trust Score:{" "}
                  <span className="text-green-400">
                    {req.trustScore || "N/A"}
                  </span>
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
              </div>

              <div className="flex flex-wrap gap-4 mt-4 items-center">
                {req.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleUpdate(req.id, "approved")}
                      disabled={loadingStates[req.id]?.approved}
                      className={`px-3 py-1.5 text-sm rounded transition text-white ${
                        loadingStates[req.id]?.approved
                          ? "bg-green-300 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {loadingStates[req.id]?.approved
                        ? "Approving..."
                        : "Approve"}
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
