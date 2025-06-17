import { db } from '@/backend/firebase';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { ShopDetails } from '@/utils/types';
import { slugify } from '@/utils/utils';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


type ShopWithSlug = ShopDetails & { slug: string };

const ShopSelector: React.FC = () => {
  const {
    currentUser,
    currentShopId,
    currentShopSlug,
    setCurrentShopId,
    setCurrentShopSlug
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [shops, setShops] = React.useState<ShopWithSlug[]>([]);

  // Fetch shop details for all linked shops
  React.useEffect(() => {
    const fetchShops = async () => {

      const userRef = doc(db, 'users', currentUser.id);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        return { id: null, slug: null };
      }

      const userData = userSnap.data();
      const linkedShops = userData.linkedShops || [];

      try {
        const shopsPromises = linkedShops.map(async (shopId) => {
          const shopDoc = await getDoc(doc(db, 'shops', shopId));
          if (shopDoc.exists()) {
            const data = shopDoc.data();
            return {
              id: shopDoc.id,
              name: data.name || 'Unnamed Shop',
              slug: slugify(data.name) || shopDoc.id,
              ...data
            } as ShopWithSlug;
          }
          return null;
        });

        const shopsData = (await Promise.all(shopsPromises)).filter(Boolean) as ShopWithSlug[];
        setShops(shopsData);

        // If currentShopSlug isn't set, use the first shop
        if (!currentShopSlug && shopsData.length > 0) {
          setCurrentShopId(shopsData[0].id);
          setCurrentShopSlug(shopsData[0].slug);
        }
      } catch (error) {
        console.error('Error fetching shops:', error);
      }
    };

    fetchShops();
  }, [currentUser?.linkedShops, currentShopSlug, setCurrentShopId, setCurrentShopSlug]);



  // Extract current shop from URL
  const urlShopSlug = location.pathname.split('/')[2]; // assumes /customer/shop-slug/menu format
  const currentShop = React.useMemo(
    () => shops.find((s) => s.slug === urlShopSlug) ?? null,
    [shops, urlShopSlug]
  );

  React.useEffect(() => {
    if (currentShop) {
      setCurrentShopId(currentShop.id);
      setCurrentShopSlug(currentShop.slug);
    }
  }, [currentShop, setCurrentShopId, setCurrentShopSlug]);

  const handleShopChange = (shopId: string) => {
    const selectedShop = shops.find(shop => shop.id === shopId);
    if (selectedShop) {
      // Navigate to the same page but with different shop
      const currentPage = location.pathname.split('/').slice(3).join('/') || 'menu';
      navigate(`/customer/${selectedShop.slug}/${currentPage}`);
    }
  };

  if (shops.length === 0) {
    // could be a spinner, skeleton, etc.
    return <span className="text-sm text-gray-500">Loading Shops</span>;
  }

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={currentShop?.id || ''}
        onValueChange={handleShopChange}
      >
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