
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '../components/Layout/Navbar';

const Home: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Skip the Line with <span className="text-food-orange">BiteTime</span>
                </h1>
                <p className="text-xl text-gray-300">
                  Order ahead, track your arrival time, and have your food ready when you get there.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-food-orange hover:bg-orange-600 text-white"
                    size="lg"
                    onClick={() => navigate('/customer/menu')}
                  >
                    Order Now
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-white text-gray-600"
                    size="lg"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </Button>
                </div>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1565299507177-b0ac66763828?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Delicious Food"
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg">
                <div className="bg-food-orange text-white h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">1</div>
                <h3 className="text-xl font-bold mb-2">Order Ahead</h3>
                <p className="text-gray-600">Browse our menu and place your order from anywhere, anytime.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg">
                <div className="bg-food-orange text-white h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">2</div>
                <h3 className="text-xl font-bold mb-2">Track Location</h3>
                <p className="text-gray-600">We'll track your arrival time so your food is ready just when you get here.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg">
                <div className="bg-food-orange text-white h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold mb-4">3</div>
                <h3 className="text-xl font-bold mb-2">Chat & Customize</h3>
                <p className="text-gray-600">Directly chat with us for special requests or order modifications.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Map Preview Section */}
        <section className="bg-gray-100 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Real-Time Location Tracking</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Our smart system tracks your journey to the restaurant, ensuring your food is prepared at the perfect time.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="bg-food-green text-white p-1 rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>Accurate ETA predictions</span>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-food-green text-white p-1 rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>Clear route visualization</span>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-food-green text-white p-1 rounded-full mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>Get your food fresh and hot</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1580086319619-3ed498161c77?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Map Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BiteTime</h3>
              <p className="text-gray-400">
                Skip the wait and enjoy your food fresh and hot, exactly when you arrive.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Menu</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <address className="text-gray-400 not-italic">
                123 Restaurant Street<br />
                New York, NY 10001<br />
                <a href="tel:+15551234567" className="hover:text-white">+1 (555) 123-4567</a><br />
                <a href="mailto:info@bitetime.com" className="hover:text-white">info@bitetime.com</a>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} BiteTime. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
