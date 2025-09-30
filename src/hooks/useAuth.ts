import { useState, useEffect, createContext, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
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
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
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

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email,
        name,
        createdAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
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

  return {
    user,
    login,
    loginWithGoogle,
    signup,
    logout,
    isLoading,
  };
};