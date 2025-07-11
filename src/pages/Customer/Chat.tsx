
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Layout/Navbar';
import ChatInterface from '../../components/Chat/ChatInterface';
import { Order } from '@/utils/types';
import { getOrdersByCustomerId } from '@/backend/order';

const CustomerChat: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser, currentShopId, currentShopSlug } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  console.log('OrderCard', orderId);
  // Redirect if not logged in or not a customer
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'customer') {
      navigate('/owner/dashboard');
    }
  }, [currentUser, navigate]);

  React.useEffect(() => {
    if (currentUser && currentShopId) {
      // Fetch orders for the current shop
      const fetchOrders = async () => {
        try {
          const data = await getOrdersByCustomerId(currentUser.id, currentShopId);
          console.log('shop id---', data);
          setOrders(data);
        } catch (error) {
          console.error('Error fetching orders:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [currentUser, currentShopId]);


if (!orderId) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Order Chats</h1>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-food-orange"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center text-gray-600">You don't have any active order chats.</p>
            <button
              onClick={() => navigate(`/customer/${currentShopSlug}/orders`)}
              className="mt-4 mx-auto block bg-food-orange hover:bg-orange-600 text-white font-medium py-2 px-4 rounded"
            >
              View My Orders
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/customer/${currentShopSlug}/chat/${order.id}`)}
                >
                  <div className="flex justify-between items-center p-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-orange-500">{currentShopSlug}</span>
                        <span className="text-gray-400">•</span>
                        <span>Order <span className="text-gray-500 text-sm font-medium">#{order.id}</span></span>
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{order.date}</p>
                      {order.lastMessage && (
                        <p className="text-sm text-gray-600 mt-2 truncate max-w-md">
                          <span className="font-medium">Last message:</span> {order.lastMessage}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {order.unreadCount && order.unreadCount > 0 ? (
                        <span className="bg-food-orange text-white text-xs font-bold px-3 py-1 rounded-full min-w-[1.5rem] text-center">
                          {order.unreadCount}
                        </span>
                      ) : null}
                      <svg className="w-5 h-5 text-gray-400 transition-colors duration-200 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

return (
  <div className="min-h-screen flex flex-col">
    <Navbar disableShops={true} />
    <main className="flex-1 container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Chat with Restaurant</h1>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ChatInterface orderId={orderId} />
      </div>
    </main>
  </div>
);
};

export default CustomerChat;
