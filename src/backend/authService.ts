import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


export const signupUser = async (email: string, password: string, name: string, phone: string, role: 'customer' | 'owner') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  // Save custom user fields in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    id: user.uid,
    name,
    email,
    phone,
    role,
    createdAt: new Date().toISOString()
  });

  return user;
}

export function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}
