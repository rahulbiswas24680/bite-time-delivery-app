import { addLinkedShopToUser } from '@/backend/authService';
import { fetchCustomerShopsData } from '@/backend/shop';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AnonymousRegister = () => {
    const { anonymousLoginUser, currentUser, setCurrentShopId, setCurrentShopSlug } = useAuth();
    const { shopId } = useParams<{ shopId: string }>();
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const registerAnon = async () => {
            try {
                let user = currentUser;

                // ✅ Step 1: Handle anonymous login if no user or anonymous user
                if (!user || user.isAnonymous) {
                user = await anonymousLoginUser();
                }

                // ✅ Step 2: Add shop only if not already linked
                if (shopId && user && (!user.linkedShops || !user.linkedShops.includes(shopId))) {
                    await addLinkedShopToUser(user.id, shopId);
                }

                // ✅ Step 3: Fetch shop ID & slug and update context
                const { id, slug } = await fetchCustomerShopsData(user.id);
                setCurrentShopId(id);
                setCurrentShopSlug(slug);

                navigate(`/customer/${slug}/menu`);
            } catch (err) {
                console.error("Anonymous login failed", err);
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        registerAnon();
    }, [anonymousLoginUser, currentUser, navigate, shopId]);


    return (
        <div className="text-center mt-20">
            <p>{loading ? 'Logging in as guest...' : 'Redirecting...'}</p>
            {shopId && <p className="text-sm text-gray-500">Connecting to shop: {shopId}</p>}
        </div>

    )
}

export default AnonymousRegister