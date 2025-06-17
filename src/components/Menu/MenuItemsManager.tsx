import { db } from '@/backend/firebase';
import { uploadToS3 } from '@/backend/s3-upload';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Category, MenuItem, MenuItemForm } from '@/utils/types';
import { addDoc, collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { Edit, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';


const MenuItemsManager = () => {
    const { currentShopId } = useAuth();
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<MenuItemForm> | null>(null);
    const { toast } = useToast();

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch menu items filtered by shop ID from Firebase
                const menuItemsRef = collection(db, 'menuItems');
                const q = query(menuItemsRef, where('shopId', '==', currentShopId));
                const querySnapshot = await getDocs(q);
                const itemsData: MenuItem[] = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<MenuItem, 'id'>),
                    image: doc.data().image || '/default-food.png'
                }));
                console.log(itemsData);

                // Fetch categories
                const categoriesRef = collection(db, 'categories');
                const catQuery = query(categoriesRef, where('shopId', '==', currentShopId));
                const categoriesSnapshot = await getDocs(catQuery);
                const categoriesData: Category[] = categoriesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Category, 'id'>)
                }));

                setMenuItems(itemsData);
                setCategories(categoriesData);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch data',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreate = () => {
        setCurrentItem({
            name: '',
            description: '',
            price: 0,
            image: '',
            category: categories[0]?.id || '',
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (item: MenuItem) => {
        setCurrentItem(item);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'menuItems', id));
            setMenuItems(menuItems.filter(item => item.id !== id));
            toast({
                title: 'Success',
                description: 'Menu item deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete menu item',
                variant: 'destructive',
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        console.log(currentItem);
        e.preventDefault();
        // if (!currentItem) return;

        // try {

        // Handle image upload if it's a File object
        const imageUrl = typeof currentItem.image === 'string'
            ? currentItem.image // Keep existing URL
            : await uploadToS3(currentItem.image, currentShopId); // Upload new file
        console.log(imageUrl, 'imagesss....');

        const itemData: MenuItem = {
            ...currentItem,
            image: imageUrl,
            shopId: currentShopId!,
            id: currentItem.id || '', // Ensure id is always string
        } as MenuItem;

        if (currentItem.id) {
            // Update existing item
            await setDoc(doc(db, 'menuItems', currentItem.id), itemData);
            setMenuItems(menuItems.map(item =>
                item.id === currentItem.id ? itemData : item
            ));
        } else {
            // Create new item
            const docRef = await addDoc(collection(db, 'menuItems'), itemData);
            setMenuItems([...menuItems, { ...itemData, id: docRef.id }]);
        }

        toast({
            title: 'Success',
            description: `Menu item ${currentItem.id ? 'updated' : 'created'} successfully`,
        });
        setIsDialogOpen(false);
        // } catch (error) {
        //     toast({
        //         title: 'Error',
        //         description: `Failed to ${currentItem.id ? 'update' : 'create'} menu item`,
        //         variant: 'destructive',
        //     });
        // }
    };

    if (isLoading) {
        return <div className="flex justify-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Menu Items</h2>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {menuItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">Image</TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-gray-500 line-clamp-1">
                                    {item.description}
                                </TableCell>
                                <TableCell className="font-bold">₹{item.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    {categories.find(c => c.id === item.category)?.name || 'Uncategorized'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(item)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {currentItem?.id ? 'Edit Menu Item' : 'Create New Menu Item'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={currentItem?.name || ''}
                                onChange={(e) => setCurrentItem({
                                    ...currentItem!,
                                    name: e.target.value
                                })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Description <span className="text-gray-400 text-sm">(optional)</span>
                            </label>
                            <Textarea
                                value={currentItem?.description || ''}
                                onChange={(e) => setCurrentItem({
                                    ...currentItem!,
                                    description: e.target.value
                                })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Price <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                value={currentItem?.price || 0}
                                onChange={(e) => setCurrentItem({
                                    ...currentItem!,
                                    price: parseFloat(e.target.value)
                                })}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={currentItem?.category || ''}
                                onChange={(e) => setCurrentItem({
                                    ...currentItem!,
                                    category: e.target.value
                                })}
                                className="w-full rounded-md border border-gray-300 p-2"
                                required
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Image <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                        // Verify we have a real File object
                                        console.log('File type:', file.constructor.name); // Should log "File"
                                        setCurrentItem(prev => ({
                                            ...prev!,
                                            image: file, // Store the actual File object
                                        }));
                                        }
                                    }}
                                    id="upload-image"
                                    style={{ display: 'none' }}
                                />
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => document.getElementById('upload-image')?.click()}
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Upload Image
                                </Button>
                                {currentItem?.image && (
                                    <span className="text-sm text-gray-500">Image selected</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {currentItem?.id ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MenuItemsManager;