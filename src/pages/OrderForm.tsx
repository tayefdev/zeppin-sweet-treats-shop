import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation } from "@tanstack/react-query";

interface BakeryItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

const OrderForm = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Fetch specific bakery item from Supabase
  const { data: item, isLoading, error } = useQuery({
    queryKey: ['bakery-item', itemId],
    queryFn: async () => {
      if (!itemId) return null;
      
      console.log('Fetching bakery item:', itemId);
      const { data, error } = await supabase
        .from('bakery_items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching bakery item:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!itemId
  });

  // Function to trigger Make.com webhook
  const triggerWebhook = async (orderData: any) => {
    try {
      console.log('Triggering Make.com webhook with order data:', orderData);
      
      const webhookData = {
        order_id: orderData.order_id,
        item_name: orderData.item_name,
        quantity: orderData.quantity,
        total_amount: orderData.total_amount,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        special_notes: orderData.special_notes,
        order_date: new Date().toISOString(),
        currency: 'BDT'
      };

      const response = await fetch('https://hook.eu2.make.com/jdbihbqrt5iuifizc3uxq4p4xb5v3m4k', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(webhookData),
      });

      console.log('Webhook triggered successfully');
    } catch (error) {
      console.error('Error triggering webhook:', error);
      // Don't fail the order if webhook fails
    }
  };

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      console.log('Creating order:', orderData);
      
      // First create the order in Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }
      
      // Then trigger the Make.com webhook
      await triggerWebhook(orderData);
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Order created successfully:', data);
      toast({
        title: "Order Placed Successfully! 🎉",
        description: `Your order for ${quantity}x ${item?.name} has been received. We'll contact you soon!`,
      });

      // Reset form
      setCustomerInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
      setQuantity(1);

      // Navigate back to homepage after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;

    // Validate quantity first
    if (quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a quantity greater than 0.",
        variant: "destructive"
      });
      return;
    }

    // Validate form
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone || !customerInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const orderData = {
      order_id: `ORDER-${Date.now()}`,
      item_id: item.id,
      item_name: item.name,
      quantity,
      total_amount: item.price * quantity,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      special_notes: customerInfo.notes || null
    };

    createOrderMutation.mutate(orderData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <Card className="p-6">
          <p className="text-center text-gray-600">Item not found</p>
          <Button onClick={() => navigate('/')} className="w-full mt-4">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-pink-600 hover:text-pink-700 hover:bg-pink-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Item Details */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="aspect-square overflow-hidden rounded-t-lg">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800">{item.name}</CardTitle>
              <p className="text-gray-600">{item.description}</p>
              <p className="text-2xl font-bold text-pink-600">৳{item.price}</p>
            </CardHeader>
          </Card>

          {/* Order Form */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-gray-800 flex items-center">
                <ShoppingCart className="h-6 w-6 mr-2 text-pink-600" />
                Place Your Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="mt-1"
                    required
                  />
                  {quantity <= 0 && (
                    <p className="text-red-500 text-sm mt-1">Please enter a quantity greater than 0</p>
                  )}
                </div>

                {quantity > 0 && (
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <p className="font-semibold text-gray-800">
                      Total: ৳{(item.price * quantity).toFixed(2)}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="Your full name"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    placeholder="your.email@example.com"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="+880 1234 567890"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Delivery Address *</Label>
                  <Textarea
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    placeholder="House/Flat No, Road, Area, City, District"
                    required
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                    placeholder="Any special requests or delivery instructions..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold py-3 rounded-full text-lg"
                  disabled={createOrderMutation.isPending || quantity <= 0}
                >
                  {createOrderMutation.isPending 
                    ? 'Placing Order...' 
                    : quantity > 0 
                      ? `Place Order - ৳${(item.price * quantity).toFixed(2)}`
                      : 'Enter Quantity to Continue'
                  }
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
