// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//     ArrowUpRight,
//     ArrowDownRight,
//     UploadCloud,
//     FileCheck2,
//     Clock,
//     Loader2,
// } from "lucide-react";
// import DashboardWrapper from "../components/shared/DashboardWrapper";
// import Header from "../components/header"
// import Footer from "../components/footer"

// const paymentHistory = [
//     { date: "2025-04-01", amount: 100, status: "on-time", impact: +5 },
//     { date: "2025-04-15", amount: 100, status: "late", impact: -10 },
//     { date: "2025-05-01", amount: 100, status: "on-time", impact: +5 },
//     { date: "2025-05-05", amount: 100, status: "missed", impact: -15 },
// ];

// const calculateTrustScore = (docs) => {
//     const baseScore = 0;
//     const totalImpact = paymentHistory.reduce((acc, p) => acc + p.impact, 0);
//     const docBonus = docs.length * 5;
//     return Math.min(100, Math.max(0, baseScore + totalImpact + docBonus));
// };

// const TrustScore = () => {
//     const [user] = useAuthState(auth);
//     const [uploadedDocs, setUploadedDocs] = useState([]);
//     const [trustScore, setTrustScore] = useState(0);
//     const [animatedScore, setAnimatedScore] = useState(0);
//     const [loading, setLoading] = useState(false);
//     const [explanation, setExplanation] = useState("");

//     // const handleFileUpload = async (e) => {
//     //     const files = Array.from(e.target.files || []);
//     //     if (files.length === 0) return;

//     //     setLoading(true);
//     //     const formData = new FormData();

//     //     files.forEach(file => {
//     //         formData.append("document", file);
//     //     });

//     //     try {
//     //         const response = await fetch("http://localhost:5000/vision/first-trustscore", {
//     //             method: "POST",
//     //             body: formData,
//     //         });
//     const handleFileUpload = async (e) => {
//         if (!user) {
//             toast.error("Please login first");
//             return;
//         }

//         const files = Array.from(e.target.files || []);
//         if (files.length === 0) return;

//         setLoading(true);
//         const formData = new FormData();

//         // Add UID to form data
//         formData.append("uid", user.uid);

//         files.forEach(file => {
//             formData.append("document", file);
//         });

//         try {
//             const response = await fetch("http://localhost:5000/vision/first-trustscore", {
//                 method: "POST",
//                 body: formData,
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 setTrustScore(data.trust_score);
//                 setExplanation(data.explanation);

//                 // Add uploaded files to the list
//                 const newDocs = files.map(f => ({
//                     name: f.name,
//                     type: f.type,
//                     uploadedAt: new Date().toLocaleDateString(),
//                 }));
//                 setUploadedDocs(prev => [...prev, ...newDocs]);

//                 toast.success("Documents processed successfully!");
//             } else {
//                 throw new Error(data.error || "Failed to process documents");
//             }
//         } catch (error) {
//             console.error("Upload error:", error);
//             toast.error(error.message || "Failed to upload documents");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Animation effect for the score
//     useEffect(() => {
//         const interval = setInterval(() => {
//             setAnimatedScore(prev => {
//                 if (prev < trustScore) return prev + 1;
//                 if (prev > trustScore) return prev - 1;
//                 return prev;
//             });
//         }, 20);
//         return () => clearInterval(interval);
//     }, [trustScore]);

//     const getStatusColor = (status) => {
//         switch (status) {
//             case "on-time":
//                 return "text-green-400";
//             case "late":
//                 return "text-yellow-400";
//             case "missed":
//                 return "text-red-400";
//             default:
//                 return "text-gray-400";
//         }
//     };

//     return (
//         <div>
//             {/* <Header /> */}
//             <DashboardWrapper>
//             <div className="bg-[#0f172a] text-white min-h-screen p-6">
//                 <div className="flex flex-col lg:flex-row gap-6">
//                     {/* Trust Score Panel */}
//                     <motion.div
//                         className="bg-[#1e293b] rounded-3xl p-8 flex-1 shadow-xl"
//                         initial={{ opacity: 0, y: 40 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.6 }}
//                     >
//                         <h2 className="text-3xl font-bold mb-2">Trust Score</h2>
//                         <p className="text-slate-400 mb-4">
//                             Upload your financial documents to calculate your trust score.
//                         </p>

