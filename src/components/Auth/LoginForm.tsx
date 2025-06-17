
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../backend/firebase';
import ShopSetupModal from '../Shop/ShopSetupModal';


interface LoginFormProps {
  onLoggingIn: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoggingIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showShopSetupModal, setShowShopSetupModal] = useState(false);
  const [currentOwnerId, setCurrentOwnerId] = useState<string | null>(null);

  const {
    login,
    error,
    currentUser,
    currentShopId,
    currentShopSlug,
    fetchAndSetShopData
  } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onLoggingIn?.();

    try {
      const user = await login(email, password);

      if (!user) {
        // Login failed (error is already set in the auth context)
        return;
      }

      if (user.role === 'owner') {
        const { id: shopId, slug } = await fetchAndSetShopData(user.id);

        if (!shopId) {
          // Owner has no shops - show setup modal
          setShowShopSetupModal(true);
          return;
        }
        // Owner has shop - redirect to dashboard
        navigate(`/owner/dashboard/${slug || shopId}`);
        return;
      }

      // For customers: redirect to menu
      if (user.role === 'customer') {
        // If you have customer-specific shop logic, add it here
        navigate(`/customer/${currentShopSlug}/menu`);
        return;
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShopCreated = (shopId: string) => {
    setShowShopSetupModal(false); // Close the modal
    console.log(`Shop created: ${shopId}. Redirecting to owner dashboard.`);
    navigate(`/owner/dashboard/${shopId}`); // Navigate to the owner's dashboard
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-food-orange hover:bg-orange-600"
              disabled={loading}
              onSubmit={handleSubmit}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-8">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <a
              href="/register"
              className="text-food-orange hover:underline"
            >
              Register
            </a>
          </div>
        </CardFooter>
      </Card>

      {/* <ShopSetupModal ownerId={'123'} onShopCreated={handleShopCreated} /> */}

      {/* Conditionally render the modal */}
      {showShopSetupModal && currentOwnerId && (
        console.log('Rendering modal for owner:', currentOwnerId),
        <ShopSetupModal
          ownerId={currentOwnerId}
          onShopCreated={handleShopCreated}
        // You might add an onClose prop if you want a cancellable modal,
        // but for forced setup, you might not.
        />
      )}
    </>
  );
};

export default LoginForm;
