
import { User } from '../utils/types';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from './../backend/firebase';


// Helper functions to work with user data
export const doesUserEmailExist = async (email: string): Promise<boolean> => {
  const q = query(
    collection(db, 'users'),
    where('email', '==', email),
    limit(1)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// export const validateCredentials = (email: string, password: string): User | null => {
//   const user = findUserByEmail(email);
//   if (user && user.password === password) {
//     return user;
//   }
//   return null;
// };

export const getCustomerUsers = async (): Promise<User[]> => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'customer')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<User, 'id'>),
  }));
};