//                         {/* Score Display */}
//                         <div className="relative w-48 h-48 mx-auto my-8">
//                             <svg className="absolute top-0 left-0 w-full h-full">
//                                 <circle cx="50%" cy="50%" r="70" stroke="#334155" strokeWidth="12" fill="none" />
//                                 <circle
//                                     cx="50%"
//                                     cy="50%"
//                                     r="70"
//                                     stroke="url(#gradient)"
//                                     strokeWidth="12"
//                                     fill="none"
//                                     strokeDasharray={440}
//                                     strokeDashoffset={440 - (animatedScore / 100) * 440}
//                                     strokeLinecap="round"
//                                     transform="rotate(-90 120 120)"
//                                 />
//                                 <defs>
//                                     <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
//                                         <stop offset="0%" stopColor="#38bdf8" />
//                                         <stop offset="100%" stopColor="#6366f1" />
//                                     </linearGradient>
//                                 </defs>
//                             </svg>

//                             <motion.div
//                                 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
//                                 animate={{ scale: [0.95, 1.05, 1] }}
//                                 transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
//                             >
//                                 <div className="text-5xl font-bold text-cyan-400">{animatedScore}</div>
//                                 <div className="text-sm text-slate-400">/ 100</div>
//                             </motion.div>
//                         </div>

//                         {/* Explanation */}
//                         {explanation && (
//                             <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
//                                 <p className="text-slate-300">{explanation}</p>
//                             </div>
//                         )}
//                     </motion.div>

//                     {/* Upload Section */}
//                     <div className="flex flex-col gap-6 flex-1">
//                         <motion.div
//                             className="bg-[#1e293b] p-6 rounded-3xl shadow-xl"
//                             initial={{ opacity: 0, x: 40 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ delay: 0.2, duration: 0.6 }}
//                         >
//                             <div className="flex items-center gap-2 mb-4">
//                                 <UploadCloud className="text-cyan-400" />
//                                 <h3 className="text-lg font-bold">Upload Documents</h3>
//                             </div>

//                             <div className="relative">
//                                 <input
//                                     type="file"
//                                     accept=".pdf,.jpg,.jpeg,.png"
//                                     multiple
//                                     onChange={handleFileUpload}
//                                     className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 
//                                              file:rounded-full file:border-0 file:bg-cyan-700 file:text-white 
//                                              hover:file:bg-cyan-600"
//                                     disabled={loading}
//                                 />
//                                 {loading && (
//                                     <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center rounded-xl">
//                                         <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
//                                     </div>
//                                 )}
//                             </div>

//                             {/* Uploaded Files List */}
//                             <div className="mt-4 space-y-2">
//                                 {uploadedDocs.map((doc, i) => (
//                                     <motion.div
//                                         key={i}
//                                         initial={{ opacity: 0, x: -20 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         transition={{ delay: i * 0.1 }}
//                                         className="flex justify-between items-center text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg"
//                                     >
//                                         <div className="flex items-center gap-2">
//                                             <FileCheck2 className="w-4 h-4 text-green-400" />
//                                             {doc.name}
//                                         </div>
//                                         <span className="text-slate-500">{doc.uploadedAt}</span>
//                                     </motion.div>
//                                 ))}
//                             </div>
//                         </motion.div>
//                         {/* Payment History */}
//                         <motion.div
//                             className="bg-[#1e293b] p-6 rounded-3xl shadow-xl"
//                             initial={{ opacity: 0, y: 40 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ delay: 0.4, duration: 0.6 }}
//                         >
//                             <h3 className="text-lg font-bold mb-4">Payment History</h3>
//                             <div className="space-y-3 text-slate-300">
//                                 {paymentHistory.map((p, idx) => (
//                                     <motion.div
//                                         key={idx}
//                                         initial={{ opacity: 0, x: -20 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         transition={{ delay: idx * 0.05 }}
//                                         className="flex justify-between border-b border-slate-700 pb-2"
//                                     >
//                                         <div className="flex items-center gap-2 text-sm">
//                                             <Clock className="w-4 h-4 text-slate-500" />
//                                             {p.date}
//                                         </div>
//                                         <div className="flex items-center gap-2 text-sm font-medium">
//                                             <span>${p.amount}</span>
//                                             <span className={`font-bold ${getStatusColor(p.status)}`}>
//                                                 {p.status.toUpperCase()}
//                                             </span>
//                                             {p.impact > 0 ? (
//                                                 <ArrowUpRight className="w-4 h-4 text-green-400" />
//                                             ) : (
//                                                 <ArrowDownRight className="w-4 h-4 text-red-400" />
//                                             )}
//                                             <span>{p.impact > 0 ? `+${p.impact}` : p.impact}</span>
//                                         </div>
//                                     </motion.div>
//                                 ))}
//                             </div>
//                         </motion.div>
//                     </div>

