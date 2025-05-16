// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics"; // Import Analytics

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsjOW7ox8EmfOpRYko1pJctYsXLBy3CA4",
  authDomain: "website-ocular.firebaseapp.com",
  projectId: "website-ocular",
  storageBucket: "website-ocular.appspot.com",
  messagingSenderId: "201119587833",
  appId: "1:201119587833:web:ed82fda48f31fec6c9b128",
  measurementId: "G-KLX9NCFCTB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app); // Khởi tạo Firestore
export const storage = getStorage(app);
// Initialize Firebase Analytics only in the browser
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Export the necessary components
export { app, db, analytics, auth, GoogleAuthProvider, signInWithPopup };
