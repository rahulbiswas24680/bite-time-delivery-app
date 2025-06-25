import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, User } from 'lucide-react';
import ShopSelector from './ShopSelector';
import { useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-food-orange">BiteTime</span>
            </Link>
            
            {/* Shop selector for customers */}
            {currentUser?.role === 'customer' && (
              <div className="hidden sm:block">
                <ShopSelector />
              </div>
            )}
            {/* Dashboard shortcut for owners */}
            {currentUser?.role === 'owner' && (
              <Link
                to="/owner/dashboard"
                className="pl-3 text-sm font-bold text-food-orange hover:underline"
                data-testid="navbar-owner-dashboard-link"
              >
                Dashboard
              </Link>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange">
              Home
            </Link>
            
            {currentUser?.role === 'customer' && (
              <>
                <Link 
                  to="/customer/downtown-pizza/menu" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Menu
                </Link>
                <Link 
                  to="/customer/orders" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  My Orders
                </Link>
                <Link 
                  to="/customer/chat" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Chat
                </Link>
              </>
            )}
            
            {currentUser?.role === 'owner' && (
              <>
                <Link 
                  to="/owner/dashboard" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/owner/orders" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Orders
                </Link>
                <Link 
                  to="/owner/payments" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Payments
                </Link>
                <Link 
                  to="/owner/chat" 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Chat
                </Link>
                <Link
                  to="/owner/billing"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Billing
                </Link>
              </>
            )}
          </nav>
          
          {/* Right side with account dropdown and mobile menu */}
          <div className="flex items-center space-x-2">
            {/* Shop selector for mobile customers */}
            {currentUser?.role === 'customer' && (
              <div className="sm:hidden">
                <ShopSelector />
              </div>
            )}
            
            {/* Account Dropdown for ALL devices */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-food-orange text-white">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <span className="font-medium">{currentUser.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span className="text-sm">{currentUser.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Owner-specific billing in dropdown */}
                  {currentUser.role === "owner" && (
                    <DropdownMenuItem asChild>
                      <Link to="/owner/billing" className="text-food-orange font-semibold">
                        Billing
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {/* Customer billing in dropdown */}
                  {currentUser.role === "customer" && (
                    <DropdownMenuItem asChild>
                      <Link to="/billing" className="text-food-orange font-semibold">
                        Billing
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-500 cursor-pointer"
                  >
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                asChild
                className="bg-food-orange hover:bg-orange-600"
              >
                <Link to="/login">Sign In</Link>
              </Button>
            )}
            
            {/* Mobile menu dropdown */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/">Home</Link>
                  </DropdownMenuItem>
                  
                  {currentUser ? (
                    <>
                      {currentUser.role === 'customer' ? (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to="/customer/downtown-pizza/menu">Menu</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/customer/orders">My Orders</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/customer/chat">Chat</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/billing" className="text-food-orange font-semibold">
                              Billing
                            </Link>
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem asChild>
                            <Link to="/owner/dashboard">Dashboard</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/owner/orders">Orders</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/owner/payments">Payments</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/owner/chat">Chat</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to="/owner/billing" className="text-food-orange font-semibold">
                              Billing
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="text-red-500 cursor-pointer"
                      >
                        Log Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/login">Login</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/register">Register</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
