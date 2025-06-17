import Navbar from "@/components/Layout/Navbar";
import CategoriesManager from "@/components/Menu/CategoriesManager";
import MenuItemsManager from "@/components/Menu/MenuItemsManager";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useState } from "react";

export default function MenuManagement() {
    const { currentUser, currentShopId } = useAuth();
    const [view, setView] = useState<'categories' | 'items'>('categories');

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="p-4 md:p-6 max-w-6xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            Menu Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Organize your menu categories and items
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <Tabs
                            defaultValue={view}
                            onValueChange={(v) => setView(v as 'categories' | 'items')}
                            className="w-full"
                        >
                            <TabsList className="grid w-full grid-cols-2 bg-gray-50 dark:bg-gray-700 p-1">
                                <TabsTrigger
                                    value="categories"
                                    className="py-3 px-4 text-sm font-medium transition-all rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                                >
                                    Categories
                                </TabsTrigger>
                                <TabsTrigger
                                    value="items"
                                    className="py-3 px-4 text-sm font-medium transition-all rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                                >
                                    Menu Items
                                </TabsTrigger>
                            </TabsList>

                            <div className="p-4 md:p-6">
                                <TabsContent value="categories">
                                    <CategoriesManager />
                                </TabsContent>
                                <TabsContent value="items">
                                    <MenuItemsManager />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>

                    {/* Floating Action Button for mobile */}
                    <div className="fixed bottom-6 right-6 sm:hidden">
                        <button className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                            {view === 'categories' ? (
                                <span className="text-sm">New Category</span>
                            ) : (
                                <span className="text-sm">New Item</span>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}