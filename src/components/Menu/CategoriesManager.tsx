import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Category } from "@/utils/types";
import { useAuth } from "@/contexts/AuthContext";
import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/backend/firebase";

const CategoriesManager = () => {
    const { currentShopId } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();


    // Fetch categories on load
    useEffect(() => {
        if (!currentShopId) return;

        const fetchCategories = async () => {
            try {
                const catRef = collection(db, 'categories');
                const q = query(catRef, where('shopId', '==', currentShopId));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Category, 'id'>)
                }));
                setCategories(data);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch categories',
                    variant: 'destructive',
                });
            }
        };

        fetchCategories();
    }, [currentShopId]);


    const handleAddCategory = async () => {
        if (!newCategory.trim()) {
            toast({
                title: 'Error',
                description: 'Category name cannot be empty',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const docRef = await addDoc(collection(db, 'categories'), {
                name: newCategory.trim(),
                shopId: currentShopId,
            });

            const newItem: Category = {
                id: docRef.id,
                name: newCategory.trim(),
                shopId: currentShopId,
            };

            setCategories(prev => [...prev, newItem]);
            setNewCategory('');
            toast({
                title: 'Success',
                description: 'Category added successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add category',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // Check if any menu items use this category
            const menuItemsRef = collection(db, 'menuItems');
            const q = query(menuItemsRef, where('category', '==', id));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                toast({
                    title: 'Cannot Delete',
                    description: 'This category is linked to one or more menu items.',
                    variant: 'destructive',
                });
                return;
            }
            // Safe to delete
            await deleteDoc(doc(db, 'categories', id));
            setCategories(prev => prev.filter(cat => cat.id !== id));
            toast({
                title: 'Deleted',
                description: 'Category removed',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete category',
                variant: 'destructive',
            });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAddCategory();
        }
    };

    return (
        <div className="container max-w-4xl py-6 px-4">
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Menu Categories</h1>
                    <p className="text-muted-foreground">
                        Organize your menu by creating categories
                    </p>
                </div>

                <Separator />

                <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl">Add New Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category Name</Label>
                                <Input
                                    id="category"
                                    placeholder="e.g. Appetizers, Main Courses, Desserts"
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t px-6 py-4">
                        <Button
                            onClick={handleAddCategory}
                            disabled={!newCategory.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                "Adding..."
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Category
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {categories.length > 0 ? (
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Your Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="divide-y">
                                {categories.map(cat => (
                                    <li
                                        key={cat.id}
                                        className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-md transition-colors"
                                    >
                                        <span className="font-medium">{cat.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-destructive hover:text-destructive/80"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-sm">
                        <CardContent className="py-8 text-center">
                            <p className="text-muted-foreground">
                                No categories yet. Add your first category above.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CategoriesManager