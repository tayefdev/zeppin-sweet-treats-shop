import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GlobalSale {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

const GlobalSalesManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSale, setEditingSale] = useState<GlobalSale | null>(null);
  const [newSale, setNewSale] = useState({
    name: '',
    description: '',
    discount_percentage: '',
    start_date: '',
    end_date: ''
  });

  // Fetch global sales
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['global-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('global_sales')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Add sale mutation
  const addSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const { data, error } = await supabase
        .from('global_sales')
        .insert([saleData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-sales'] });
      toast({
        title: "Sale Created",
        description: "Global sale event has been created successfully!",
      });
      setNewSale({
        name: '',
        description: '',
        discount_percentage: '',
        start_date: '',
        end_date: ''
      });
      setShowAddForm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create sale. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update sale mutation
  const updateSaleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('global_sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-sales'] });
      toast({
        title: "Sale Updated",
        description: "Global sale has been updated successfully!",
      });
      setEditingSale(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update sale. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete sale mutation
  const deleteSaleMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('global_sales')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-sales'] });
      toast({
        title: "Sale Deleted",
        description: "Global sale has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete sale. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Toggle sale active status
  const toggleSaleStatus = (sale: GlobalSale) => {
    updateSaleMutation.mutate({
      id: sale.id,
      updates: { is_active: !sale.is_active }
    });
  };

  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSale.name || !newSale.discount_percentage) {
      toast({
        title: "Missing Information",
        description: "Please fill in sale name and discount percentage.",
        variant: "destructive"
      });
      return;
    }

    const saleData = {
      name: newSale.name,
      description: newSale.description,
      discount_percentage: parseFloat(newSale.discount_percentage),
      start_date: newSale.start_date || null,
      end_date: newSale.end_date || null,
      is_active: false
    };

    addSaleMutation.mutate(saleData);
  };

  const activeSale = sales.find(sale => sale.is_active);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Global Sales Events</h2>
          <p className="text-gray-600">Manage site-wide sales that apply to all products</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Sale
        </Button>
      </div>

      {/* Active Sale Banner */}
      {activeSale && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800">Active Sale</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {activeSale.discount_percentage}% OFF
                </Badge>
              </div>
              <Switch
                checked={true}
                onCheckedChange={() => toggleSaleStatus(activeSale)}
              />
            </div>
            <CardDescription className="text-green-700">
              <strong>{activeSale.name}</strong> - {activeSale.description}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Add New Sale Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Sale Event</CardTitle>
            <CardDescription>Create a new global sale that applies to all products</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSale} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sale-name">Sale Name *</Label>
                  <Input
                    id="sale-name"
                    value={newSale.name}
                    onChange={(e) => setNewSale({ ...newSale, name: e.target.value })}
                    placeholder="e.g., 7.7 Flash Sale"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="discount">Discount Percentage * (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="1"
                    max="100"
                    value={newSale.discount_percentage}
                    onChange={(e) => setNewSale({ ...newSale, discount_percentage: e.target.value })}
                    placeholder="20"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSale.description}
                  onChange={(e) => setNewSale({ ...newSale, description: e.target.value })}
                  placeholder="Describe your sale event..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date (Optional)</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={newSale.start_date}
                    onChange={(e) => setNewSale({ ...newSale, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={newSale.end_date}
                    onChange={(e) => setNewSale({ ...newSale, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={addSaleMutation.isPending}>
                  {addSaleMutation.isPending ? "Creating..." : "Create Sale"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sales List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading sales...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sales.map((sale) => (
            <Card key={sale.id} className={sale.is_active ? "border-green-200" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{sale.name}</h3>
                      <Badge variant={sale.is_active ? "default" : "secondary"}>
                        {sale.discount_percentage}% OFF
                      </Badge>
                      {sale.is_active && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      )}
                    </div>
                    {sale.description && (
                      <p className="text-gray-600 mb-2">{sale.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Created: {new Date(sale.created_at).toLocaleDateString()}</span>
                      {sale.start_date && (
                        <span>Starts: {new Date(sale.start_date).toLocaleDateString()}</span>
                      )}
                      {sale.end_date && (
                        <span>Ends: {new Date(sale.end_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={sale.is_active}
                      onCheckedChange={() => toggleSaleStatus(sale)}
                      disabled={updateSaleMutation.isPending}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSaleMutation.mutate(sale.id)}
                      disabled={deleteSaleMutation.isPending}
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

      {sales.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales events yet</h3>
            <p className="text-gray-600 mb-4">Create your first global sale event to boost sales across all products.</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Sale
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSalesManagement;