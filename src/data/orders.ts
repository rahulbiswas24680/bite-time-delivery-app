
import { Order } from '../utils/types';
import { getMenuItemById } from './menuItems';

// Static order data for demonstration
export const orders: Order[] = [
  {
    id: '1',
    customerId: '1',
    items: [
      { menuItemId: '1', quantity: 2 },
      { menuItemId: '4', quantity: 1, specialInstructions: 'Extra spicy please' }
    ],
    status: 'confirmed',
    totalAmount: 28.97,
    createdAt: '2025-04-20T15:30:00Z',
    estimatedPickupTime: '2025-04-20T16:00:00Z',
  },
  {
    id: '2',
    customerId: '3',
    items: [
      { menuItemId: '2', quantity: 1 },
      { menuItemId: '6', quantity: 2 }
    ],
    status: 'pending',
    totalAmount: 26.97,
    createdAt: '2025-04-21T10:15:00Z',
  },
  {
    id: '3',
    customerId: '1',
    items: [
      { menuItemId: '5', quantity: 1 },
      { menuItemId: '3', quantity: 1 }
    ],
    status: 'completed',
    totalAmount: 16.48,
    createdAt: '2025-04-19T12:45:00Z',
    estimatedPickupTime: '2025-04-19T13:15:00Z',
  },
];

// Helper functions to work with order data
export const getOrderById = (id: string): Order | undefined => {
  return orders.find(order => order.id === id);
};

export const getOrdersByCustomerId = (customerId: string): Order[] => {
  return orders.filter(order => order.customerId === customerId);
};

export const getPendingOrders = (): Order[] => {
  return orders.filter(order => ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status));
};

export const updateOrderStatus = (orderId: string, status: Order['status']): void => {
  const order = orders.find(order => order.id === orderId);
  if (order) {
    order.status = status;
    
    // If confirming the order, set an estimated pickup time 30 minutes from now
    if (status === 'confirmed') {
      const pickupTime = new Date();
      pickupTime.setMinutes(pickupTime.getMinutes() + 30);
      order.estimatedPickupTime = pickupTime.toISOString();
    }
  }
};

export const addNewOrder = (order: Omit<Order, 'id' | 'createdAt'>): Order => {
  const newOrder: Order = {
    ...order,
    id: (orders.length + 1).toString(),
    createdAt: new Date().toISOString(),
  };
  
  orders.push(newOrder);
  return newOrder;
};

export const calculateOrderTotal = (items: { menuItemId: string; quantity: number }[]): number => {
  return items.reduce((total, item) => {
    const menuItem = getMenuItemById(item.menuItemId);
    return total + (menuItem ? menuItem.price * item.quantity : 0);
  }, 0);
};
