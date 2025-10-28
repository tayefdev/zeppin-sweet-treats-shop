
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import ItemsManagement from '@/components/admin/ItemsManagement';
import OrdersHistory from '@/components/admin/OrdersHistory';
import GlobalSalesManagement from '@/components/admin/GlobalSalesManagement';
import { BannerManagement } from '@/components/admin/BannerManagement';
import LogoManagement from '@/components/admin/LogoManagement';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user, isAdmin, loading, signOut } = useAuth();
  const [hasViewedOrders, setHasViewedOrders] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  useEffect(() => {
    // Redirect to login if not authenticated or not admin
    if (!loading && !isAdmin) {
      navigate('/admin/login');
    }

    // Get last viewed order count from localStorage
    const savedOrderCount = localStorage.getItem('lastViewedOrderCount');
    if (savedOrderCount) {
      setLastOrderCount(parseInt(savedOrderCount));
    }
  }, [loading, isAdmin, navigate]);

  // Fetch bakery items from Supabase (hooks must be called before any returns)
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
    },
    enabled: isAdmin // Only fetch when admin authenticated
  });

  // Fetch orders with item details from Supabase (hooks must be called before any returns)
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
    },
    enabled: isAdmin // Only fetch when admin authenticated
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel.",
    });
  };

  // Calculate new orders notification
  const newOrdersCount = orders.length > lastOrderCount ? orders.length - lastOrderCount : 0;

  // Handle when user views orders tab
  const handleOrdersTabClick = () => {
    setHasViewedOrders(true);
    setLastOrderCount(orders.length);
    localStorage.setItem('lastViewedOrderCount', orders.length.toString());
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin (useEffect will redirect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Button 
              onClick={handleLogout}
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

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="items">Manage Items</TabsTrigger>
            <TabsTrigger value="sales">Global Sales</TabsTrigger>
            <TabsTrigger value="banner">Banner</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
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

          <TabsContent value="banner" className="space-y-6">
            <BannerManagement />
          </TabsContent>

          <TabsContent value="logo" className="space-y-6">
            <LogoManagement />
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
