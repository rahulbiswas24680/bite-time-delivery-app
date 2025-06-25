
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { MenuItem } from '../utils/types';
import { db } from '@/backend/firebase';



// Helper functions to work with menu data
/**
 * Fetches a menu item by ID for a specific shop
 */
export const getMenuItemById = async (itemId: string): Promise<MenuItem | undefined> => {
  try {
    const q = query(
      collection(db, "menuItems"),
      where("id", "==", itemId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return undefined;
    // console.log(querySnapshot.docs[0].data(), '==');
    return querySnapshot.docs[0].data() as MenuItem;
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return undefined;
  }
};
/**
 * Fetches all menu items for a specific category in a shop
 */
export const getMenuItemsByCategory = async (shopId: string, category: string): Promise<MenuItem[]> => {
  try {
    const q = query(
      collection(db, "menuItems"),
      where("shopId", "==", shopId),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as MenuItem);
  } catch (error) {
    console.error("Error fetching menu items by category:", error);
    return [];
  }
};

/**
 * Fetches all unique categories for a specific shop
 */
export const getMenuCategories = async (shopId: string): Promise<{id: string, name: string}[]> => {
  try {
    // First get all unique category IDs from menu items
    const menuItemsQuery = query(
      collection(db, "menuItems"),
      where("shopId", "==", shopId)
    );
    const menuItemsSnapshot = await getDocs(menuItemsQuery);
    
    const categoryIds = new Set<string>();
    console.log('categoryIds', categoryIds);
    menuItemsSnapshot.forEach(doc => {
      const data = doc.data() as MenuItem;
      if (data.category) {
        categoryIds.add(data.category);
      }
    });

    // Then get the names for these categories
    const categoriesPromises = Array.from(categoryIds).map(async (categoryId) => {
      const categoryDoc = await getDoc(doc(db, "categories", categoryId));
      if (categoryDoc.exists()) {
        return {
          id: categoryId,
          name: categoryDoc.data().name || 'Unnamed Category'
        };
      }
      return {
        id: categoryId,
        name: 'Unnamed Category'
      };
    });

    const categories = await Promise.all(categoriesPromises);
    return categories;
  } catch (error) {
    console.error("Error fetching menu categories:", error);
    return [];
  }
};

/**
 * Fetches all menu items for a specific shop
 */
export const getAllMenuItems = async (shopId: string): Promise<MenuItem[]> => {
  try {
    const q = query(
      collection(db, "menuItems"),
      where("shopId", "==", shopId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data() as MenuItem;
      return {
        ...data,
        id: doc.id // Ensure we have the document ID
      };
    });
  } catch (error) {
    console.error("Error fetching all menu items:", error);
    return [];
  }
};
