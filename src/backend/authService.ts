import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut, getAuth, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';


export const signupUser = async (email: string, password: string, name: string, phone: string, role: 'customer' | 'owner') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  // Save custom fields in Firestore
  const userData = {
    id: user.uid,
    email,
    name,
    phone,
    role,
    isAnonymous: false,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', user.uid), userData);

  return { user, userData };
}

export const anonymousLogin = async () => {
  const auth = getAuth();
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Anonymous login failed", error);
    throw error;
  }
};



export function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}


export const addLinkedShopToUser = async (
  userId: string,
  shopId: string
): Promise<string[]> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('User document not found.');
  }

  const userData = userSnap.data();
  const existingShops: string[] = userData.linkedShops || [];

  // Only add if not already linked
  if (!existingShops.includes(shopId)) {
    const updatedShops = [...existingShops, shopId];
    await updateDoc(userRef, {
      linkedShops: updatedShops,
    });
    return updatedShops;
  }

  return existingShops;
};