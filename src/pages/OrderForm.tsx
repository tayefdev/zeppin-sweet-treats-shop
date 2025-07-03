
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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
  const [item, setItem] = useState<BakeryItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    const savedItems = localStorage.getItem('bakeryItems');
    if (savedItems) {
      const items: BakeryItem[] = JSON.parse(savedItems);
      const foundItem = items.find(i => i.id === itemId);
      setItem(foundItem || null);
    }
  }, [itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;

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
      item: item.name,
      quantity,
      price: item.price,
      total: (item.price * quantity).toFixed(2),
      customer: customerInfo,
      orderDate: new Date().toISOString(),
      orderId: `ORDER-${Date.now()}`
    };

    // Save order to localStorage (for admin to view)
    const existingOrders = JSON.parse(localStorage.getItem('bakeryOrders') || '[]');
    existingOrders.push(orderData);
    localStorage.setItem('bakeryOrders', JSON.stringify(existingOrders));

    // Simulate email sending (in a real app, this would be handled by a backend)
    console.log('Order details for email:', orderData);
    
    toast({
      title: "Order Placed Successfully! 🎉",
      description: `Your order for ${quantity}x ${item.name} has been received. We'll contact you soon!`,
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
  };

  if (!item) {
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
              <p className="text-2xl font-bold text-pink-600">${item.price}</p>
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
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                </div>

                <div className="bg-pink-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-800">
                    Total: ${(item.price * quantity).toFixed(2)}
                  </p>
                </div>

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
                    placeholder="(555) 123-4567"
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
                    placeholder="123 Main Street, City, State, ZIP"
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
                >
                  Place Order - ${(item.price * quantity).toFixed(2)}
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
