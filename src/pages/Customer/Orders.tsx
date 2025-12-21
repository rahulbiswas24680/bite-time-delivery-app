import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrdersByCustomerId } from "../../backend/order";
import Navbar from "../../components/Layout/Navbar";
import OrderCard from "../../components/Order/OrderCard";
import { useAuth } from "../../contexts/AuthContext";
import { DocumentSnapshot } from "firebase/firestore";

const Orders: React.FC = () => {
  const { currentUser, currentShopId, currentShopSlug, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    if (!currentUser) {
      navigate("/login");
    } else if (currentUser.role !== "customer") {
      navigate(`/owner/${currentShopSlug}/dashboard`);
    }
  }, [currentUser, authLoading, navigate]);

  useEffect(() => {
    // Reset state when shop changes
    setOrders([]);
    setLastDoc(null);
    setHasMore(true);
    if (currentUser && currentShopId) {
      loadMoreOrders();
    }
  }, [currentUser, currentShopId]);

  const loadMoreOrders = async () => {
    if (!currentUser || !currentShopId || !hasMore) return;
    setLoading(true);
    try {
      const { data, lastDoc: newLastDoc } = await getOrdersByCustomerId(
        currentUser.id,
        currentShopId,
        lastDoc
      );
      setOrders((prev) => [...prev, ...data]);
      setLastDoc(newLastDoc);
      setHasMore(data.length >= 5);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMoreOrders();
        }
      },
      { threshold: 1.0 }
    );
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loaderRef, loading, hasMore]);

  const activeOrders = orders.filter((order) =>
    ["pending", "confirmed", "preparing", "ready"].includes(order.status)
  );

  const historyOrders = orders.filter((order) =>
    ["completed", "cancelled"].includes(order.status)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        {orders.length === 0 && !loading ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              You haven't placed any orders yet
            </h2>
            <p className="text-gray-500 mb-6">
              Hungry? Browse our menu and place your first order!
            </p>
            <button
              onClick={() => navigate("/customer/menu")}
              className="bg-food-orange hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-md"
            >
              See Menu
            </button>
          </div>
        ) : (
          <Tabs
            defaultValue="active"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "active" | "history")}
            className="w-full space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-xs rounded-lg bg-muted p-0.5 space-x-1">
              <TabsTrigger
                value="active"
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-background hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Active Orders
                <span className="ml-2 bg-gray-200 px-2 rounded-full text-xs font-semibold">
                  {activeOrders.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-background hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Order History
                <span className="ml-2 bg-gray-200 px-2 rounded-full text-xs font-semibold">
                  {historyOrders.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Active Orders</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="history">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">Order History</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {historyOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </section>
            </TabsContent>

            <div ref={loaderRef} className="h-10" />
            {loading && <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-food-orange"></div>
          </div>}
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Orders;
