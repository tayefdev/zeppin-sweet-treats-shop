
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from 'lucide-react';

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

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">Order #{order.order_id}</h3>
            <p className="text-sm text-gray-600">
              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
            ৳{order.total_amount}
          </span>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center">
            {order.bakery_items?.image ? (
              <img 
                src={order.bakery_items.image} 
                alt={order.item_name}
                className="w-16 h-16 object-cover rounded-lg mr-3"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg mr-3 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-800">Order Details</h4>
              <p className="text-sm text-gray-600">
                <strong>Item:</strong> {order.item_name}<br />
                <strong>Quantity:</strong> {order.quantity}
              </p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <h4 className="font-medium text-gray-800 mb-2">Customer Information</h4>
            <p className="text-sm text-gray-600">
              <strong>Name:</strong> {order.customer_name}<br />
              <strong>Email:</strong> {order.customer_email}<br />
              <strong>Phone:</strong> {order.customer_phone}<br />
              <strong>Address:</strong> {order.customer_address}
              {order.special_notes && (
                <>
                  <br />
                  <strong>Notes:</strong> {order.special_notes}
                </>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard;
