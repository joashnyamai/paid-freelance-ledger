import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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

  useEffect(() => {
    console.log('Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
            
            const user = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name || firebaseUser.email!.split('@')[0],
              createdAt: userData.createdAt || new Date().toISOString()
            };
            
            console.log('Setting user state:', user);
            setUser(user);
          } else {
            console.warn('User document does not exist in Firestore');
            // Create a minimal user object
            const minimalUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.email!.split('@')[0],
              createdAt: new Date().toISOString()
            };
            console.log('Setting minimal user state:', minimalUser);
            setUser(minimalUser);
          }
        } catch (error) {
          console.error('Error in auth state listener:', error);
          // Don't set user to null on error
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting to sign in with email:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase authentication successful:', userCredential.user.uid);
      
      try {
        // Get the user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const user = {
            id: userCredential.user.uid,
            email: userCredential.user.email!,
            name: userData.name || userCredential.user.email!.split('@')[0],
            createdAt: userData.createdAt || new Date().toISOString()
          };
          console.log('Setting user state from Firestore:', user);
          setUser(user);
        } else {
          console.warn('User document not found in Firestore, creating minimal user');
          const minimalUser = {
            id: userCredential.user.uid,
            email: userCredential.user.email!,
            name: userCredential.user.email!.split('@')[0],
            createdAt: new Date().toISOString()
          };
          console.log('Setting minimal user state:', minimalUser);
          setUser(minimalUser);
        }
        return true;
      } catch (firestoreError) {
        console.error('Error fetching user data from Firestore:', firestoreError);
        // Continue with authentication even if Firestore fails
        const minimalUser = {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: userCredential.user.email!.split('@')[0],
          createdAt: new Date().toISOString()
        };
        setUser(minimalUser);
        return true;
      }
    } catch (error: any) {
      console.error('Authentication error:', {
        code: error.code,
        message: error.message,
        email: email,
        timestamp: new Date().toISOString()
      });
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    login,
    signup,
    logout,
    isLoading
  };
};