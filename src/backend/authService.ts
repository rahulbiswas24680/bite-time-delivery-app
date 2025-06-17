import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


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
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'users', user.uid), userData);

  return { user, userData };
}

export function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}
