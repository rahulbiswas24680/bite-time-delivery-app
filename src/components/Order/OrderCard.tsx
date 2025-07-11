import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem, Order } from '../../utils/types';
import { getMenuItemById } from '../../data/menuItems';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Loader2 } from 'lucide-react';
import OrderDetailsModal from './OrderDetailsModal';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface OrderCardProps {
  order: Order;
  showActions?: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, showActions = true }) => {
  const navigate = useNavigate();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { currentUser, currentShopId, currentShopSlug } = useAuth();
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem>>({});
  const [loadingMenuItems, setLoadingMenuItems] = useState(true);


  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoadingMenuItems(true);
        const itemsMap: Record<string, MenuItem> = {};

        // Use Promise.all for parallel fetching
        const promises = order.items.map(async (item) => {
          try {
            const menuItem = await getMenuItemById(item.menuItemId);
            if (menuItem) {
              itemsMap[item.menuItemId] = menuItem;
            }
          } catch (error) {
            console.error(`Failed to fetch menu item ${item.menuItemId}:`, error);
          }
        });

        await Promise.all(promises);
        console.log('menuItems--', itemsMap);
        setMenuItems(itemsMap);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      } finally {
        setLoadingMenuItems(false);
      }
    };

    fetchItems();
  }, [order.items, currentShopId]);

  // console.log('menuItem--', menuItems);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getPaymentStatusClass = (paymentStatus: Order['paymentStatus']) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusClass = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-purple-100 text-purple-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };





  const handlePayment = async () => {
    const amount = 100; // INR

    // Create order on your server
    const { data } = await axios.post('http://localhost:5000/create-order', {
      amount,
    });

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: 'Bite Lime',
      description: 'Order Payment',
      order_id: data.id,
      image: 'https://play-lh.googleusercontent.com/G4i17GWZ1Oj7c9A1d_hUCJD2YTIjFuclxnopouHJOv9lKrS88QJ6zbrucK3nJ76gj6A',
      handler: function (response: any) {
        alert('Payment successful');
        console.log(response);
        // Here, save response.razorpay_payment_id to Firebase
      },
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc',
      },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
            <div className="flex flex-wrap gap-2">
              <span className="text-slate-500 font-semibold">Payment: </span>
              <Badge variant="outline" className={getPaymentStatusClass(order.paymentStatus)}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Badge>
              <span className="text-slate-500 font-semibold">Order Status: </span>
              <Badge variant="outline" className={getStatusClass(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed on: {new Date(order.createdAt.seconds * 1000).toLocaleString("en-US")}
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
            {loadingMenuItems ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="ml-2">Loading items...</span>
              </div>
            ) : (
              <ul className="space-y-1">
                {order.items.map((item) => {
                  const menuItem = menuItems[item.menuItemId];
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
                        ₹{((menuItem?.price || 0) * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="pt-2 border-t flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-food-orange">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>

        {showActions && (
          <CardFooter className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full justify-between items-center">
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Button>
                <Button
                  onClick={() => navigate(`/customer/${currentShopSlug}/chat/${order.id}`)}
                  className="bg-food-orange hover:bg-orange-600 w-full sm:w-auto"
                >
                  Chat with Restaurant
                </Button>
              </div>
              {order.paymentStatus === 'pending' && currentUser?.role === 'owner' && (
                <Button
                  onClick={() => handlePayment()}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  Mark As Paid <span><small>(Used for Cash Payment)</small></span>
                </Button>
              )}
            </div>
          </CardFooter>)}
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
