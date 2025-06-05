
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock shop data - this would come from your data source
const shops = [
  { id: 'shop1', name: 'Downtown Pizza', slug: 'downtown-pizza' },
  { id: 'shop2', name: 'Uptown Burgers', slug: 'uptown-burgers' },
  { id: 'shop3', name: 'City Cafe', slug: 'city-cafe' },
  { id: 'shop4', name: 'Garden Grill', slug: 'garden-grill' },
];

const ShopSelector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract current shop from URL
  const currentShopSlug = location.pathname.split('/')[2]; // assumes /customer/shop-slug/menu format
  const currentShop = shops.find(shop => shop.slug === currentShopSlug);
  
  const handleShopChange = (shopId: string) => {
    const selectedShop = shops.find(shop => shop.id === shopId);
    if (selectedShop) {
      // Navigate to the same page but with different shop
      const currentPage = location.pathname.split('/').slice(3).join('/') || 'menu';
      navigate(`/customer/${selectedShop.slug}/${currentPage}`);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Select value={currentShop?.id || shops[0].id} onValueChange={handleShopChange}>
        <SelectTrigger className="w-40 md:w-48 bg-white border-gray-300">
          <SelectValue placeholder="Select shop" />
        </SelectTrigger>
        <SelectContent>
          {shops.map((shop) => (
            <SelectItem key={shop.id} value={shop.id}>
              {shop.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ShopSelector;
