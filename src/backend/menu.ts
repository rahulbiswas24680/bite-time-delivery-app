import { db } from "@/backend/firebase";
import { doc, getDoc } from "firebase/firestore";

export const getCategoryNameById = async (categoryId: string): Promise<string | null> => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const categorySnap = await getDoc(categoryRef);

    if (categorySnap.exists()) {
      return categorySnap.data().name || null;
    } else {
      console.warn(`Category ${categoryId} not found`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching category:", error);
    return null;
  }
};