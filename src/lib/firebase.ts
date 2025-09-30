import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBt2jPDjPWh5wqPhRbnVAY9mb98kkoIzv0",
  authDomain: "smart-car-parking-1862c.firebaseapp.com",
  projectId: "smart-car-parking-1862c",
  storageBucket: "smart-car-parking-1862c.firebasestorage.app",
  messagingSenderId: "472243026153",
  appId: "1:472243026153:web:c37f2ead2ac9861632d878",
  measurementId: "G-7H9S8EV884"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
