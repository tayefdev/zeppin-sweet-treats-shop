import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Edit2, Trash2, ShoppingCart, Bell } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ImageUpload from "@/components/ImageUpload";
import WebhookTester from '@/components/WebhookTester';

interface BakeryItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
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
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<BakeryItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [hasViewedOrders, setHasViewedOrders] = useState(false);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: 'Cakes'
  });

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
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
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

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      console.log('Adding new bakery item:', itemData);
      const { data, error } = await supabase
        .from('bakery_items')
        .insert([itemData])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding bakery item:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bakery-items'] });
      queryClient.invalidateQueries({ queryKey: ['bakery-items'] });
      toast({
        title: "Item Added",
        description: "New bakery item has been added successfully!",
      });
      setNewItem({
        name: '',
        price: '',
        description: '',
        image: '',
        category: 'Cakes'
      });
      setShowAddForm(false);
    },
    onError: (error) => {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add bakery item. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Edit item mutation
  const editItemMutation = useMutation({
    mutationFn: async (item: BakeryItem) => {
      console.log('Updating bakery item:', item);
      const { data, error } = await supabase
        .from('bakery_items')
        .update({
          name: item.name,
          price: item.price,
          description: item.description,
          image: item.image,
          category: item.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating bakery item:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bakery-items'] });
      queryClient.invalidateQueries({ queryKey: ['bakery-items'] });
      toast({
        title: "Item Updated",
        description: "Bakery item has been updated successfully!",
      });
      setEditingItem(null);
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update bakery item. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting bakery item:', id);
      const { error } = await supabase
        .from('bakery_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting bakery item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bakery-items'] });
      queryClient.invalidateQueries({ queryKey: ['bakery-items'] });
      toast({
        title: "Item Deleted",
        description: "Bakery item has been deleted.",
      });
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete bakery item. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    navigate('/admin');
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newItem.name || !newItem.price || !newItem.description || !newItem.image) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const itemData = {
      name: newItem.name,
      price: parseFloat(newItem.price),
      description: newItem.description,
      image: newItem.image,
      category: newItem.category
    };

    addItemMutation.mutate(itemData);
  };

  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;
    editItemMutation.mutate(editingItem);
  };

  const handleDeleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="text-pink-600 border-pink-600 hover:bg-pink-50"
          >
            Back to Website
          </Button>
        </div>

        <WebhookTester />

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Manage Items</TabsTrigger>
            <TabsTrigger value="orders" onClick={handleOrdersTabClick} className="relative">
              Order History
              {newOrdersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {newOrdersCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Items Management */}
          <TabsContent value="items" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Bakery Items</h2>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </div>

            {/* Add Item Form */}
            {showAddForm && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Add New Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Item Name</Label>
                        <Input
                          id="name"
                          value={newItem.name}
                          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                          placeholder="e.g., Chocolate Cake"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price (৳)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={newItem.price}
                          onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cakes">Cakes</SelectItem>
                          <SelectItem value="Cookies">Cookies</SelectItem>
                          <SelectItem value="Pastries">Pastries</SelectItem>
                          <SelectItem value="Cupcakes">Cupcakes</SelectItem>
                          <SelectItem value="Breads">Breads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        placeholder="Describe the item..."
                        required
                      />
                    </div>

                    <ImageUpload
                      value={newItem.image}
                      onChange={(url) => setNewItem({...newItem, image: url})}
                      label="Item Image"
                    />

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700"
                        disabled={addItemMutation.isPending}
                      >
                        {addItemMutation.isPending ? 'Adding...' : 'Add Item'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Items List */}
            {itemsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading items...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                          <p className="font-bold text-pink-600">৳{item.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingItem(item)}
                            disabled={editItemMutation.isPending}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            disabled={deleteItemMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Edit Item Modal */}
            {editingItem && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-2xl bg-white">
                  <CardHeader>
                    <CardTitle>Edit Item</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleEditItem} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-name">Item Name</Label>
                          <Input
                            id="edit-name"
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-price">Price (৳)</Label>
                          <Input
                            id="edit-price"
                            type="number"
                            step="0.01"
                            value={editingItem.price}
                            onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="edit-category">Category</Label>
                        <Select 
                          value={editingItem.category} 
                          onValueChange={(value) => setEditingItem({...editingItem, category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cakes">Cakes</SelectItem>
                            <SelectItem value="Cookies">Cookies</SelectItem>
                            <SelectItem value="Pastries">Pastries</SelectItem>
                            <SelectItem value="Cupcakes">Cupcakes</SelectItem>
                            <SelectItem value="Breads">Breads</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                          id="edit-description"
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                          required
                        />
                      </div>

                      <ImageUpload
                        value={editingItem.image}
                        onChange={(url) => setEditingItem({...editingItem, image: url})}
                        label="Item Image"
                      />

                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          className="bg-green-600 hover:bg-green-700"
                          disabled={editItemMutation.isPending}
                        >
                          {editItemMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Order History</h2>
            
            {ordersLoading ? (
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
                  <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
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
                        {/* Item Image */}
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
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
