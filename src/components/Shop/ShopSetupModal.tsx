import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import { ShopDetails } from '@/utils/types';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter, // For buttons at the bottom
} from '@/components/ui/dialog'; // Adjust path if your components are elsewhere
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { set } from 'date-fns';


interface ShopSetupModalProps {
  ownerId: string;
  onShopCreated: (shopId: string) => void;
  // If you want a close button that allows skipping (not recommended for forced setup)
  onClose?: () => void;
}

const ShopSetupModal: React.FC<ShopSetupModalProps> = ({ ownerId, onShopCreated, onClose }) => {
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [closingHours, setClosingHours] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newShopData: Omit<ShopDetails, 'id' | 'ownerId'> = {
        name: shopName,
        description,
        address,
        phone,
        email,
        website,
        openingHours,
        closingHours,
        // Add other fields from ShopDetails as needed
      };

      const shopRef = await addDoc(collection(db, 'shops'), {
        ...newShopData,
        ownerId: ownerId, // Link to the owner
        createdAt: Timestamp.now(), // Add a creation timestamp
      });

      console.log('Shop created successfully with ID:', shopRef.id);
      onShopCreated(shopRef.id); // Call the callback to notify parent
    } catch (err: any) {
      console.error('Error creating shop:', err);
      setError(err.message || 'Failed to create shop. Please try again.');
    } finally {
      setLoading(false);
    }
  };





  return (
    <Dialog open={true} onOpenChange={() => onClose?.()}>
      <DialogContent className={`sm:max-w-[500px] rounded-2xl shadow-xl p-6 ${!onClose ? "[&>button]:hidden" : ""}`}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Setup Your Shop</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Please provide your shop details to get started. This step is required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="space-y-3">
            <div>
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="mt-1"
                placeholder="e.g., John's Coffee"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => {
                  const words = e.target.value.trim().split(/\s+/).length
                  if (words <= 500) {
                    setDescription(e.target.value)
                  }
                }}
                required
                rows={3}
                placeholder="Briefly describe your shop (max 500 words)"
                className="mt-1"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {description.trim().split(/\s+/).length}/500 words
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="123 Main Street"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || /^(\+91|0)?[6789]\d{0,9}$/.test(value)) {
                      setPhone(value)
                    }
                  }}
                  required
                  placeholder="+91XXXXXXXXXX"
                  pattern="^(\+91|0)?[6789]\d{9}$"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="shop@example.com"
                  className="mt-1"
                />
              </div>            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourshop.com (Optional)"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openingHours">Opening Time</Label>
                <Input
                  type="time"
                  id="openingHours"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="closingHours">Closing Time</Label>
                <Input
                  type="time"
                  id="closingHours"
                  value={closingHours}
                  onChange={(e) => setClosingHours(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              {loading ? 'Saving...' : 'Save Shop Details'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ShopSetupModal;