
import { deleteOrderById, fetchOrdersByStatus } from '@/backend/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { DocumentSnapshot } from 'firebase/firestore';
import { CheckCircle, CreditCard, Loader2, Menu, MessageCircle, MoreVertical, RefreshCw, RotateCcw, Trash2, XCircle } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '../../components/Layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { estimateTravelTime } from '../../data/locations';
import { getMenuItemById } from '../../data/menuItems';
import { getPendingOrders, updateOrderStatus } from '../../data/orders';
import { getCustomerUsers } from '../../data/users';
import { MenuItem, Order, User } from '../../utils/types';

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready';


// generate random otp for customers orders
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const Dashboard: React.FC = () => {
  const { currentUser, currentShopId, currentShopSlug } = useAuth();


  const [loading, setLoading] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus>('pending');
  const [users, setUsers] = React.useState<User[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [totalCounts, setTotalCounts] = React.useState<Record<OrderStatus, number>>({
    pending: 0,
    confirmed: 0,
    preparing: 0,
    ready: 0,
  });
  const [menuItemMap, setMenuItemMap] = React.useState<Record<string, MenuItem>>({});

  const [lastDoc, setLastDoc] = React.useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = React.useState(false);

  const navigate = useNavigate();

  // If user is not logged in or not an owner, redirect to login
  React.useEffect(() => {
    if (!currentUser && !currentShopId) {
      navigate('/login');
    } else if (currentUser && currentUser.role !== 'owner') {
      navigate('/customer/menu');
    } else if (!currentShopId) {
      navigate('*');
    }
  }, [currentUser, navigate]);


  React.useEffect(() => {
    if (!currentShopId) return;

    const load = async () => {
      setLoading(true);
      const res = await fetchOrdersByStatus(selectedStatus, currentShopId);
      console.log('orders', res);
      setOrders(res.data);
      setLastDoc(res.lastDoc);
      setHasMore(res.data.length === 5);


      // ✅ update total count
      setTotalCounts((prev) => ({
        ...prev,
        [selectedStatus]: res.total,
      }));
      setLoading(false);
    };

    load();
  }, [selectedStatus, currentShopId]);

  React.useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getCustomerUsers();
      setUsers(data);
    };

    fetchCustomers();
  }, []);

  React.useEffect(() => {
    const fetchMenuItems = async () => {
      const map: Record<string, MenuItem> = {};
      for (const order of orders) {
        for (const item of order.items) {
          if (!map[item.menuItemId]) {
            const menuItem = await getMenuItemById(item.menuItemId);
            if (menuItem) {
              map[item.menuItemId] = menuItem;
            }
          }
        }
      }

      setMenuItemMap(map);
    };

    if (orders.length > 0) {
      fetchMenuItems();
    }
  }, [orders]);




  // Get all pending orders
  const pendingOrders = getPendingOrders(orders);

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
  const handleUpdateStatus = (orderId: string, newStatus: Order['status'], currentShopId: string) => {
    updateOrderStatus(orders, orderId, newStatus, currentShopId);
    // Force a re-render
    setPendingOrders([...getPendingOrders(orders)]);
    toast.success('Order status updated!', {
      description: `Order #${orderId} has been updated to ${newStatus}.`,
    });
  };

  // Handle delete order
  const handleDeleteOrder = (orderId: string) => {
    // Remove the order from the orders array
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    deleteOrderById(orderId);
    toast.success('Order deleted successfully!', {
      description: `Order #${orderId} has been removed.`,
    });
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

  // load more orders
  const handleLoadMore = async () => {
    if (!lastDoc || !hasMore || loading) return;
    setLoading(true);
    try {
      const res = await fetchOrdersByStatus(selectedStatus, currentShopId, lastDoc);
      setOrders(prev => [...prev, ...res.data]);
      setLastDoc(res.lastDoc);
      if (res.data.length < 5) setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-row justify-between items-center mb-6 gap-4 flex-wrap">
          <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>

          <div className="flex gap-2 flex-wrap">
            <Button
              className="bg-orange-500 hover:bg-orange-700 text-white"
              onClick={() => console.log('Withdraw Cash button clicked')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Cash

              <span className="absolute -top-1 -right-2 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </span>
            </Button>
            <Button
              className="bg-slate-400 hover:bg-slate-600 text-white"
              onClick={() => navigate(`/owner/${currentShopSlug}/menus`)}
            >
              <Menu className="w-4 h-4 mr-2" />
              Menu
            </Button>
            <Button
              onClick={() => setPendingOrders([...getPendingOrders(orders)])}
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        {/* Interactive buttons for status change */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Order Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['pending', 'confirmed', 'preparing', 'ready'] as OrderStatus[]).map((status) => (
              <Card
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "cursor-pointer border-2 transition-colors",
                  selectedStatus === status
                    ? "border-food-orange bg-orange-50"
                    : "border-transparent hover:border-gray-300"
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg capitalize">{status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className={cn(
                      "text-3xl font-bold",
                      status === 'pending' && "text-yellow-500",
                      status === 'confirmed' && "text-blue-500",
                      status === 'preparing' && "text-purple-500",
                      status === 'ready' && "text-food-green"
                    )}
                  >
                    {totalCounts[status] || 0}
                  </p>
                </CardContent>
              </Card>
            ))}

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
                            {getCustomerName(order.customerId)} - {new Date(order.createdAt.seconds * 1000).toLocaleString("en-US")}
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
                            const menuItem = menuItemMap[item.menuItemId];
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
                    <CardFooter className="bg-gray-50 flex justify-between items-center px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/owner/${currentShopSlug}/chat/${order.id}`)}
                      >
                        Chat with Customer
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-gray-100 text-gray-600 focus-visible:ring-2 focus-visible:ring-gray-300 rounded-lg cursor-pointer"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-40 rounded-lg p-1 shadow-md bg-white border">
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(order.id, "confirmed", currentShopId)}
                            className="flex items-center gap-2 text-green-700 hover:bg-green-50 transition rounded-md px-2 py-1.5 text-sm cursor-pointer font-medium"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Confirm Order
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(order.id, "cancelled", currentShopId)}
                            className="flex items-center gap-2 text-yellow-700 hover:bg-yellow-50 transition rounded-md px-2 py-1.5 text-sm cursor-pointer font-medium"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel Order
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleDeleteOrder(order.id)}
                            className="flex items-center gap-2 text-red-600 hover:bg-red-50 transition rounded-md px-2 py-1.5 text-sm cursor-pointer font-medium"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {loading && (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-food-orange" />
                </div>
              )}

              {!loading && hasMore && (
                <div className="text-center mt-4">
                  <Button onClick={handleLoadMore} variant="outline" className="text-sm">
                    Load More
                  </Button>
                </div>
              )}
            </section>
          )}




          {/* Confirmed orders */}
          {ordersByStatus.confirmed.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Confirmed Orders</h2>
              <div className="grid gap-4">
                {ordersByStatus.confirmed.map(order => {
                  // const customer = users.find(user => user.id === order.customerId);
                  // const travelInfo = estimateTravelTime(order.customerId);
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
                              const menuItem = menuItemMap[item.menuItemId];
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

                        {/* <div className="p-4 bg-gray-50 border-t border-b">
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
                        </div> */}
                      </CardContent>
                      <CardFooter className="bg-gray-50 flex justify-between items-center">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/owner/${currentShopSlug}/chat/${order.id}`)}
                        >
                          Chat
                        </Button>

                        <Button
                          className="bg-food-orange hover:bg-orange-600"
                          onClick={() => handleUpdateStatus(order.id, 'preparing', currentShopId)}
                        >
                          Start Preparing
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-gray-100 text-gray-600 focus-visible:ring-2 focus-visible:ring-gray-300 rounded-lg cursor-pointer"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">More Actions</span>
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-40 rounded-lg p-1 shadow-md bg-white border">
                            <DropdownMenuLabel className="text-xs text-gray-600 px-2 py-1">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(order.id, "cancelled", currentShopId)}
                              className="flex items-center gap-2 text-yellow-700 hover:bg-yellow-50 transition rounded-md px-2 py-1.5 text-sm cursor-pointer"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDeleteOrder(order.id)}
                              className="flex items-center gap-2 text-red-600 hover:bg-red-50 transition rounded-md px-2 py-1.5 text-sm cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                          const menuItem = menuItemMap[item.menuItemId];
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
                        onClick={() => navigate(`/owner/${currentShopSlug}/chat/${order.id}`)}
                      >
                        Chat
                      </Button>
                      <Button
                        className="bg-food-green hover:bg-green-600"
                        onClick={() => handleUpdateStatus(order.id, 'ready', currentShopId)}
                      >
                        Mark as Ready
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-4">
                  <Button onClick={handleLoadMore} variant="outline" className="text-sm">
                    Load More
                  </Button>
                </div>
              )}
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
                            const menuItem = menuItemMap[item.menuItemId];
                            return (
                              <li key={item.menuItemId} className="text-sm">
                                {item.quantity} x {menuItem?.name || 'Unknown Item'}
                              </li>
                            );
                          })}
                        </ul>
                      </CardContent>
                          <FinalOrderSubmitFooter 
                          order={order}
                          currentShopId={currentShopId}
                          currentShopSlug={currentShopSlug}
                          handleUpdateStatus={handleUpdateStatus}
                          />
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



const FinalOrderSubmitFooter = ({ order, handleUpdateStatus, currentShopId, currentShopSlug }) => {
  // for order verification purpose
  const [otp, setOtp] = React.useState(generateOTP());
  const [timeLeft, setTimeLeft] = React.useState(60); // in seconds
  const [copied, setCopied] = React.useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    setCopied(false);
    setTimeLeft(60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otp]);

  // Handle copy otp
  const handleCopy = () => {
    navigator.clipboard.writeText(otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };
  // regenrerate otp
  const handleRegenerate = () => {
    setOtp(generateOTP());
  };

  return (
    <CardFooter className="bg-gray-50 flex flex-col sm:flex-row justify-between gap-4 pt-4">

      {/* OTP Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-mono tracking-widest text-blue-700">{otp}</div>
          <button
            onClick={handleCopy}
            className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">
            Expires in:{" "}
            <span className="font-semibold text-red-500">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </span>
          </div>
          <button
            onClick={handleRegenerate}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => navigate(`/owner/${currentShopSlug}/chat/${order.id}`)}
        className="w-full sm:w-auto"
      >
        <MessageCircle className="w-4 h-4 mr-1" />Chat
      </Button>

      <Button
        onClick={() => handleUpdateStatus(order.id, 'completed', currentShopId)}
        className="w-full sm:w-auto"
      >
        Complete Order
      </Button>
    </CardFooter>
  )
}

export default Dashboard;
