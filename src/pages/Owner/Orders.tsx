import { fetchOrdersByStatus } from '@/backend/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsTrigger } from '@/components/ui/tabs';
import { Order } from '@/utils/types';
import { Tabs, TabsContent, TabsList } from '@radix-ui/react-tabs';
import { DocumentSnapshot } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import OrdersList from '../../components/Order/OrdersList';
import { useAuth } from '@/contexts/AuthContext';

type OrderStatusTab = 'active' | 'history';

const OwnerOrders = () => {
  // Store orders separately for each tab
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState({
    active: true,
    history: true
  });
  const [loadingMore, setLoadingMore] = useState({
    active: false,
    history: false
  });
  const [hasMore, setHasMore] = useState({
    active: true,
    history: true
  });
  const [lastDoc, setLastDoc] = useState<{
    active: DocumentSnapshot | null;
    history: DocumentSnapshot | null;
  }>({ active: null, history: null });
  const [activeTab, setActiveTab] = useState<OrderStatusTab>('active');
  const [error, setError] = useState<string | null>(null);
  
  const { currentShopId, currentShopSlug } = useAuth();

  // const shopId = useParams().shopId!;
  const navigate = useNavigate();

  const getStatusesForTab = (tab: OrderStatusTab): string[] => {
    return tab === 'active' 
      ? ['pending', 'confirmed', 'preparing'] 
      : ['completed', 'cancelled'];
  };

  // Fetch initial orders when component mounts or shopId changes
  useEffect(() => {
    const fetchInitialOrders = async () => {
      try {
        if (!currentShopId) {
          navigate('/not-found');
          return;
        }
        
        // Fetch active orders
        setLoading(prev => ({ ...prev, active: true }));
        const activeStatuses = getStatusesForTab('active');
        let activeOrdersData: Order[] = [];
        let activeLastDoc: DocumentSnapshot | null = null;
        
        for (const status of activeStatuses) {
          const result = await fetchOrdersByStatus(status, currentShopId);
          activeOrdersData = [...activeOrdersData, ...result.data];
          activeLastDoc = result.lastDoc;
        }
        
        setActiveOrders(activeOrdersData);
        setLastDoc(prev => ({ ...prev, active: activeLastDoc }));
        setHasMore(prev => ({ ...prev, active: activeOrdersData.length > 0 }));
        
        // Fetch history orders
        setLoading(prev => ({ ...prev, history: true }));
        const historyStatuses = getStatusesForTab('history');
        let historyOrdersData: Order[] = [];
        let historyLastDoc: DocumentSnapshot | null = null;
        
        for (const status of historyStatuses) {
          const result = await fetchOrdersByStatus(status, currentShopId);
          historyOrdersData = [...historyOrdersData, ...result.data];
          historyLastDoc = result.lastDoc;
        }
        
        setHistoryOrders(historyOrdersData);
        setLastDoc(prev => ({ ...prev, history: historyLastDoc }));
        setHasMore(prev => ({ ...prev, history: historyOrdersData.length > 0 }));
        
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading({ active: false, history: false });
      }
    };

    fetchInitialOrders();
  }, [currentShopId, navigate]);

  const handleLoadMore = async () => {
    const currentTab = activeTab;
    
    try {
      setLoadingMore(prev => ({ ...prev, [currentTab]: true }));
      setError(null);
      
      const statuses = getStatusesForTab(currentTab);
      const currentLastDoc = lastDoc[currentTab];
      
      if (!currentLastDoc) return;
      
      // For load more, we'll fetch the next batch for the last status
      const lastStatus = statuses[statuses.length - 1];
      const result = await fetchOrdersByStatus(lastStatus, currentShopId, currentLastDoc);
      
      if (currentTab === 'active') {
        setActiveOrders(prev => [...prev, ...result.data]);
      } else {
        setHistoryOrders(prev => [...prev, ...result.data]);
      }
      
      setLastDoc(prev => ({ ...prev, [currentTab]: result.lastDoc }));
      setHasMore(prev => ({ ...prev, [currentTab]: result.data.length > 0 }));
    } catch (err) {
      console.error('Error loading more orders:', err);
      setError('Failed to load more orders. Please try again.');
    } finally {
      setLoadingMore(prev => ({ ...prev, [currentTab]: false }));
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Order Management</h1>

        <Tabs 
          defaultValue="active" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as OrderStatusTab)}
          className="w-full space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2 max-w-xs rounded-lg bg-muted p-1 space-x-1">
            <TabsTrigger value="active" className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-background hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
              Active Orders
              <Badge variant="secondary" className="ml-2">
                {activeOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-background hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground">
              Order History
              <Badge variant="secondary" className="ml-2">
                {historyOrders.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Active Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.active ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-destructive">
                    {error}
                  </div>
                ) : (
                  <>
                    <OrdersList
                      orders={activeOrders}
                      showActions={true}
                    />
                    {hasMore.active && activeOrders.length > 0 && (
                      <div className="flex justify-center mt-4">
                        <Button
                          onClick={handleLoadMore}
                          disabled={loadingMore.active}
                          variant="outline"
                        >
                          {loadingMore.active ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading.history ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-destructive">
                    {error}
                  </div>
                ) : (
                  <>
                    <OrdersList
                      orders={historyOrders}
                      showActions={false}
                    />
                    {hasMore.history && historyOrders.length > 0 && (
                      <div className="flex justify-center mt-4">
                        <Button
                          onClick={handleLoadMore}
                          disabled={loadingMore.history}
                          variant="outline"
                        >
                          {loadingMore.history ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default OwnerOrders;