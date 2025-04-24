
import React from 'react';
import { Order } from '../../utils/types';
import OrderCard from './OrderCard';

interface OrdersListProps {
  orders: Order[];
  showActions?: boolean;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, showActions = true }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No orders found
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <OrderCard 
          key={order.id} 
          order={order}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default OrdersList;
