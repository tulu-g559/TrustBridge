/** @type {import('react').FC} */

import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import Header from "../components/header";
import Footer from "../components/footer";
import { toast } from "react-toastify";

/**
 * @typedef {Object} Window
 * @property {any} cloudinary
 */

export default function Profile() {
  const [user] = useAuthState(auth);
  const [profileData, setProfileData] = useState({
    fullName: "",
    bio: "",
    email: "",
    phone: "",
    panId: "",
    lendingInterest: "",
    photoURL: "",
  });
  const [userType, setUserType] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Connect Cloudinary to store Profile Picture
  useEffect(() => {
    const scriptId = "cloudinary-widget";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
      script.async = true;
      script.id = scriptId;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, "lenders", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            fullName: data.fullName || "",
            bio: data.bio || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            panId: data.panId || "",
            lendingInterest: data.lendingInterest || "",
            photoURL: data.photoURL || null,
          });
        }
      };
      fetchProfile();
      const role = localStorage.getItem("userType") || "User";
      setUserType(role);
    }
  }, [user]);

  const handleChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      const userRef = doc(db, "lenders", user.uid);
      await setDoc(
        userRef,
        {
          fullName: profileData.fullName,
          bio: profileData.bio,
        },
        { merge: true } // only update fullName and bio
      );

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleCloudinaryUpload = () => {
    if (!window.cloudinary || !user?.uid) {
      toast.error("Please log in first");
      return;
    }

    // Cloudinary Upload Function
    window.cloudinary.openUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUD_NAME, // replace with your cloud name
        uploadPreset: import.meta.env.VITE_UPLOAD_PRESET, // replace with your upload preset
        sources: ["local"],
        multiple: false,
        cropping: true,
        folder: "avatars",
        resourceType: "image",
      },
      async (error, result) => {
        if (!error && result && result.event === "success") {
          const imageUrl = result.info.secure_url;

          // Update in Firestore
          const userRef = doc(db, "lenders", user.uid);
          await setDoc(userRef, { photoURL: imageUrl }, { merge: true });

          // Update locally
          setProfileData((prev) => ({
            ...prev,
            photoURL: imageUrl,
          }));

          toast.success("Profile picture updated successfully!");
        } else if (error) {
          console.error(error);
          toast.error("Image upload failed");
        }
      }
    );
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
      <div className="min-h-screen bg-black text-white p-6 pt-16">
        {/* Wallet Section */}
        <div className="fixed top-30 right-15 flex flex-col gap-4 z-50">
          {/* Connect Wallet Button */}
          <button
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 ease-in-out flex items-center justify-center gap-2 shadow-lg"
            onClick={() => {
              /* Add wallet connect logic here */
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            Connect Wallet
          </button>

          {/* Wallet Balance Card */}
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
            <h3 className="text-lg font-semibold mb-1 text-purple-400">
              Wallet Balance
            </h3>
            <p className="text-2xl font-bold text-green-400">Ξ 0.00</p>
          </div>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <img
            src={
              profileData.photoURL ||
              "https://api.dicebear.com/7.x/bottts/svg?seed=TrustBridge"
            }
            alt="Avatar"
            className="w-36 h-36 rounded-full border-4 border-gradient-to-r from-purple-500 to-blue-500"
          />
          <div className="space-y-3">
            <div className="bg-gray-800 text-white text-3xl font-bold rounded p-4 outline-none focus:ring-2 focus:ring-purple-500">
              {profileData.fullName}
            </div>
            <br />
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 inline-block px-4 py-2 rounded-full text-xl font-medium">
              Role: {userType}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-lg">
          <LabelAndText label="Email" value={profileData.email} />
          <LabelAndText label="Phone" value={profileData.phone} />
          <LabelAndText label="PAN ID" value={profileData.panId} />
          <LabelAndText
            label="Lending Interest"
            value={profileData.lendingInterest}
          />
          <LabelAndText label="Full Name" value={profileData.fullName} />
          <LabelAndText label="Bio" value={profileData.bio} />
        </div>
        
        {/* Edit Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white text-xl transition duration-200 ease-in-out"
          >
            Edit Profile
          </button>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-[500px]">
              <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
              <div className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img
                      src={
                        profileData.photoURL ||
                        user.photoURL ||
                        "https://api.dicebear.com/7.x/bottts/svg?seed=TrustBridge"
                      }
                      alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-purple-500"
                    />
                    <button
                      onClick={handleCloudinaryUpload}
                      className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full cursor-pointer hover:bg-purple-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Click the edit icon to change your profile picture
                  </p>
                </div>

                {/* Name and Bio Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-lg text-gray-400 mb-2">
                      Full Name
                    </label>
                    <input
                      className="w-full bg-gray-700 p-3 rounded text-white text-lg"
                      value={profileData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-lg text-gray-400 mb-2">Bio</label>
                    <textarea
                      className="w-full bg-gray-700 p-3 rounded resize-none text-white text-lg"
                      value={profileData.bio}
                      rows={4}
                      onChange={(e) => handleChange("bio", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSave();
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        
        <hr className="my-8 border-gray-700" />
        {/* Recent Activity */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl mt-8">
          <h3 className="text-xl font-semibold mb-3">Recent Activity</h3>
          <ul className="text-lg text-gray-300 space-y-2">
            <li>- No recent activity yet</li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
}

// LabelAndText Component
function LabelAndText({ label, value }) {
  return (
    <div className="flex flex-col">
      <label className="text-lg text-gray-400 mb-2">{label}</label>
      <p className="text-xl text-white">{value}</p>
    </div>
  );
}
