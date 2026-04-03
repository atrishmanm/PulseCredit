import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { setDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

interface UserData {
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  dailyCalorieGoal?: number;
  disease?: 'none' | 'diabetes' | 'obesity' | 'hypertension';
  diseaseSetAt?: number;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signup: (email: string, password: string, userData: Partial<UserData>) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUserDisease: (disease: 'none' | 'diabetes' | 'obesity' | 'hypertension') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, data: Partial<UserData>) => {
    try {
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);

      const userDocRef = doc(db, 'users', newUser.uid);
      const fullUserData: UserData = {
        email,
        ...data,
        createdAt: Date.now(),
      };

      await setDoc(userDocRef, fullUserData);
      setUserData(fullUserData);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const setUserDisease = async (disease: 'none' | 'diabetes' | 'obesity' | 'hypertension') => {
    if (!user) throw new Error('User not authenticated');
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        disease,
        diseaseSetAt: Date.now(),
      });
      setUserData(prev => prev ? { ...prev, disease, diseaseSetAt: Date.now() } : null);
    } catch (error) {
      console.error('Error updating disease:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signup, login, logout, setUserDisease }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
