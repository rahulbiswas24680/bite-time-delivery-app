
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MenuItem } from '../../utils/types';
import { menuItems, getMenuCategories } from '../../data/menuItems';
import { addNewOrder, calculateOrderTotal } from '../../data/orders';
import Navbar from '../../components/Layout/Navbar';
import MenuCard from '../../components/Menu/MenuCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

const Menu: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  
  // Get all menu categories
  const categories = getMenuCategories();
  
  // Filtered menu items based on selected category
  const filteredItems = activeCategory 
    ? menuItems.filter(item => item.category === activeCategory)
    : menuItems;

  // Load cart on mount
  useEffect(() => {
    const storedCart = localStorage.getItem(`cart_${currentUser?.id || 'guest'}`);
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [currentUser]);
  
  // Add item to cart
  const addToCart = (item: MenuItem) => {
    const existingCartItem = cart.find(cartItem => cartItem.menuItem.id === item.id);
    
    if (existingCartItem) {
      // Increment quantity if already in cart
      setCart(cart.map(cartItem => 
        cartItem.menuItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      // Add new item to cart
      setCart([...cart, { menuItem: item, quantity: 1 }]);
    }
    
    // Show cart after adding item
    setShowCart(true);
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`cart_${currentUser?.id || 'guest'}`, JSON.stringify(cart));
  }, [cart, currentUser]);
  
  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.menuItem.id !== itemId));
  };  
  // Update item quantity in cart
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item => 
      item.menuItem.id === itemId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };
  
  // Calculate total price of items in cart
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);
  };
  
  // Handle proceed to checkout
  const proceedToCheckout = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Navigate to checkout with cart items as state
    navigate('/customer/checkout', { state: { cartItems: cart } });
  };


  // Submit order
  const placeOrder = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const orderItems = cart.map(item => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions,
    }));
    
    const total = calculateTotal();
    
    // Create a new order
    const order = addNewOrder({
      customerId: currentUser.id,
      items: orderItems,
      status: 'pending',
      totalAmount: total,
    });
    
    // Clear cart after order is placed
    setCart([]);
    setShowCart(false);
    
    // Navigate to order confirmation page
    navigate(`/customer/orders/${order.id}`);
  };
  
  // If user is not logged in or not a customer, redirect to login
  React.useEffect(() => {
    if (currentUser && currentUser.role !== 'customer') {
      navigate('/owner/dashboard');
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content area */}
          <div className="md:flex-1">
            <h1 className="text-3xl font-bold mb-6">Our Menu</h1>
            
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={activeCategory === null ? "default" : "outline"}
                onClick={() => setActiveCategory(null)}
                className={activeCategory === null ? "bg-food-orange hover:bg-orange-600" : ""}
              >
                All
              </Button>
              
              {categories.map(category => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className={activeCategory === category ? "bg-food-orange hover:bg-orange-600" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            {/* Menu items grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onAddToOrder={addToCart}
                />
              ))}
            </div>
          </div>
          
          {/* Cart sidebar */}
          <div className={`md:w-96 ${showCart ? 'block' : 'hidden md:block'}`}>
            <Card>
              <div className="p-4 bg-food-orange text-white font-bold flex justify-between items-center">
                <h2 className="text-xl">Your Order</h2>
                <Badge variant="outline" className="bg-white text-food-orange border-white">
                  {cart.reduce((total, item) => total + item.quantity, 0)} Items
                </Badge>
              </div>
              
              <CardContent className="p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                    >
                      Browse Menu
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart items */}
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.menuItem.id} className="flex justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.menuItem.name}</h4>
                            <div className="flex items-center mt-1">
                              <button 
                                onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                                className="bg-gray-200 text-gray-700 h-6 w-6 rounded-full font-bold flex items-center justify-center"
                              >
                                -
                              </button>
                              <span className="mx-2">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                                className="bg-gray-200 text-gray-700 h-6 w-6 rounded-full font-bold flex items-center justify-center"
                              >
                                +
                              </button>
                              <button 
                                onClick={() => removeFromCart(item.menuItem.id)}
                                className="ml-4 text-red-500 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Separator />
                    
                    {/* Order summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg text-food-orange">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {/* Checkout button */}
                    <Button 
                      className="w-full bg-food-orange hover:bg-orange-600 mt-4"
                      onClick={proceedToCheckout}
                      disabled={cart.length === 0}
                    >
                      Checkout
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Mobile cart toggle button */}
      <div className="md:hidden fixed bottom-4 right-4">
        <Button 
          onClick={() => setShowCart(!showCart)}
          className="rounded-full h-14 w-14 bg-food-orange hover:bg-orange-600 flex items-center justify-center shadow-lg"
        >
          <span className="sr-only">Toggle Cart</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs h-5 w-5 flex items-center justify-center">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default Menu;
