import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  updateProfile as firebaseUpdateProfile,
  sendEmailVerification as firebaseSendEmailVerification,
  applyActionCode,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  verifyPasswordResetCode as firebaseVerifyPasswordResetCode,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from '@/lib/firebase';

export interface User {
  id: string;
  email: string | null;
  name: string;
  photoURL?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; needsVerification?: boolean; error?: string }>;
  loginWithGoogle: () => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  sendVerificationEmail: () => Promise<boolean>;
  sendPasswordResetEmail: (email: string) => Promise<boolean>;
  verifyEmail: (oobCode: string) => Promise<boolean>;
  resetPassword: (oobCode: string, newPassword: string) => Promise<boolean>;
  verifyPasswordResetCode: (oobCode: string) => Promise<string>;
  isEmailVerified: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsEmailVerified(firebaseUser.emailVerified);
      }
      console.log('Auth state changed - Firebase User:', {
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        emailVerified: firebaseUser?.emailVerified,
        isAnonymous: firebaseUser?.isAnonymous,
        providerData: firebaseUser?.providerData
      });

      if (firebaseUser) {
        try {
          console.log('Fetching user document from Firestore...');
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          console.log('User document reference:', userDocRef.path);
          
          const userDoc = await getDoc(userDocRef);
          console.log('User document exists:', userDoc.exists());
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User document data:', userData);
            
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL,
              createdAt: userData.createdAt?.toDate().toISOString() || new Date().toISOString()
            };
            
            console.log('Setting user state:', user);
            setUser(user);
          } else {
            console.log('Creating new user document in Firestore...');
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL,
              createdAt: new Date().toISOString()
            };
            
            await setDoc(userDocRef, {
              ...newUser,
              createdAt: new Date()
            });
            
            console.log('Setting new user state:', newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error in auth state listener:', error);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        console.log('No user signed in');
        setUser(null);
      }
      
      console.log('Auth state processing complete');
      setIsLoading(false);
    }, (error) => {
      console.error('Auth state listener error:', error);
      setIsLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        // Sign out the user if email is not verified
        await signOut(auth);
        return { 
          success: false, 
          needsVerification: true,
          error: 'Please verify your email before logging in. Check your inbox for the verification email.'
        };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later or reset your password.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      // Update user profile with display name
      await firebaseUpdateProfile(user, {
        displayName: name
      });
      
      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        displayName: name,
        email: email,
        createdAt: new Date(),
        emailVerified: false,
        lastSignInAt: new Date()
      });
      
      // Send verification email
      await firebaseSendEmailVerification(user);
      
      // Sign out the user to force email verification on first login
      await signOut(auth);
      
      return { 
        success: true,
        user: {
          id: user.uid,
          email: email,
          name: name,
          photoURL: user.photoURL || null,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please log in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak. Please choose a stronger password.';
          break;
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Email verification methods
  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in.');
    }
    
    try {
      await firebaseSendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/verify-email`
      });
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email. Please try again.');
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      await firebaseSendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`
      });
      return true;
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const verifyEmail = async (oobCode: string) => {
    try {
      await applyActionCode(auth, oobCode);
      
      // Update the user's email verification status in the UI
      if (auth.currentUser) {
        setIsEmailVerified(true);
      }
      
      return true;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw new Error('The email verification link is invalid or has expired.');
    }
  };

  const resetPassword = async (oobCode: string, newPassword: string) => {
    try {
      // First verify the oobCode is still valid
      await firebaseVerifyPasswordResetCode(auth, oobCode);
      
      // Then reset the password
      await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
      
      return true;
    } catch (error: any) {
      console.error('Error resetting password:', error);
      
      let errorMessage = 'Failed to reset password. The link may have expired or is invalid.';
      
      if (error.code === 'auth/weak-password') {
        errorMessage = 'The password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/expired-action-code') {
        errorMessage = 'The password reset link has expired. Please request a new one.';
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'The password reset link is invalid. Please request a new one.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const verifyPasswordResetCode = async (oobCode: string) => {
    try {
      const email = await firebaseVerifyPasswordResetCode(auth, oobCode);
      return email;
    } catch (error) {
      console.error('Error verifying password reset code:', error);
      throw new Error('The password reset link is invalid or has expired.');
    }
  };
  
  // Update email verification status when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsEmailVerified(user.emailVerified);
      }
    });
    
    return () => unsubscribe();
  }, []);

  return {
    user,
    login,
    loginWithGoogle,
    signup,
    logout,
    isLoading,
    sendVerificationEmail,
    sendPasswordResetEmail,
    verifyEmail,
    resetPassword,
    verifyPasswordResetCode,
    isEmailVerified,
  };
};