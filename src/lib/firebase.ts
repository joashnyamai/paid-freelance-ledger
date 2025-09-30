import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  User as FirebaseUser,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  applyActionCode,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
  updateProfile as firebaseUpdateProfile
} from "firebase/auth";

type ActionCodeInfo = {
  data: {
    email?: string;
    fromEmail?: string;
  };
  operation: string;
};
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    throw new Error(`Firebase configuration error: ${envVar} is not set`);
  }
}

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
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Email verification
export const sendEmailVerification = async (user: FirebaseUser) => {
  try {
    await firebaseSendEmailVerification(user);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  try {
    // Get the current domain
    const actionCodeSettings = {
      url: `${window.location.origin}/password-reset`,
      handleCodeInApp: true
    };
    
    await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const verifyEmail = async (oobCode: string) => {
  try {
    await applyActionCode(auth, oobCode);
    return true;
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
};

export const resetPassword = async (oobCode: string, newPassword: string) => {
  try {
    await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
    return true;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

export const verifyPasswordResetOobCode = async (oobCode: string): Promise<string> => {
  try {
    // Verify the password reset code and return the associated email
    const email = await firebaseVerifyPasswordResetCode(auth, oobCode);
    return email;
  } catch (error) {
    console.error("Error verifying password reset code:", error);
    throw error;
  }
};
