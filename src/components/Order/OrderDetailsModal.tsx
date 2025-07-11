
import React, { useEffect, useState } from 'react';
import { MenuItem, Order } from '@/utils/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, CreditCard, MapPin, Truck } from 'lucide-react';
import { getMenuItemById } from '@/data/menuItems';

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {

  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    const fetchMenuItems = async () => {
      const items: Record<string, MenuItem> = {};
      for (const item of order.items) {
        const menuItem = await getMenuItemById(item.menuItemId);
        console.log('menuItem???', item.menuItemId, menuItem);
        items[item.menuItemId] = menuItem;
      }
      setMenuItems(items);
    };

    fetchMenuItems();
  }, [order.items]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Order #{order.id} Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Order Details Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Information
              </h3>
              <div className="text-sm space-y-1">
                <p>Total Amount: ₹{order.totalAmount.toFixed(2)}</p>
                <p>Order Date: {new Date(order.createdAt.seconds * 1000).toLocaleString("en-US")}</p>
                <p>Status: <span className="capitalize">{order.status}</span></p>
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Order Items</h3>
              <ul className="space-y-2">
                {order.items.map((item) => {
                  const menuItem = menuItems[item.menuItemId];
                  console.log(item, 'item');

                  return (
                    <li key={item.menuItemId} className="text-sm">
                      <div className="flex justify-between">
                        <span>{item.quantity}x {menuItem?.name || 'Item not found'}</span>
                        {item.specialInstructions && (
                          <span className="text-muted-foreground">
                            Note: {item.specialInstructions}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Pickup/Delivery Section */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                {order.status === 'preparing' ? (
                  <>
                    <Truck className="h-4 w-4" />
                    Delivery Details
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    Pickup Details
                  </>
                )}
              </h3>
              <div className="text-sm space-y-1">
                {order.estimatedPickupTime ? (
                  <p>Estimated Time: {formatDate(order.estimatedPickupTime)}</p>
                ) : (
                  <p>Pickup time will be set when order is confirmed</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
