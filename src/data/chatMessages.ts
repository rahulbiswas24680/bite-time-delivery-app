
import { ChatMessage } from '@/utils/types';
import { getDatabase, off, onValue, push, ref, set } from "firebase/database";
import { serverTimestamp } from 'firebase/firestore';

// Static chat message data for demonstration
// export const chatMessages: ChatMessage[] = [
//   {
//     id: '1',
//     senderId: '1', // Customer
//     receiverId: '2', // Owner
//     message: 'Hi, can I get extra napkins with my order?',
//     timestamp: '2025-04-20T15:35:00Z',
//     orderId: '1',
//   },
//   {
//     id: '2',
//     senderId: '2', // Owner
//     receiverId: '1', // Customer
//     message: 'Yes, we\'ll include extra napkins with your order.',
//     timestamp: '2025-04-20T15:36:30Z',
//     orderId: '1',
//   },
//   {
//     id: '3',
//     senderId: '1', // Customer
//     receiverId: '2', // Owner
//     message: 'Thank you! Also, is it possible to make the burger medium-rare?',
//     timestamp: '2025-04-20T15:37:45Z',
//     orderId: '1',
//   },
//   {
//     id: '4',
//     senderId: '2', // Owner
//     receiverId: '1', // Customer
//     message: 'Yes, we can do that for you. Your order will be ready at 4:00 PM.',
//     timestamp: '2025-04-20T15:38:20Z',
//     orderId: '1',
//   },
//   {
//     id: '5',
//     senderId: '3', // Another customer
//     receiverId: '2', // Owner
//     message: 'Do you offer any discounts for large orders?',
//     timestamp: '2025-04-21T10:16:10Z',
//     orderId: '2',
//   },
//   {
//     id: '6',
//     senderId: '2', // Owner
//     receiverId: '3', // Another customer
//     message: 'Yes, we offer 10% off for orders over $50. Would you like to add more items to qualify?',
//     timestamp: '2025-04-21T10:17:30Z',
//     orderId: '2',
//   },
// ];

// Helper functions to work with chat data
// export const getChatHistoryByOrderId = async (orderId: string): Promise<ChatMessage[]> => {
//   const q = query(
//     collection(db, 'chats', orderId, 'messages'),
//     orderBy('timestamp', 'asc')
//   );
//   const snapshot = await getDocs(q);
//   return snapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data()
//   })) as ChatMessage[];
// };

// export const getChatHistoryByUser = async (userId: string): Promise<ChatMessage[]> => {
//   const sentQuery = query(
//     collectionGroup(db, 'messages'),
//     where('senderId', '==', userId),
//     orderBy('timestamp', 'asc')
//   );
//   const sentSnapshot = await getDocs(sentQuery);

//   const receivedQuery = query(
//     collectionGroup(db, 'messages'),
//     where('receiverId', '==', userId),
//     orderBy('timestamp', 'asc')
//   );
//   const receivedSnapshot = await getDocs(receivedQuery);

//   const convertDoc = (doc: any): ChatMessage => {
//     const data = doc.data();
//     return {
//       id: doc.id,
//       senderId: data.senderId,
//       receiverId: data.receiverId,
//       message: data.message,
//       timestamp: (data.timestamp instanceof Timestamp)
//         ? data.timestamp.toDate().toISOString()
//         : new Date(data.timestamp).toISOString(),
//       orderId: data.orderId ?? undefined,
//     };
//   };

//   const messages = [
//     ...sentSnapshot.docs.map(convertDoc),
//     ...receivedSnapshot.docs.map(convertDoc),
//   ];

//   return messages.sort(
//     (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
//   );
// };
  const db = getDatabase();

export const sendChatMessage = async (
  orderId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
) => {
  const messagesRef = ref(db, `chats/${orderId}/messages`);
  const newMessageRef = push(messagesRef); // generate new unique key

  await set(newMessageRef, {
    ...message,
    timestamp: serverTimestamp()
  });
};

export const listenToChatMessages = (
  orderId: string,
  callback: (messages: ChatMessage[]) => void
) => {
  const messagesRef = ref(db, `chats/${orderId}/messages`);

  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();

    const messages: ChatMessage[] = data
      ? Object.entries(data).map(([id, val]: any) => {
          const rawTimestamp = val.timestamp;

          let isoTimestamp = '';
          if (typeof rawTimestamp === 'number') {
            // Firebase timestamps are often numbers
            isoTimestamp = new Date(rawTimestamp).toISOString();
          } else if (typeof rawTimestamp === 'string' && !isNaN(Date.parse(rawTimestamp))) {
            // Already a valid string date
            isoTimestamp = new Date(rawTimestamp).toISOString();
          } else {
            // Fallback for missing or invalid timestamp
            isoTimestamp = new Date().toISOString();
          }

          return {
            id,
            ...val,
            timestamp: isoTimestamp,
          };
        })
      : [];

    messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    callback(messages);
  });

  return () => off(messagesRef); // To unsubscribe
};