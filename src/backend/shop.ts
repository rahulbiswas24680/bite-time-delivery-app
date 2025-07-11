import { collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { ShopDetails } from '@/utils/types';
import { db } from './firebase';
import { slugify } from '@/utils/utils';

async function createShopForOwner(ownerUserId: string, shopData: Omit<ShopDetails, 'id' | 'ownerId'>) {
  try {
    const newShopRef = await addDoc(collection(db, 'shops'), {
      ...shopData,
      ownerId: ownerUserId,
      // Firebase will auto-generate a document ID. You can then use it as the 'id' for your frontend.
      // Or you can set a custom ID using setDoc if you prefer.
    });
    console.log("Shop created with ID: ", newShopRef.id);
    return { id: newShopRef.id, ...shopData, ownerId: ownerUserId };
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
}


async function getShopsByOwner(ownerUserId: string): Promise<ShopDetails[]> {
  const shopsRef = collection(db, 'shops');
  const q = query(shopsRef, where('ownerId', '==', ownerUserId));
  const querySnapshot = await getDocs(q);
  const shops: ShopDetails[] = [];
  querySnapshot.forEach((doc) => {
    shops.push({ id: doc.id, ...doc.data() } as ShopDetails);
  });
  return shops;
}


export const fetchOwnerShopData = async (ownerId: string): Promise<{ id: string | null; slug: string | null }> => {
  /** use this function only for owner shops */
  try {
    const q = query(collection(db, 'shops'), where('ownerId', '==', ownerId));
    const shopSnapshot = await getDocs(q);
    if (shopSnapshot.docs.length > 0) {
      const firstShop = shopSnapshot.docs[0];
      const shopData = firstShop.data();
      console.log('Shop Data:', shopData);
      const shopName = shopData.name || 'shop';
      const shopSlug = slugify(shopName) || 'default-slug';

      return {
        id: firstShop.id,
        slug: shopSlug
      };
    }
    return { id: null, slug: null };
  } catch (error) {
    console.error("Error fetching shop ID:", error);
    return null;
  }
};

export const fetchCustomerShopsData = async (customerId: string): Promise<{ id: string | null; slug: string | null }> => {
  try {
    // 1. Get user document to check linked shops
    const userRef = doc(db, 'users', customerId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { id: null, slug: null };
    }

    const userData = userSnap.data();
    const linkedShops = userData.linkedShops || [];

    // 2. If no linked shops, return null values
    if (linkedShops.length === 0) {
      return { id: null, slug: null };
    }

    // 3. Get the first linked shop's data
    const shopId = linkedShops[0];
    const shopDoc = await getDoc(doc(db, 'shops', shopId));

    if (!shopDoc.exists()) {
      return { id: null, slug: null };
    }

    const shopData = shopDoc.data();
    console.log('Shop Data:', shopData, shopId);
    const shopSlug = slugify(shopData.name) || shopId;

    return {
      id: shopId,
      slug: shopSlug
    };
  } catch (error) {
    console.error("Error fetching customer shop data:", error);
    return { id: null, slug: null };
  }
};

export const getShopOwnerId = async (shopId: string): Promise<string | null> => {
  try {
    const shopDoc = await getDoc(doc(db, 'shops', shopId));
    if (!shopDoc.exists()) {
      throw new Error('Shop not found');
    }
    const shopData = shopDoc.data();
    return shopData.ownerId;
  } catch (error) {
    console.error("Error fetching shop owner ID:", error);
    return null;
  }
};