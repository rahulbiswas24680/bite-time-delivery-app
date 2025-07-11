
import { updateOrderStatusChange } from '@/backend/order';
import { Order } from '../utils/types';




// Helper functions to work with order data
export const getOrderById = (orders: Order[], id: string): Order | undefined => {
  return orders.find(order => order.id === id);
};

export const getOrdersByCustomerId = (orders: Order[], customerId: string): Order[] => {
  return orders.filter(order => order.customerId === customerId);
};

export const getPendingOrders = (orders: Order[]): Order[] => {
  return orders.filter(order => ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status));
};

export const updateOrderStatus = (orders: Order[], orderId: string, status: Order['status'], shopId: string): void => {
  const order = orders.find(order => order.id === orderId);
  if (order) {
    updateOrderStatusChange(shopId, orderId, status);
    order.status = status;
  }
};

export const addNewOrder = (orders: Order[], order: Omit<Order, 'id' | 'createdAt'>): Order => {
  const newOrder: Order = {
    ...order,
    id: (orders.length + 1).toString(),
    createdAt: new Date().toISOString(),
  };
  
  orders.push(newOrder);
  return newOrder;
};
