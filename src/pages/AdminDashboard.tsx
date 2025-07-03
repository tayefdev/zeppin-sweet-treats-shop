
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus, Edit2, Trash2, ShoppingCart, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface BakeryItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface Order {
  orderId: string;
  item: string;
  quantity: number;
  total: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
  };
  orderDate: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<BakeryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingItem, setEditingItem] = useState<BakeryItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
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

    // Load items and orders
    loadItems();
    loadOrders();
  }, [navigate]);

  const loadItems = () => {
    const savedItems = localStorage.getItem('bakeryItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  };

  const loadOrders = () => {
    const savedOrders = localStorage.getItem('bakeryOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  };

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

    const item: BakeryItem = {
      id: Date.now().toString(),
      name: newItem.name,
      price: parseFloat(newItem.price),
      description: newItem.description,
      image: newItem.image,
      category: newItem.category
    };

    const updatedItems = [...items, item];
    setItems(updatedItems);
    localStorage.setItem('bakeryItems', JSON.stringify(updatedItems));

    setNewItem({
      name: '',
      price: '',
      description: '',
      image: '',
      category: 'Cakes'
    });
    setShowAddForm(false);

    toast({
      title: "Item Added",
      description: "New bakery item has been added successfully!",
    });
  };

  const handleEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingItem) return;

    const updatedItems = items.map(item => 
      item.id === editingItem.id ? editingItem : item
    );
    setItems(updatedItems);
    localStorage.setItem('bakeryItems', JSON.stringify(updatedItems));
    setEditingItem(null);

    toast({
      title: "Item Updated",
      description: "Bakery item has been updated successfully!",
    });
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    localStorage.setItem('bakeryItems', JSON.stringify(updatedItems));

    toast({
      title: "Item Deleted",
      description: "Bakery item has been deleted.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your bakery items and orders</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="items" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items">Manage Items</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
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
                        <Label htmlFor="price">Price ($)</Label>
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

                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        value={newItem.image}
                        onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Add Item
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
                        <p className="font-bold text-pink-600">${item.price}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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
                          <Label htmlFor="edit-price">Price ($)</Label>
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

                      <div>
                        <Label htmlFor="edit-image">Image URL</Label>
                        <Input
                          id="edit-image"
                          value={editingItem.image}
                          onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                          Save Changes
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
            
            {orders.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders yet!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.orderId} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">Order #{order.orderId}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                          ${order.total}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Order Details</h4>
                          <p className="text-sm text-gray-600">
                            <strong>Item:</strong> {order.item}<br />
                            <strong>Quantity:</strong> {order.quantity}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Customer Information</h4>
                          <p className="text-sm text-gray-600">
                            <strong>Name:</strong> {order.customer.name}<br />
                            <strong>Email:</strong> {order.customer.email}<br />
                            <strong>Phone:</strong> {order.customer.phone}<br />
                            <strong>Address:</strong> {order.customer.address}
                            {order.customer.notes && (
                              <>
                                <br />
                                <strong>Notes:</strong> {order.customer.notes}
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
