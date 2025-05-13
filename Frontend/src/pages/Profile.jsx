import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import Header from "../components/header";
import Footer from "../components/footer";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Profile() {
  const [user] = useAuthState(auth);
  const { address, isConnected } = useAccount();

  const [profileData, setProfileData] = useState({
    fullName: "",
    bio: "",
    email: "",
    phone: "",
    panId: "",
    photoURL: "",
    walletAddress: "",
  });

  // Initialize role and collectionPath from localStorage or default values
  const [role, setRole] = useState(() => localStorage.getItem("userRole") || "borrower");
  const [collectionPath, setCollectionPath] = useState(() => localStorage.getItem("userType") === "lender" ? "lenders" : "users");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load Cloudinary script
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
    if (!user) return;

    const fetchProfile = async () => {
      setLoading(true);
      const uid = user.uid;
      
      try {
        // Check collection based on stored user type
        const collection = localStorage.getItem("userType") === "lender" ? "lenders" : "users";
        const ref = doc(db, collection, uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setCollectionPath(collection);
          localStorage.setItem("collectionPath", collection);
          
          setProfileData({
            fullName: data.fullName || "",
            bio: data.bio || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            panId: data.panId || "",
            photoURL: data.photoURL || "",
            walletAddress: data.walletAddress || "",
          });

          const userRole = collection === "lenders" ? "lender" : "borrower";
          setRole(userRole);
          localStorage.setItem("userRole", userRole);
        } else {
          // If document doesn't exist, try the other collection
          const altCollection = collection === "lenders" ? "users" : "lenders";
          const altRef = doc(db, altCollection, uid);
          const altSnap = await getDoc(altRef);

          if (altSnap.exists()) {
            const data = altSnap.data();
            setCollectionPath(altCollection);
            localStorage.setItem("collectionPath", altCollection);
            
            setProfileData({
              fullName: data.fullName || "",
              bio: data.bio || "",
              email: data.email || user.email || "",
              phone: data.phone || "",
              panId: data.panId || "",
              photoURL: data.photoURL || "",
              walletAddress: data.walletAddress || "",
            });

            const userRole = altCollection === "lenders" ? "lender" : "borrower";
            setRole(userRole);
            localStorage.setItem("userRole", userRole);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const updateWallet = async () => {
      if (user && isConnected && address && profileData.walletAddress !== address) {
        try {
          const ref = doc(db, collectionPath, user.uid);
          await setDoc(ref, { walletAddress: address }, { merge: true });
          setProfileData((prev) => ({ ...prev, walletAddress: address }));
          toast.success("Wallet address saved");
        } catch (err) {
          console.error("Error updating wallet:", err);
          toast.error("Failed to update wallet address");
        }
      }
    };
    updateWallet();
  }, [isConnected, address, collectionPath, user]);

  const handleChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      if (!user) return;
      const ref = doc(db, collectionPath, user.uid);
      await setDoc(ref, { ...profileData, role }, { merge: true });
      toast.success("Profile updated");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Update failed");
    }
  };

  const handleCloudinaryUpload = () => {
    if (!window.cloudinary || !window.cloudinary.createUploadWidget) {
      return toast.error("Cloudinary not ready.");
    }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "dg3fyadhh",
        uploadPreset: "avatar_preset",
        folder: "avatars",
        cropping: true,
      },
      async (err, result) => {
        if (err) {
          console.error("Cloudinary error:", err);
          toast.error("Upload failed");
          return;
        }
        if (result.event === "success") {
          const img = result.info.secure_url;
          try {
            await setDoc(doc(db, collectionPath, user.uid), { photoURL: img }, { merge: true });
            setProfileData((prev) => ({ ...prev, photoURL: img }));
            toast.success("Photo uploaded");
          } catch (err) {
            console.error("Photo save error:", err);
            toast.error("Failed to save photo");
          }
        }
      }
    );
    widget.open();
  };

  if (!user) return <div className="text-white p-10 text-center">Please log in</div>;
  if (loading) return <div className="text-white p-10 text-center">Loading profile...</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white p-6 pt-24 relative">
        <div className="sticky top-20 z-50 float-right mr-4">
          <ConnectButton />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          <img
            src={profileData.photoURL || "https://api.dicebear.com/7.x/bottts/svg?seed=TrustBridge"}
            alt="Avatar"
            className="w-36 h-36 rounded-full border-4 border-purple-500"
          />
          <div>
            <h2 className="text-3xl font-bold">{profileData.fullName}</h2>
            <p className="bg-gradient-to-r from-purple-500 to-blue-500 inline-block mt-2 px-4 py-1 rounded-full text-white font-medium">
              Role: {role.charAt(0).toUpperCase() + role.slice(1)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["email", "phone", "panId", "bio"].map((field) => (
            <div key={field}>
              <p className="text-gray-400 capitalize">{field.replace(/([A-Z])/g, " $1")}</p>
              <p className="text-xl">{profileData[field] || "Not set"}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full"
          >
            Edit Profile
          </button>
        </div>

        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              <div className="text-center mb-4">
                <img
                  src={profileData.photoURL || "https://api.dicebear.com/7.x/bottts/svg?seed=TrustBridge"}
                  alt="avatar-preview"
                  className="w-24 h-24 rounded-full mx-auto border-4 border-purple-500"
                />
              </div>
              <button
                onClick={handleCloudinaryUpload}
                className="mb-4 w-full bg-purple-600 p-2 rounded"
              >
                Upload Profile Image
              </button>
              {["fullName", "phone", "panId", "bio"].map((field) => (
                <div className="mb-3" key={field}>
                  <label className="text-sm text-gray-400 capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </label>
                  <input
                    className="w-full bg-gray-800 p-2 rounded mt-1"
                    value={profileData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                  />
                </div>
              ))}
              <div className="text-right mt-4 space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-600 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSave();
                    setIsEditModalOpen(false);
                  }}
                  className="bg-blue-600 px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <hr className="my-10 border-gray-700" />
        <Footer />
      </div>
    </>
  );
}