
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Layout/Navbar';
import ChatInterface from '../../components/Chat/ChatInterface';
import { getPendingOrders, getOrderById } from '../../data/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OwnerChat: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not logged in or not an owner
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'owner') {
      navigate('/customer/menu');
    }
  }, [currentUser, navigate]);
  
  // Get all active orders
  const activeOrders = getPendingOrders();
  
  if (!orderId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Customer Conversations</h1>
          
          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-600">No active orders to chat about.</p>
              <button
                onClick={() => navigate('/owner/dashboard')}
                className="mt-4 bg-food-orange hover:bg-orange-600 text-white font-medium py-2 px-4 rounded"
              >
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeOrders.map(order => (
                <Card 
                  key={order.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/owner/chat/${order.id}`)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="font-medium capitalize">{order.status}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Items: <span className="font-medium">{order.items.length}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total: <span className="font-medium">${order.totalAmount.toFixed(2)}</span>
                    </p>
                    <button className="mt-3 text-food-orange hover:underline text-sm">
                      Chat with Customer →
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }
  
  // Get the specific order
  const order = getOrderById(orderId);
  
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Customer Conversation</h1>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-500">Order not found.</p>
            <button
              onClick={() => navigate('/owner/chat')}
              className="mt-4 bg-food-orange hover:bg-orange-600 text-white font-medium py-2 px-4 rounded"
            >
              Back to Conversations
            </button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/owner/chat')}
            className="text-food-orange hover:underline mr-4"
          >
            ← All Conversations
          </button>
          <h1 className="text-3xl font-bold">Chat for Order #{orderId}</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ChatInterface orderId={orderId} />
        </div>
      </main>
    </div>
  );
};

export default OwnerChat;
