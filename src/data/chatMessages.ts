
import { ChatMessage } from '../utils/types';

// Static chat message data for demonstration
export const chatMessages: ChatMessage[] = [
  {
    id: '1',
    senderId: '1', // Customer
    receiverId: '2', // Owner
    message: 'Hi, can I get extra napkins with my order?',
    timestamp: '2025-04-20T15:35:00Z',
    orderId: '1',
  },
  {
    id: '2',
    senderId: '2', // Owner
    receiverId: '1', // Customer
    message: 'Yes, we\'ll include extra napkins with your order.',
    timestamp: '2025-04-20T15:36:30Z',
    orderId: '1',
  },
  {
    id: '3',
    senderId: '1', // Customer
    receiverId: '2', // Owner
    message: 'Thank you! Also, is it possible to make the burger medium-rare?',
    timestamp: '2025-04-20T15:37:45Z',
    orderId: '1',
  },
  {
    id: '4',
    senderId: '2', // Owner
    receiverId: '1', // Customer
    message: 'Yes, we can do that for you. Your order will be ready at 4:00 PM.',
    timestamp: '2025-04-20T15:38:20Z',
    orderId: '1',
  },
  {
    id: '5',
    senderId: '3', // Another customer
    receiverId: '2', // Owner
    message: 'Do you offer any discounts for large orders?',
    timestamp: '2025-04-21T10:16:10Z',
    orderId: '2',
  },
  {
    id: '6',
    senderId: '2', // Owner
    receiverId: '3', // Another customer
    message: 'Yes, we offer 10% off for orders over $50. Would you like to add more items to qualify?',
    timestamp: '2025-04-21T10:17:30Z',
    orderId: '2',
  },
];

// Helper functions to work with chat data
export const getChatHistoryByOrderId = (orderId: string): ChatMessage[] => {
  return chatMessages.filter(message => message.orderId === orderId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const getChatHistoryByUser = (userId: string): ChatMessage[] => {
  return chatMessages.filter(message => 
    message.senderId === userId || message.receiverId === userId
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const addChatMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
  const newMessage: ChatMessage = {
    ...message,
    id: (chatMessages.length + 1).toString(),
    timestamp: new Date().toISOString(),
  };
  
  chatMessages.push(newMessage);
  return newMessage;
};
