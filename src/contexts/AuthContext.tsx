import { onAuthStateChanged } from 'firebase/auth';
import { arrayUnion, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, logoutUser, signupUser } from '../backend/authService';
import { auth, db } from '../backend/firebase';
import { User } from '../utils/types';
import { slugify } from '@/utils/utils';

interface ShopData {
  id: string;
  slug: string;
}


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
  currentShopId: string | null;
  currentShopSlug: string | null;
  setCurrentShopId: (shopId: string | null) => void;
  setCurrentShopSlug: (shopSlug: string | null) => void;
  fetchAndSetShopData: (userId: string) => Promise<{ id: string | null; slug: string | null }>;
  fetchAndSetCustomerShopsData: (customerId: string) => Promise<{ id: string | null; slug: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


const fetchOwnerShopData = async (ownerId: string): Promise<{ id: string | null; slug: string | null }> => {
  /** use this function only for owner shops */
  try {
    const q = query(collection(db, 'shops'), where('ownerId', '==', ownerId));
    const shopSnapshot = await getDocs(q);
    if (shopSnapshot.docs.length > 0) {
      const firstShop = shopSnapshot.docs[0];
      const shopData = firstShop.data();
      console.log('Shop Data:', shopData);
      const shopName = shopData.name || 'shop';
      const shopSlug = slugify(shopName) || 'default-slug';

      return {
        id: firstShop.id,
        slug: shopSlug
      };
    }
    return { id: null, slug: null };
  } catch (error) {
    console.error("Error fetching shop ID:", error);
    return null;
  }
};

const fetchCustomerShopsData = async (customerId: string): Promise<{ id: string | null; slug: string | null }> => {
  try {
    // 1. Get user document to check linked shops
    const userRef = doc(db, 'users', customerId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { id: null, slug: null };
    }

    const userData = userSnap.data();
    const linkedShops = userData.linkedShops || [];

    // 2. If no linked shops, return null values
    if (linkedShops.length === 0) {
      return { id: null, slug: null };
    }

    // 3. Get the first linked shop's data
    const shopId = linkedShops[0];
    const shopDoc = await getDoc(doc(db, 'shops', shopId));

    if (!shopDoc.exists()) {
      return { id: null, slug: null };
    }

    const shopData = shopDoc.data();
    console.log('Shop Data:', shopData, shopId);
    const shopSlug = slugify(shopData.name) || shopId;

    return {
      id: shopId,
      slug: shopSlug
    };
  } catch (error) {
    console.error("Error fetching customer shop data:", error);
    return { id: null, slug: null };
  }
};

// const fetchCustomerLinkedShops = async (customerId: string): Promise<string[]> => {
//   /** use this function only for customer linked shops */
//   try {
//     const userRef = doc(db, 'users', customerId);
//     const userSnap = await getDoc(userRef);

//     if (userSnap.exists()) {
//       const userData = userSnap.data() as User;
//       return userData.linkedShops || [];
//     }
//     return [];
//   } catch (error) {
//     console.error("Error fetching customer's linked shops:", error);
//     return [];
//   }
// };


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentShopId, setCurrentShopId] = useState<string | null>(null);
  const [currentShopSlug, setCurrentShopSlug] = useState<string | null>(null);


  const fetchAndSetShopData = async (userId: string) => {
    const { id, slug } = await fetchOwnerShopData(userId);
    setCurrentShopId(id);
    setCurrentShopSlug(slug);
    return { id, slug };
  };

  const fetchAndSetCustomerShopsData = async (customerId: string) => {
    const { id, slug } = await fetchCustomerShopsData(customerId);
    setCurrentShopId(id);
    setCurrentShopSlug(slug);
    return { id, slug };
  };

  // const setCustomerShop = async (customerId: string, shopId: string): Promise<void> => {
  //   try {
  //     const userRef = doc(db, 'users', customerId);
  //     await updateDoc(userRef, {
  //       linkedShops: arrayUnion(shopId)
  //     });

  //     // Update local state
  //     setCurrentUser(prev => prev ? {
  //       ...prev,
  //       linkedShops: [...(prev.linkedShops || []), shopId]
  //     } : null);

  //     setCurrentShopId(shopId);

  //     // Optionally fetch and set shop slug
  //     const shopDoc = await getDoc(doc(db, 'shops', shopId));
  //     if (shopDoc.exists()) {
  //       const shopData = shopDoc.data();
  //       const shopSlug = slugify(shopData.name) || shopId;
  //       setCurrentShopSlug(shopSlug);
  //     }
  //   } catch (error) {
  //     console.error("Error setting customer's shop:", error);
  //     throw error;
  //   }
  // };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        let appUser: User | null = null;
        appUser = {
          id: user.uid,
          email: user.email || '',
          name: userData.name || user.displayName || '',
          phone: userData.phone || '',
          role: userData.role as ('customer' | 'owner'),
        };
        setCurrentUser(appUser);

        if (appUser.role === 'owner') {
          await fetchAndSetShopData(appUser.id);
        } else if (appUser.role === 'customer') {
          await fetchAndSetCustomerShopsData(appUser.id);
        }
        setLoading(false);
      } else {
        setCurrentUser(null);
        setCurrentShopId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const signup = async (email: string, password: string, name: string, phone: string, role: 'customer' | 'owner'): Promise<User | null> => {
    setError(null);
    try {
      const { user, userData } = await signupUser(email, password, name, phone, role);

      const newUser: User = {
        id: user.uid,
        email: user.email || '',
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
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
      // 2. Fetch the custom user document from Firestore to get the role
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        setError("User profile not found. Please complete registration or contact support.");
        // If a user can exist in Firebase Auth but not in your 'users' collection,
        // you might want to redirect them to a profile completion page here.
        return null;
      }

      const loggedInUser: User = {
        id: user.uid,
        email: user.email || '',
        name: userDocSnap.data().name || '',
        phone: userDocSnap.data().phone || '',
        role: userDocSnap.data().role as ('customer' | 'owner')
      };
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      setCurrentUser(loggedInUser);

      if (loggedInUser.role === 'owner') {
        await fetchAndSetShopData(loggedInUser.id);
      } else if (loggedInUser.role === 'customer') {
        await fetchAndSetCustomerShopsData(loggedInUser.id);
      }
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
      setCurrentShopId(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const value = {
    currentUser,
    currentShopId,
    currentShopSlug,
    loading,
    login,
    logout,
    signup,
    error,
    setCurrentShopId,
    setCurrentShopSlug,
    fetchAndSetShopData,
    fetchAndSetCustomerShopsData
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
