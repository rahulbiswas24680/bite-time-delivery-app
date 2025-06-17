import { useAuth } from '@/contexts/AuthContext';
import { ShopDetails } from '@/utils/types';
import { collection, getDocs } from 'firebase/firestore';
import React from 'react';
import { db } from '@/backend/firebase';
import Navbar from '@/components/Layout/Navbar';
import { Navigate, useNavigate } from 'react-router-dom';
import ShopSetupModal from '@/components/Shop/ShopSetupModal';


type ShopWithSlug = ShopDetails & { slug: string };

const OwnerShops = () => {

    const { currentUser } = useAuth();
    const currentOwnerId = currentUser?.id;
    const [shops, setShops] = React.useState<ShopDetails[]>([]);
    const [showShopSetupModal, setShowShopSetupModal] = React.useState(false);
    const navigate = useNavigate();

    const slugify = (name: string) =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dashes
            .replace(/^-+|-+$/g, '');



    React.useEffect(() => {
        console.log('📦 useEffect running to fetch shops...');
        const fetchShops = async () => {
            try {
                const shopsRef = collection(db, 'shops');
                const querySnapshot = await getDocs(shopsRef);
                const shopsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    const name = (data as any).name || 'shop';
                    console.log('Generating slug for:', name, '->', slugify(name));
                    return {
                        id: doc.id,
                        ...data,
                        slug: slugify(name) || 'default-slug',
                    };
                }) as ShopWithSlug[];
                console.log('shopsData:', shopsData);
                setShops(shopsData);
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };

        fetchShops();
    }, []);

    console.log('shops:', shops);

    const handleShopClick = (shopId: string) => {
        navigate(`/owner/dashboard/${shopId}`);
    };

    const handleAddNewShop = () => {
        setShowShopSetupModal(true);
    };

    const handleShopCreated = (shopId: string) => {
        setShowShopSetupModal(false); // Close the modal
        console.log(`Shop created: ${shopId}. Redirecting to owner dashboard.`);
        navigate(`/owner/dashboard/${shopId}`); // Navigate to the owner's dashboard
    };


    return (
        <>
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold">My Shops</h1>
                        <button
                            onClick={handleAddNewShop}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                        >
                            Add New Shop
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {shops.map((shop) => (
                            <div
                                key={shop.id}
                                onClick={() => handleShopClick(shop.id)}
                                className="cursor-pointer bg-white border border-gray-200 shadow-md rounded-lg p-4 hover:shadow-lg transition"
                            >
                                <img
                                    src="https://png.pngtree.com/png-vector/20200729/ourmid/pngtree-small-restaurant-building-vector-with-flat-design-png-image_2316583.jpg"
                                    alt={shop.name}
                                    className="w-full h-40 object-cover rounded-md mb-4"
                                />
                                <h2 className="text-lg font-semibold">{shop.name}</h2>
                                <p className="text-gray-600 text-sm mt-1">
                                    {shop.description || "No description provided"}
                                </p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Conditionally render the modal */}
            {showShopSetupModal && currentOwnerId && (
                console.log('Rendering modal for owner:', currentOwnerId),
                <ShopSetupModal
                    ownerId={currentOwnerId}
                    onShopCreated={handleShopCreated}
                // You might add an onClose prop if you want a cancellable modal,
                // but for forced setup, you might not.
                />
            )}
        </>
    )
}

export default OwnerShops