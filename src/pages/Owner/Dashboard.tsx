
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getPendingOrders, updateOrderStatus } from '../../data/orders';
import Navbar from '../../components/Layout/Navbar';
import { Order } from '../../utils/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getMenuItemById } from '../../data/menuItems';
import { getCustomerLocation, estimateTravelTime } from '../../data/locations';
import { users } from '../../data/users';
import Map from '../../components/Map';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // If user is not logged in or not an owner, redirect to login
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'owner') {
      navigate('/customer/menu');
    }
  }, [currentUser, navigate]);
  
  // Get all pending orders
  const pendingOrders = getPendingOrders();
  
  // Group orders by status
  const ordersByStatus: Record<string, Order[]> = {
    pending: [],
    confirmed: [],
    preparing: [],
    ready: [],
  };
  
  pendingOrders.forEach(order => {
    if (ordersByStatus[order.status]) {
      ordersByStatus[order.status].push(order);
    }
  });
  
  // Handle status update
  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    // Force a re-render
    setPendingOrders([...getPendingOrders()]);
  };
  
  // State to track orders (for re-renders)
  const [pendingOrdersState, setPendingOrders] = React.useState(pendingOrders);
  
  // Get customer name from order
  const getCustomerName = (customerId: string) => {
    const customer = users.find(user => user.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };
  
  // Format date/time
  const formatTime = (dateString?: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
          <Button 
            onClick={() => setPendingOrders([...getPendingOrders()])}
            variant="outline"
          >
            Refresh
          </Button>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Order Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-500">{ordersByStatus.pending.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">{ordersByStatus.confirmed.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Preparing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-500">{ordersByStatus.preparing.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-food-green">{ordersByStatus.ready.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Orders that need attention first */}
          {ordersByStatus.pending.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Pending Orders</h2>
              <div className="grid gap-4">
                {ordersByStatus.pending.map(order => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-yellow-50 pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {getCustomerName(order.customerId)} - {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <h4 className="font-medium">Items:</h4>
                        <ul className="space-y-1">
                          {order.items.map((item) => {
                            const menuItem = getMenuItemById(item.menuItemId);
                            return (
                              <li key={item.menuItemId} className="flex justify-between text-sm">
                                <span>
                                  {item.quantity} x {menuItem?.name || 'Unknown Item'}
                                  {item.specialInstructions && (
                                    <span className="text-xs text-red-500 block ml-4">
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
                    <CardFooter className="bg-gray-50 flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/owner/chat/${order.id}`)}
                      >
                        Chat with Customer
                      </Button>
                      <Button 
                        className="bg-food-orange hover:bg-orange-600"
                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                      >
                        Confirm Order
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}
          
          {/* Confirmed orders */}
          {ordersByStatus.confirmed.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Confirmed Orders</h2>
              <div className="grid gap-4">
                {ordersByStatus.confirmed.map(order => {
                  const customer = users.find(user => user.id === order.customerId);
                  const travelInfo = estimateTravelTime(order.customerId);
                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-blue-50 pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {getCustomerName(order.customerId)} - Pickup at {formatTime(order.estimatedPickupTime)}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Confirmed
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="p-4">
                          <ul className="space-y-1">
                            {order.items.map((item) => {
                              const menuItem = getMenuItemById(item.menuItemId);
                              return (
                                <li key={item.menuItemId} className="text-sm">
                                  {item.quantity} x {menuItem?.name || 'Unknown Item'}
                                  {item.specialInstructions && (
                                    <span className="text-xs text-red-500 block ml-4">
                                      Note: {item.specialInstructions}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t border-b">
                          <h4 className="font-medium mb-2">Customer Location</h4>
                          <div className="h-52">
                            <Map customerId={order.customerId} showRoute={true} />
                          </div>
                          {travelInfo.minutes > 0 && (
                            <div className="mt-2 text-sm">
                              <p>
                                <span className="font-medium">Customer ETA:</span> {travelInfo.minutes} minutes 
                                ({(travelInfo.distance / 1000).toFixed(1)} km away)
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-gray-50 flex justify-between">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/owner/chat/${order.id}`)}
                        >
                          Chat
                        </Button>
                        <Button 
                          className="bg-food-orange hover:bg-orange-600"
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        >
                          Start Preparing
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
          
          {/* Preparing orders */}
          {ordersByStatus.preparing.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Preparing</h2>
              <div className="grid gap-4">
                {ordersByStatus.preparing.map(order => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="bg-purple-50 pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {getCustomerName(order.customerId)} - Pickup at {formatTime(order.estimatedPickupTime)}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          Preparing
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="space-y-1">
                        {order.items.map((item) => {
                          const menuItem = getMenuItemById(item.menuItemId);
                          return (
                            <li key={item.menuItemId} className="text-sm">
                              {item.quantity} x {menuItem?.name || 'Unknown Item'}
                              {item.specialInstructions && (
                                <span className="text-xs text-red-500 block ml-4">
                                  Note: {item.specialInstructions}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </CardContent>
                    <CardFooter className="bg-gray-50 flex justify-between">
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/owner/chat/${order.id}`)}
                      >
                        Chat
                      </Button>
                      <Button 
                        className="bg-food-green hover:bg-green-600"
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                      >
                        Mark as Ready
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </section>
          )}
          
          {/* Ready orders */}
          {ordersByStatus.ready.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Ready for Pickup</h2>
              <div className="grid gap-4">
                {ordersByStatus.ready.map(order => {
                  const travelInfo = estimateTravelTime(order.customerId);
                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-green-50 pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {getCustomerName(order.customerId)} - Ready for pickup
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Ready
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="mb-3">
                          <h4 className="font-medium">Customer ETA:</h4>
                          <p className="text-food-green font-medium">{travelInfo.minutes} minutes away</p>
                        </div>
                        <Separator className="my-2" />
                        <ul className="space-y-1">
                          {order.items.map((item) => {
                            const menuItem = getMenuItemById(item.menuItemId);
                            return (
                              <li key={item.menuItemId} className="text-sm">
                                {item.quantity} x {menuItem?.name || 'Unknown Item'}
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>
                      <CardFooter className="bg-gray-50 flex justify-between">
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/owner/chat/${order.id}`)}
                        >
                          Chat
                        </Button>
                        <Button 
                          onClick={() => handleUpdateStatus(order.id, 'completed')}
                        >
                          Complete Order
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </section>
          )}
          
          {/* If no orders */}
          {pendingOrders.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Orders</h3>
              <p className="text-gray-500">When customers place orders, they will appear here.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
