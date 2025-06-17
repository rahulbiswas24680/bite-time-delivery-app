
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Layout/Navbar';
import ChatInterface from '../../components/Chat/ChatInterface';

const CustomerChat: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser, currentShopId, currentShopSlug } = useAuth();
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

  if (!orderId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Chat with Restaurant</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-center text-gray-600">Please select an order to chat about.</p>
            <button
              onClick={() => navigate(`/customer/${currentShopSlug}/orders`)}
              className="mt-4 mx-auto block bg-food-orange hover:bg-orange-600 text-white font-medium py-2 px-4 rounded"
            >
              View My Orders
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
        <h1 className="text-3xl font-bold mb-6">Chat with Restaurant</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ChatInterface orderId={orderId} />
        </div>
      </main>
    </div>
  );
};

export default CustomerChat;
