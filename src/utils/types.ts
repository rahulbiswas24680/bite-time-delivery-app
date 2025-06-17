
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'owner';
  linkedShops?: string[];
}

export interface Category {
  id: string;
  shopId: string;
  name: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

// For form state, use a separate type that allows File
export interface MenuItemForm extends Omit<MenuItem, 'image'> {
  image: string | File; // Can be either during editing
}

export interface Order {
  id: string;
  customerId: string;
  shopId: string;
  name: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: {
    menuItemId: string;
    quantity: number;
    specialInstructions?: string;
  }[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  totalAmount: number;
  createdAt: string;
  estimatedPickupTime?: string;
  specialInstructions?: string;
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

export interface ShopDetails {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  openingHours?: string;
  closingHours?: string;
  menuItems?: MenuItem[];
}