
import React from 'react';
import { orders } from '../../data/orders';
import OrdersList from '../../components/Order/OrdersList';
import Layout from '../../components/Layout/Layout';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OwnerOrders = () => {
  const pendingOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing'].includes(order.status)
  );
  const completedOrders = orders.filter(order => 
    ['completed', 'cancelled'].includes(order.status)
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Order Management</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">
                Active Orders
                <Badge variant="secondary" className="ml-2">
                  {pendingOrders.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrdersList orders={pendingOrders} showActions={true} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">
                Order History
                <Badge variant="secondary" className="ml-2">
                  {completedOrders.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrdersList orders={completedOrders} showActions={false} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OwnerOrders;
