
import React from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
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


const Navbar: React.FC<{ hideShops?: boolean, disableShops?: boolean }> = ({ hideShops, disableShops }) => {  
  const { currentUser, logout, currentShopId, currentShopSlug } = useAuth();
  console.log('currentShopId:', currentShopId);
  const navigate = useNavigate();

  const isBillPending = true;

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
              <span className="bg-food-orange text-white px-3 py-2 rounded-md text-lg font-bold tracking-wide">
                Stackorq
              </span>
            </Link>

            {/* Show shop selector for customers */}
            {currentUser?.role === 'customer' && !hideShops && (
              <div className="hidden sm:block">
                <ShopSelector disableShops={disableShops} />
              </div>
            )}
          </div>

          {/* Desktop Navigation */}

          <nav className="hidden md:flex space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange">
              Home
            </Link>

            {!currentUser && (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Register
                </Link>
              </>
            )}

            {currentUser?.role === 'customer' && (
              <>
                <Link
                  to={`/customer/${currentShopSlug}/menu`}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Menu
                </Link>
                <Link
                  to={`/customer/${currentShopSlug}/orders`}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  My Orders
                </Link>
                <Link
                  to={`/customer/${currentShopSlug}/chat`}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Chat
                </Link>
              </>
            )}

            {currentUser?.role === 'owner' && (
              <>
                <Link
                  to={`/owner/${currentShopSlug}/dashboard`}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Dashboard
                </Link>
                <Link
                  to={`/owner/${currentShopSlug}/orders`}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Orders
                </Link>
                <Link
                  to={`/owner/${currentShopSlug}/chat`}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  Chat
                </Link>
                <Link
                  to={`/owner/${currentShopId}/billing`}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-food-orange"
                >
                  <span className="relative inline-block">
                    Billing

                    {isBillPending && (
                      <span className="absolute -top-1 -right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </span>
                </Link>
              </>
            )}
          </nav>

          {/* Right side with account dropdown and mobile menu */}
          <div className="flex items-center space-x-2">
            {/* Shop selector for mobile customers */}
            {currentUser?.role === 'customer' && !hideShops && (
              <div className="sm:hidden">
                <ShopSelector />
              </div>
            )}

            {/* Account Dropdown or Sign In */}
            {currentUser ? (
              <div className="flex items-center">
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

                    {currentUser?.role === 'owner' && (
                      <DropdownMenuItem>
                        <span className="font-medium">
                          <Link to='/owner/my-shops' >My Shops</Link>
                        </span>
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
              </div>
            ) : (
              <div className="hidden md:block">
                <Button
                  asChild
                  className="bg-food-orange hover:bg-orange-600"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
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

                  {!currentUser ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/login">Login</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/register">Register</Link>
                      </DropdownMenuItem>
                    </>
                  ) : currentUser.role === 'customer' ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={`/customer/${currentShopSlug}/menu`}>Menu</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/customer/${currentShopSlug}/orders`}>My Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/customer/${currentShopSlug}/chat`}>Chat</Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={`/owner/${currentShopSlug}/dashboard`}>Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/owner/${currentShopSlug}/orders`}>Orders</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/owner/${currentShopSlug}/chat`}>Chat</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/owner/${currentShopSlug}/billing`}>Billing</Link>
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
