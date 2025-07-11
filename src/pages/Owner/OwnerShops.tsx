import { db } from '@/backend/firebase';
import Navbar from '@/components/Layout/Navbar';
import ShopSetupModal from '@/components/Shop/ShopSetupModal';
import { useAuth } from '@/contexts/AuthContext';
import { ShopDetails } from '@/utils/types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { DownloadIcon, MoreVertical, PlusIcon, QrCodeIcon, XIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type ShopWithSlug = ShopDetails & { slug: string; id: string };

const OwnerShops = () => {
    const { currentUser, setCurrentShopId } = useAuth();
    const currentOwnerId = currentUser?.id;
    const [shops, setShops] = useState<ShopWithSlug[]>([]);
    const [showShopSetupModal, setShowShopSetupModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedShopForQR, setSelectedShopForQR] = useState<ShopWithSlug | null>(null);
    const [showDropdown, setShowDropdown] = useState<string | null>(null); // Track which shop's dropdown is open

    const navigate = useNavigate();

    const slugify = (name: string): string =>
        name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

    useEffect(() => {
        const fetchShops = async () => {
            if (!currentOwnerId) return;

            try {
                const shopsRef = collection(db, 'shops');
                const q = query(shopsRef, where('ownerId', '==', currentOwnerId));
                const querySnapshot = await getDocs(q);

                const shopsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    slug: slugify(doc.data().name || 'shop'),
                })) as ShopWithSlug[];

                setShops(shopsData);
            } catch (error) {
                console.error('Error fetching shops:', error);
            }
        };

        fetchShops();
    }, [currentOwnerId]);

    const handleShopClick = (shopId: string, shopSlug: string) => {
        setCurrentShopId(shopId);
        navigate(`/owner/${shopSlug}/dashboard`);
    };

    const handleAddNewShop = () => {
        setShowShopSetupModal(true);
    };

    const handleShopCreated = (shopSlug: string) => {
        setShowShopSetupModal(false);
        navigate(`/owner/${shopSlug}/dashboard`);
    };

    const handleEditShop = (shopId: string) => {
        navigate(`/owner/shops/${shopId}/edit`);
        setShowDropdown(null);
    };

    const handleViewAnalytics = (shopId: string) => {
        navigate(`/owner/shops/${shopId}/analytics`);
        setShowDropdown(null);
    };

    const handleDeleteShop = async (shopId: string) => {
        if (window.confirm('Are you sure you want to delete this shop?')) {
            try {
                // Implement your delete logic here
                // await deleteDoc(doc(db, 'shops', shopId));
                setShops(shops.filter(shop => shop.id !== shopId));
            } catch (error) {
                console.error('Error deleting shop:', error);
            }
        }
        setShowDropdown(null);
    };

    const handleQRClick = (shop: ShopWithSlug) => {
        setSelectedShopForQR(shop);
        setShowQRModal(true);
    };

    const toggleDropdown = (shopId: string) => {
        setShowDropdown(showDropdown === shopId ? null : shopId);
    };

    useEffect(() => {
        const handleClickOutside = () => {
            if (showDropdown) {
                setShowDropdown(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showDropdown]);

    const closeAllModals = () => {
        setShowQRModal(false);
        setShowDropdown(null);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-orange-400">Owner's Shops</h1>
                    <button
                        onClick={handleAddNewShop}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add New Shop
                    </button>
                </div>

                {shops.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">You don't have any shops yet.</p>
                        <button
                            onClick={handleAddNewShop}
                            className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                        >
                            Create Your First Shop
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {shops.map((shop) => (
                            <div
                                key={shop.id}
                                className="bg-white border border-gray-200 shadow-md rounded-lg overflow-visible hover:shadow-lg transition transform hover:-translate-y-1 relative"
                            >
                                <div
                                    onClick={() => handleShopClick(shop.id, shop.slug)}
                                    className="cursor-pointer"
                                >
                                    <img
                                        src={shop.image || "/default-shop.jpg"}
                                        alt={shop.name}
                                        className="w-full h-full object-cover [filter:sepia(100%)_hue-rotate(302deg)_saturate(600%)]"
                                    />
                                    <div className="p-4">
                                        <div className="flex justify-between items-start">
                                            <h2 className="text-lg font-semibold line-clamp-1">{shop.name}</h2>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                            {shop.description || "No description provided"}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-4 pb-4 flex justify-between items-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQRClick(shop);
                                        }}
                                        className="flex items-center gap-2 text-primary hover:text-primary-dark transition"
                                    >
                                        <QrCodeIcon className="w-5 h-5" />
                                        <span>Show QR</span>
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleDropdown(shop.id);
                                            }}
                                            className="p-1 rounded-full hover:bg-gray-100 transition"
                                            aria-label="More options"
                                        >
                                            <MoreVertical className="w-5 h-5 text-gray-500" />
                                        </button>

                                        {showDropdown === shop.id && (
                                            <div
                                                className="absolute right-8 -bottom-3 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => handleEditShop(shop.id)}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        Edit Shop
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewAnalytics(shop.id)}
                                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                    >
                                                        View Analytics
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteShop(shop.id)}
                                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                    >
                                                        Delete Shop
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* QR Code Modal */}
            {showQRModal && selectedShopForQR && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div
                        className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Decorative elements */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-100/30"></div>
                        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-green-100/30"></div>

                        {/* Modal content */}
                        <div className="relative z-10">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800">{selectedShopForQR.name}</h3>
                                    <p className="text-gray-500">Scan to visit shop</p>
                                </div>
                                <button
                                    onClick={closeAllModals}
                                    className="p-2 rounded-full hover:bg-gray-100 transition"
                                    aria-label="Close QR code modal"
                                >
                                    <XIcon className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            {/* QR Code with shop branding */}
                            <div className="mb-6 flex flex-col items-center">
                                <div className="relative p-4 bg-white rounded-xl shadow-md border border-gray-100 mb-4">
                                    <QRCodeSVG
                                        value={`http://localhost:8080/customer/${selectedShopForQR.id}/anonymous-register`}
                                        size={220}
                                        level="H"
                                        includeMargin={true}
                                    />
                                    {selectedShopForQR.logo && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-white p-2 rounded-md">
                                                <img
                                                    src={selectedShopForQR.logo}
                                                    alt="Shop logo"
                                                    className="w-12 h-12 object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 text-center max-w-xs">
                                    Scan this QR code to visit {selectedShopForQR.name} on your mobile device
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col space-y-3">
                                <button
                                    className="flex items-center justify-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition"
                                    onClick={() => {
                                        // Implement download functionality
                                        console.log('Download QR code');
                                    }}
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Download QR Code
                                </button>
                                
                                <button
                                    className="flex items-center justify-center gap-2 border border-gray-300 bg-amber-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-amber-300 transition"
                                    onClick={() => {
                                        // Implement request QR functionality
                                        console.log('Request QR code');
                                    }}
                                >
                                    <QrCodeIcon className="w-5 h-5" />
                                    Request Physical QR Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Shop Setup Modal */}
            {showShopSetupModal && currentOwnerId && (
                <ShopSetupModal
                    ownerId={currentOwnerId}
                    onShopCreated={handleShopCreated}
                    onClose={() => setShowShopSetupModal(false)}
                />
            )}
        </div>
    );
};

export default OwnerShops;