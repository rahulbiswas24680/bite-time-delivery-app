import { collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { ShopDetails } from '@/utils/types';
import { db } from './firebase';


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