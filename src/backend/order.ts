import { addDoc, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";
import { Order } from '../utils/types';
import { db } from './firebase';

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

export const getOrderById = async (orderId: string) => {
  const docRef = doc(db, 'orders', orderId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};


export const getOrdersByCustomerId = async (customerId: string, shopId:string) => {
  const q = query(
    collection(db, 'orders'), 
    where('customerId', '==', customerId),
    where('shopId', '==', shopId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


export const getOrdersByShopId = async (shopId: string): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('shopId', '==', shopId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Order, 'id'>) }));
};



export const updateOrderStatusChange = async (
  shopId: string,
  orderId: string,
  status: Order['status']
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error('Order not found');
    }

    const orderData = orderSnap.data() as Order;

    // ✅ Double check the order belongs to the provided shop
    if (orderData.shopId !== shopId) {
      throw new Error('Unauthorized: Order does not belong to this shop');
    }

    const updatePayload: Partial<Order> = { status };

    // If confirming, add estimatedPickupTime
    if (status === 'confirmed') {
      const pickupTime = new Date();
      pickupTime.setMinutes(pickupTime.getMinutes() + 30);
      updatePayload.estimatedPickupTime = pickupTime.toISOString();
    }

    await updateDoc(orderRef, updatePayload);
    console.log(`Order ${orderId} status updated to ${status}`);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};