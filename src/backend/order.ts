import { addDoc, collection, deleteDoc, doc, DocumentSnapshot, getCountFromServer, getDoc, getDocs, limit, orderBy, query, serverTimestamp, startAfter, Timestamp, updateDoc, where } from "firebase/firestore";
import { Order } from '../utils/types';
import { db } from './firebase';

export const updateUserAddress = async (userId: string, address: string) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { address });
};

export const createOrder = async (order: any) => {
  const orderRef = await addDoc(collection(db, "orders"), {
    ...order,
    createdAt: serverTimestamp(), // Use serverTimestamp for consistency
  });
  return orderRef.id;
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const docRef = doc(db, 'orders', orderId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Order;
};

export const deleteOrderById = async (orderId: string): Promise<void> => {
  const orderRef = doc(db, 'orders', orderId);
  const orderSnap = await getDoc(orderRef);

  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }

  await deleteDoc(orderRef);
};



// backend/order.ts
export const getOrdersByCustomerId = async (
  customerId: string,
  shopId: string,
  lastDoc: DocumentSnapshot | null = null
): Promise<{ data: any[]; lastDoc: DocumentSnapshot | null }> => {
  let q = query(
    collection(db, 'orders'),
    where('customerId', '==', customerId),
    where('shopId', '==', shopId),
    orderBy('createdAt', 'desc'),
    limit(5)
  );

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);

  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    data,
    lastDoc: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null,
  };
};



export const getOrdersByShopId = async (shopId: string): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('shopId', '==', shopId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Omit<Order, 'id'>) }));
};


export const fetchOrdersByStatus = async (
  status: string,
  shopId: string,
  lastDoc: DocumentSnapshot | null = null,
  dateFilter: string = 'today'
): Promise<{
  data: Order[];
  total: number;
  lastDoc: DocumentSnapshot | null;
}> => {
  // Get starting timestamp based on the selected range
  const now = new Date();
  let startTime: Date;

  switch (dateFilter) {
    case 'week':
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
      startTime = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'year':
      startTime = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case 'all':
      startTime = new Date(0);
      break;
    case 'today':
    default:
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
  }

  const timestamp = Timestamp.fromDate(startTime);

  // Base query
  let ordersQuery = query(
    collection(db, 'orders'),
    where('shopId', '==', shopId),
    where('status', '==', status),
    where('createdAt', '>=', timestamp),
    orderBy('createdAt', 'desc'),
    limit(5)
  );

  if (lastDoc) {
    ordersQuery = query(ordersQuery, startAfter(lastDoc));
  }

  // Count query
  const countQuery = query(
    collection(db, 'orders'),
    where('shopId', '==', shopId),
    where('status', '==', status),
    where('createdAt', '>=', timestamp)
  );

  const [snapshot, countSnap] = await Promise.all([
    getDocs(ordersQuery),
    getCountFromServer(countQuery)
  ]);

  const data = snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Order, 'id'>),
  }));

  return {
    data,
    total: countSnap.data().count,
    lastDoc: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null,
  };
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



export const savePaymentToFirestore = async ({
  razorpayOrderId,
  razorpayPaymentId,
  amount,
  userId,
  shopId,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  userId: string;
  shopId: string;
}) => {
  const paymentData = {
    razorpayOrderId,
    razorpayPaymentId,
    shopId,
    userId,
    amount,
    paymentMethod: 'online',
    status: 'completed',
    paymentDate: new Date().toISOString(),
    timestamp: serverTimestamp(),
  };

  const paymentRef = await addDoc(collection(db, 'paymentCollection'), paymentData);
  return { id: paymentRef.id, ...paymentData };
}

export const updateOrderPaymentStatus = async (
  shopId: string,
  orderId: string,
  paymentStatus: Order['paymentStatus']
): Promise<void> => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      throw new Error(`Order ${orderId} not found`);
    }

    const orderData = orderSnap.data() as Order;

    // Verify the order belongs to the provided shop
    if (orderData.shopId !== shopId) {
      throw new Error(`Unauthorized: Order ${orderId} does not belong to shop ${shopId}`);
    }

    // Only update status to 'completed' if payment is successful
    const updatePayload: Partial<Order> = { paymentStatus };
    if (paymentStatus === 'paid') {
      updatePayload.status = 'completed';
    }

    await updateDoc(orderRef, updatePayload);
    console.log(`Order ${orderId} payment status updated to ${paymentStatus}`);
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error; // Re-throw to let calling code handle it
  }
};