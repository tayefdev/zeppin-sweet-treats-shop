
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import WebhookTester from '@/components/WebhookTester';
import ItemsManagement from '@/components/admin/ItemsManagement';
import OrdersHistory from '@/components/admin/OrdersHistory';
import GlobalSalesManagement from '@/components/admin/GlobalSalesManagement';

interface BakeryItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  is_on_sale?: boolean;
  sale_percentage?: number;
}

interface Order {
  id: string;
  order_id: string;
  item_name: string;
  quantity: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  special_notes?: string;
  created_at: string;
  item_id?: string;
  bakery_items?: {
    image: string;
  };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasViewedOrders, setHasViewedOrders] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  useEffect(() => {
    // Check if admin is logged in
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isAdminLoggedIn !== 'true') {
      navigate('/admin');
      return;
    }

    // Get last viewed order count from localStorage
    const savedOrderCount = localStorage.getItem('lastViewedOrderCount');
    if (savedOrderCount) {
      setLastOrderCount(parseInt(savedOrderCount));
    }
  }, [navigate]);

  // Early return if not authenticated
  const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');
  if (isAdminLoggedIn !== 'true') {
    return null;
  }

  // Fetch bakery items from Supabase
  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['admin-bakery-items'],
    queryFn: async () => {
      console.log('Fetching bakery items for admin...');
      const { data, error } = await supabase
        .from('bakery_items')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching bakery items:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch orders with item details from Supabase
  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      console.log('Fetching orders for admin...');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          bakery_items (
            image
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Calculate new orders notification
  const newOrdersCount = orders.length > lastOrderCount ? orders.length - lastOrderCount : 0;

  // Handle when user views orders tab
  const handleOrdersTabClick = () => {
    setHasViewedOrders(true);
    setLastOrderCount(orders.length);
    localStorage.setItem('lastViewedOrderCount', orders.length.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button 
              onClick={() => {
                localStorage.removeItem('adminLoggedIn');
                navigate('/admin');
              }}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Logout
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="text-pink-600 border-pink-600 hover:bg-pink-50"
            >
              Back to Website
            </Button>
          </div>
        </div>

        <WebhookTester />

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="items">Manage Items</TabsTrigger>
            <TabsTrigger value="sales">Global Sales</TabsTrigger>
            <TabsTrigger value="orders" onClick={handleOrdersTabClick} className="relative">
              Order History
              {newOrdersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {newOrdersCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-6">
            <ItemsManagement items={items} isLoading={itemsLoading} />
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <GlobalSalesManagement />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersHistory orders={orders} isLoading={ordersLoading} onOrderDeleted={refetchOrders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
