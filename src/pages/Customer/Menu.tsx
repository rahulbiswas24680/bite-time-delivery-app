
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import MenuCard from '../../components/Menu/MenuCard';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuCategories, getAllMenuItems } from '../../data/menuItems';
import { MenuItem } from '../../utils/types';

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

const Menu: React.FC = () => {
  const { currentUser, currentShopId, currentShopSlug } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu data
  useEffect(() => {
    const fetchMenuData = async () => {
      if (!currentShopId) return;

      try {
        setIsLoading(true);
        const [items, cats] = await Promise.all([
          getAllMenuItems(currentShopId),
          getMenuCategories(currentShopId)
        ]);
        setMenuItems(items);
        setCategories(cats);
        setError(null);
      } catch (err) {
        setError("Failed to load menu data");
        console.error("Error fetching menu:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [currentShopId]);

  // Filtered menu items based on selected category
  const filteredItems = useMemo(() => {
    return activeCategory
      ? menuItems.filter(item => item.category === activeCategory)
      : menuItems;
  }, [activeCategory, menuItems]);

  // Cart management (unchanged from your original)
  useEffect(() => {
    const storedCart = localStorage.getItem(`cart_${currentUser?.id || 'guest'}`);
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, [currentUser]);

  const addToCart = (item: MenuItem) => {
    const existingCartItem = cart.find(cartItem => cartItem.menuItem.id === item.id);

    if (existingCartItem) {
      setCart(cart.map(cartItem =>
        cartItem.menuItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { menuItem: item, quantity: 1 }]);
    }
    setShowCart(true);
  };

  useEffect(() => {
    localStorage.setItem(`cart_${currentUser?.id || 'guest'}`, JSON.stringify(cart));
  }, [cart, currentUser]);

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.menuItem.id !== itemId));
  };

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

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.menuItem.price * item.quantity);
    }, 0);
  };

  const proceedToCheckout = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate(`/customer/${currentShopSlug}/checkout`, { state: { cartItems: cart } });
  };

  // Redirect non-customers
  useEffect(() => {
    if (currentUser && currentUser.role !== 'customer') {
      navigate('/owner/dashboard');
    }
  }, [currentUser, navigate]);

  if (!currentShopId) {
    return <div className="p-4 text-center">No shop selected</div>;
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading menu...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }


  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        {currentShopId ?
          (
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
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "outline"}
                        onClick={() => setActiveCategory(category.id)}
                        className={activeCategory === category.id ? "bg-food-orange hover:bg-orange-600" : ""}
                      >
                        {category.name}
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
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
            </main>


          ) : (
            <div className="flex items-center justify-center h-screen text-gray-500 text-xl font-semibold bg-gray-50">
              <div className="text-center space-y-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>No Shop Selected</p>
                <p className="text-sm text-gray-400">Please select a shop to view the menu</p>
              </div>
            </div>
          )}

      </div>
    </>
  );
};

export default Menu;
