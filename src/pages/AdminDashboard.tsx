
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Lock, ArrowLeft } from 'lucide-react';
import WebhookTester from '@/components/WebhookTester';
import ItemsManagement from '@/components/admin/ItemsManagement';
import OrdersHistory from '@/components/admin/OrdersHistory';
import GlobalSalesManagement from '@/components/admin/GlobalSalesManagement';
import { BannerManagement } from '@/components/admin/BannerManagement';

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

const ADMIN_PASSWORD = '12345';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasViewedOrders, setHasViewedOrders] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  useEffect(() => {
    // Check if already authenticated in session
    const authStatus = sessionStorage.getItem('adminAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    // Get last viewed order count from localStorage
    const savedOrderCount = localStorage.getItem('lastViewedOrderCount');
    if (savedOrderCount) {
      setLastOrderCount(parseInt(savedOrderCount));
    }
  }, []);

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
    enabled: isAuthenticated // Only fetch when authenticated
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
    enabled: isAuthenticated // Only fetch when authenticated
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuthenticated', 'true');
      setIsAuthenticated(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the admin panel!",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect password. Please try again.",
        variant: "destructive"
      });
    }

    setIsLoading(false);
    setPassword('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    setIsAuthenticated(false);
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-6 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto bg-gradient-to-r from-pink-400 to-orange-400 p-3 rounded-full w-fit mb-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-800">Admin Access</CardTitle>
              <p className="text-gray-600">Enter password to continue</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    className="mt-1"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold py-2 rounded-full disabled:opacity-50"
                >
                  {isLoading ? 'Checking...' : 'Access Admin Panel'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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

        <WebhookTester />

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="items">Manage Items</TabsTrigger>
            <TabsTrigger value="sales">Global Sales</TabsTrigger>
            <TabsTrigger value="banner">Banner</TabsTrigger>
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

          <TabsContent value="orders" className="space-y-6">
            <OrdersHistory orders={orders} isLoading={ordersLoading} onOrderDeleted={refetchOrders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
