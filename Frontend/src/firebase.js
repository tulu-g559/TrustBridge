// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
   measurementId: "YOUR_MEASUREMENT_ID"
};
const firebaseConfig = {
  apiKey: "AIzaSyAK-B9eYG4pfD7cfFg-b6QxYX6lrG4l2B0",
  authDomain: "trustbridge-61301.firebaseapp.com",
  projectId: "trustbridge-61301",
  storageBucket: "trustbridge-61301.firebasestorage.app",
  messagingSenderId: "682714931571",
  appId: "1:682714931571:web:a944560965269120c5e506",
  measurementId: "G-4GFKPC0H15"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const db = getFirestore(app);