//                 </div>
//             </div>
//             </DashboardWrapper>
//             {/* <Footer /> */}
//         </div>
//     );
// };

// export default TrustScore;



import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileCheck2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { auth, db } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";
import DashboardWrapper from "../components/shared/DashboardWrapper"

export default function TrustScore() {
    const [user] = useAuthState(auth);
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [trustScore, setTrustScore] = useState(0);
    const [animatedScore, setAnimatedScore] = useState(0);
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState("");

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    // Fetch existing trust score when component mounts
    useEffect(() => {
        const fetchExistingTrustScore = async () => {
            if (!user) return;

            try {
                const response = await fetch(`${BACKEND_URL}/user/trust-score/${user.uid}`);
                const data = await response.json();

                if (response.ok && data.trust_score) {
                    setTrustScore(data.trust_score.current);
                    if (data.trust_score.history?.length > 0) {
                        setExplanation(data.trust_score.history[0].reason);
                    }
                }
            } catch (error) {
                console.error("Error fetching trust score:", error);
            }
        };

        fetchExistingTrustScore();
    }, [user]);

    const handleFileUpload = async (e) => {
        if (!user) {
            toast.error("Please login first");
            return;
        }

        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("uid", user.uid);

        files.forEach(file => {
            formData.append("document", file);
        });

        try {
            const response = await fetch(`${BACKEND_URL}/vision/first-trustscore`, {
                method: "POST",
                body: formData,
            });


            const data = await response.json();

            if (response.ok) {
                setTrustScore(data.trust_score);
                setExplanation(data.explanation);

                const newDocs = files.map(f => ({
                    name: f.name,
                    type: f.type,
                    uploadedAt: new Date().toLocaleDateString()
                }));
                setUploadedDocs(prev => [...prev, ...newDocs]);

                // Fetch updated trust score after processing
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data();
                if (userData?.trust_score?.current) {
                    setTrustScore(userData.trust_score.current);
                }

                toast.success("Documents processed successfully!");
            } else {
                throw new Error(data.error || "Failed to process documents");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload documents");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const interval = setInterval(() => {
            setAnimatedScore(prev => {
                if (prev < trustScore) return prev + 1;
                if (prev > trustScore) return prev - 1;
                return prev;
            });
        }, 20);
        return () => clearInterval(interval);
    }, [trustScore]);

    return (
        <DashboardWrapper>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Trust Score Panel */}
                    <motion.div
                        className="bg-gray-800 rounded-3xl p-8 flex-1 shadow-xl"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-bold mb-2 text-white">Trust Score</h2>
                        <p className="text-gray-400 mb-4">
                            Upload your financial documents to calculate your trust score.
                        </p>

                        {/* Score Display */}
                        <div className="relative w-48 h-48 mx-auto my-8">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-700" />
                            <motion.div
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                                animate={{ scale: [0.95, 1.05, 1] }}
                                transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
                            >
                                <div className="text-5xl font-bold text-cyan-400">{animatedScore}</div>
                                <div className="text-sm text-gray-400">/ 100</div>
                            </motion.div>
                        </div>

                        {/* Explanation */}
                        {explanation && (
                            <div className="mt-4 p-4 bg-gray-700/50 rounded-xl">
                                <p className="text-gray-300">{explanation}</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Upload Section */}
                    <div className="flex flex-col gap-6 flex-1">
                        <motion.div
                            className="bg-gray-800 p-6 rounded-3xl shadow-xl"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <UploadCloud className="text-cyan-400" />
                                <h3 className="text-lg font-bold text-white">Upload Documents</h3>
                            </div>

                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 
                                             file:rounded-full file:border-0 file:bg-cyan-700 file:text-white 
                                             hover:file:bg-cyan-600"
                                    disabled={loading}
                                />
                                {loading && (
                                    <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center rounded-xl">
                                        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                                    </div>
                                )}
                            </div>

                            {/* Uploaded Files List */}
                            <div className="mt-4 space-y-2">
                                {uploadedDocs.map((doc, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex justify-between items-center text-sm text-gray-300 bg-gray-700/50 p-2 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileCheck2 className="w-4 h-4 text-green-400" />
                                            {doc.name}
                                        </div>
                                        <span className="text-gray-500">{doc.uploadedAt}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}