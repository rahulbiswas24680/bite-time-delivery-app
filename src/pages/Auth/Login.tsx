import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/Auth/LoginForm';
import Navbar from '../../components/Layout/Navbar';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const { currentUser, loading, currentShopId, currentShopSlug, fetchAndSetShopData } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);


  // If user is already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    console.log('Login component useEffect:', { currentUser, loading, currentShopId, currentShopSlug });

    const handleRedirect = async () => {
      // 1. If still loading authentication state, do nothing yet.
      if (loading) {
        return;
      }

      // 2. If loading is false AND currentUser exists, then redirect.
      if (currentUser && !isLoggingIn) {
        // If user is owner but we don't have shop data yet, fetch it
        if (currentUser.role === 'owner' && !currentShopSlug) {
          setIsLoggingIn(true);
          try {
            const { slug } = await fetchAndSetShopData(currentUser.id);
            if (slug) {
              navigate(`/owner/dashboard/${slug}`);
            } else {
              // Handle case where owner has no shops
              navigate('/owner/no-shops');
            }
          } catch (error) {
            console.error('Error fetching shop data:', error);
          } finally {
            setIsLoggingIn(false);
          }
        } 
        // If we already have the slug, redirect immediately
        else if (currentShopSlug) {
          navigate(currentUser.role === 'owner'
            ? `/owner/dashboard/${currentShopSlug}`
            : `/customer/${currentShopSlug}/menu`);
        }
      }
    };

    handleRedirect();
  }, [currentUser, loading, currentShopId, currentShopSlug, navigate, fetchAndSetShopData]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12">
        <div className="w-full max-w-md px-4">
          <LoginForm onLoggingIn={() => setIsLoggingIn(true)} />
        </div>
      </main>
    </div>
  );
};
export default Login;