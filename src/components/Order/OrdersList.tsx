
import React, { useState } from 'react';
import { Order } from '../../utils/types';
import OrderCard from './OrderCard';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface OrdersListProps {
  orders: Order[];
  showActions?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => Promise<void>;
  loading?: boolean;
}

const OrdersList: React.FC<OrdersListProps> = ({ 
  orders, 
  showActions = true,
  hasMore = false,
  onLoadMore,
  loading = false
}) => {
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (!onLoadMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  };


  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No orders found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {orders.map((order) => (
          <OrderCard 
            key={order.id} 
            order={order}
            showActions={showActions}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleLoadMore}
            variant="ghost"
            disabled={isLoadingMore}
            className="min-w-[120px]"
          >
            {isLoadingMore ? (
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

      {loading && orders.length === 0 && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default OrdersList;
