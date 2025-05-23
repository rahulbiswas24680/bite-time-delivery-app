import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, logoutUser, signupUser } from '../backend/authService';
import { auth, db } from '../backend/firebase';
import { User } from '../utils/types';

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    phone: string,
    role: 'customer' | 'owner'
  ) => Promise<User | null>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        setCurrentUser({
          id: user.uid,
          email: user.email || '',
          name: userData.name || user.displayName || '',
          phone: userData.phone || '',
          role: userData.role || 'customer',
          password: ''
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const signup = async (email: string, password: string, name: string, phone: string, role: 'customer' | 'owner'): Promise<User | null> => {
    setError(null);
    try {
      const userCredential = await signupUser(email, password, name, phone, role);
      const user = userCredential;

      const newUser: User = {
        id: user.uid,
        email: user.email || '',
        name,
        phone: '',
        role: 'customer',
        password
      };

      setCurrentUser(newUser);
      return newUser;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    setError(null);
    try {
      const userCredential = await loginUser(email, password);
      const user = userCredential.user;

      const loggedInUser: User = {
        id: user.uid,
        email: user.email || '',
        name: user.displayName || '',
        phone: '',
        role: 'customer',
        password
      };
      const { password: _, ...userWithoutPassword } = loggedInUser;
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setCurrentUser(loggedInUser);
      return loggedInUser;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };
  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    signup,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
