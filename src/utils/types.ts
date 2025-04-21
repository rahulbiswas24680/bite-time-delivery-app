
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'owner';
  password: string; // Note: In a real app, we'd never store plain text passwords
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  totalAmount: number;
  createdAt: string;
  estimatedPickupTime?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  orderId?: string;
}

export interface CustomerLocation {
  latitude: number;
  longitude: number;
  address?: string;
  lastUpdated: string;
}
