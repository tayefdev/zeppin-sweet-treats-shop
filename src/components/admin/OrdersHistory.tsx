
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from 'lucide-react';
import OrderCard from './OrderCard';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  bakery_items?: {
    image: string;
  };
}

interface OrdersHistoryProps {
  orders: Order[];
  isLoading: boolean;
  onOrderDeleted: () => void;
}

const OrdersHistory: React.FC<OrdersHistoryProps> = ({ orders, isLoading, onOrderDeleted }) => {
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteOrder = async (orderId: string) => {
    setDeletingOrderId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Deleted",
        description: "The order has been successfully deleted.",
      });
      
      onOrderDeleted();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete the order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingOrderId(null);
    }
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Order History</h2>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No orders yet!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onDelete={handleDeleteOrder}
              isDeleting={deletingOrderId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;
