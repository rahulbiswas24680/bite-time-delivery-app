import { db } from './firebase';
import { doc, updateDoc, addDoc, collection, Timestamp, query, where, getDocs } from "firebase/firestore";

export const updateUserAddress = async (userId: string, address: string) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { address });
};

export const createOrder = async (order: any) => {
  const orderRef = await addDoc(collection(db, "orders"), {
    ...order,
    createdAt: Timestamp.now(),
  });
  return orderRef.id;
};


export const getOrdersByCustomerId = async (customerId: string) => {
  const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};