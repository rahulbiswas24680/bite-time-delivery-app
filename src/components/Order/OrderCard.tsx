import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../utils/types';
import { getMenuItemById } from '../../data/menuItems';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';

interface OrderCardProps {
  order: Order;
  showActions?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, showActions = true }) => {
  const navigate = useNavigate();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const getStatusClass = (status: Order['status']) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <Badge variant="outline" className={getStatusClass(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on: {formatDate(order.createdAt)}
          </p>
          {order.estimatedPickupTime && (
            <p className="text-sm text-food-green font-medium">
              Ready for pickup: {formatDate(order.estimatedPickupTime)}
            </p>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Order Items:</h4>
            <ul className="space-y-1">
              {order.items.map((item) => {
                const menuItem = getMenuItemById(item.menuItemId);
                return (
                  <li key={item.menuItemId} className="flex justify-between text-sm">
                    <span>
                      {item.quantity} x {menuItem?.name || 'Unknown Item'}
                      {item.specialInstructions && (
                        <span className="text-xs text-muted-foreground block ml-4">
                          Note: {item.specialInstructions}
                        </span>
                      )}
                    </span>
                    <span className="font-medium">
                      ${((menuItem?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="pt-2 border-t flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-food-orange">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        
        {showActions && (
          <CardFooter className="flex flex-col gap-2 sm:flex-row justify-between">
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(true)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
            <Button
              onClick={() => navigate(`/customer/chat/${order.id}`)}
              className="bg-food-orange hover:bg-orange-600"
            >
              Chat with Restaurant
            </Button>
          </CardFooter>
        )}
      </Card>

      <OrderDetailsModal 
        order={order}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </>
  );
};

export default OrderCard;
