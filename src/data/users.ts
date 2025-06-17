
import { User } from '../utils/types';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from './../backend/firebase';

// Static user data for demonstration
export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'customer@example.com',
    phone: '555-123-4567',
    role: 'customer',
  },
  {
    id: '2',
    name: 'Restaurant Owner',
    email: 'owner@example.com',
    phone: '555-987-6543',
    role: 'owner',
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-555-5555',
    role: 'customer',
  },
];

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