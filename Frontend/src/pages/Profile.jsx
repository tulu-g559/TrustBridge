import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Profile() {
  const [user] = useAuthState(auth);
  const [userType, setUserType] = useState("");
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userType");
    const savedName = localStorage.getItem("userName") || user?.displayName || "User";
    const savedSummary = localStorage.getItem("userSummary") || "";

    setUserType(role);
    setName(savedName);
    setSummary(savedSummary);
  }, [user]);

  const handleSave = () => {
    localStorage.setItem("userName", name);
    localStorage.setItem("userSummary", summary);
    alert("Profile saved!");
  };

  if (!user) {
    return (
      <div className="text-white text-center p-10">
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white p-6 pt-24">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <img
              src={user.photoURL || "https://api.dicebear.com/7.x/bottts/svg?seed=TrustBridge"}
              alt="Avatar"
              className="w-32 h-32 rounded-full border-4 border-purple-500"
            />

            {/* Editable Info */}
            <div className="flex-1 space-y-2">
              <input
                className="w-full bg-gray-800 text-white text-xl font-bold rounded p-2 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <p className="text-gray-400">{user.email}</p>
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 inline-block px-3 py-1 rounded-full text-sm font-medium">
                Role: {userType}
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6">
            <label className="block text-sm text-gray-400 mb-1">Summary</label>
            <textarea
              rows={4}
              className="w-full bg-gray-800 text-white rounded-lg p-3 resize-none outline-none"
              placeholder="Write a short bio..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
            <button
              onClick={handleSave}
              className="mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              Save Profile
            </button>
          </div>

          {/* Divider */}
          <hr className="my-6 border-gray-700" />

          {/* Wallet + Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold mb-2">Wallet Balance</h3>
              <p className="text-2xl font-bold text-green-400">Ξ 0.00</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>- No recent activity yet</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
