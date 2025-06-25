
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOrdersByCustomerId } from '../../backend/order';
import Navbar from '../../components/Layout/Navbar';
import OrderCard from '../../components/Order/OrderCard';
import Map from '../../components/Map';

const Orders: React.FC = () => {
  const { currentUser, currentShopId } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // If user is not logged in or not a customer, redirect to login
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (currentUser.role !== 'customer') {
      navigate('/owner/dashboard');
    }
  }, [currentUser, navigate]);
  
  // Load orders from Firebase
  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser) {
        try {
          const data = await getOrdersByCustomerId(currentUser.id, currentShopId);
          console.log('shop id', currentShopId, data);
          setOrders(data);
        } catch (error) {
          console.error('Failed to fetch orders:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [currentUser, currentShopId]);
    
  // Separate active and past orders
  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );

  const pastOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">You haven't placed any orders yet</h2>
            <p className="text-gray-500 mb-6">Hungry? Browse our menu and place your first order!</p>
            <button 
              onClick={() => navigate('/customer/menu')}
              className="bg-food-orange hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-md"
            >
              See Menu
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active orders section */}
            {activeOrders.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Active Orders</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeOrders.map(order => (
                    <div key={order.id} className="space-y-4">
                      <OrderCard order={order} />
                      
                      {/* Map for tracking */}
                      {/* {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready') && (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                          <div className="p-4 bg-gray-50 border-b">
                            <h3 className="font-semibold">Track Your Order</h3>
                          </div>
                          <div className="p-4">
                            <Map customerId={currentUser?.id} />
                          </div>
                        </div>
                      )} */}
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Past orders section */}
            {pastOrders.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Order History</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pastOrders.map(order => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
