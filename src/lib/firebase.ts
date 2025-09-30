import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

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

export const googleProvider = new GoogleAuthProvider();

// Helper function to handle user data in Firestore
export const createUserDocument = async (user: FirebaseUser) => {
  if (!user.email) return null;
  
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();

    try {
      await setDoc(userDocRef, {
        displayName: displayName || email?.split('@')[0],
        email,
        photoURL,
        createdAt,
      });
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }

  return userDocRef;
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocument(result.user);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};
