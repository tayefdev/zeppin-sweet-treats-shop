
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ItemForm from './ItemForm';
import ItemCard from './ItemCard';

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

interface ItemsManagementProps {
  items: BakeryItem[];
  isLoading: boolean;
}

const ItemsManagement: React.FC<ItemsManagementProps> = ({ items, isLoading }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<BakeryItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    description: '',
    image: '',
    category: 'cakes',
    is_on_sale: false,
    sale_percentage: ''
  });

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
        category: 'cakes',
        is_on_sale: false,
        sale_percentage: ''
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
          is_on_sale: item.is_on_sale,
          sale_percentage: item.sale_percentage,
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

    if (newItem.is_on_sale && (!newItem.sale_percentage || parseFloat(newItem.sale_percentage) <= 0)) {
      toast({
        title: "Invalid Sale Percentage",
        description: "Please enter a valid sale percentage.",
        variant: "destructive"
      });
      return;
    }

    const itemData = {
      name: newItem.name,
      price: parseFloat(newItem.price),
      description: newItem.description,
      image: newItem.image,
      category: newItem.category,
      is_on_sale: newItem.is_on_sale,
      sale_percentage: newItem.is_on_sale ? parseFloat(newItem.sale_percentage) : null
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
    <div className="space-y-6">
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

      {showAddForm && (
        <ItemForm
          item={newItem}
          onItemChange={setNewItem}
          onSubmit={handleAddItem}
          onCancel={() => setShowAddForm(false)}
          isLoading={addItemMutation.isPending}
          title="Add New Item"
          submitText="Add Item"
        />
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading items...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={setEditingItem}
              onDelete={handleDeleteItem}
              isDeleting={deleteItemMutation.isPending}
              isEditing={editItemMutation.isPending}
            />
          ))}
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ItemForm
              item={{
                name: editingItem.name,
                price: editingItem.price.toString(),
                description: editingItem.description,
                image: editingItem.image,
                category: editingItem.category,
                is_on_sale: editingItem.is_on_sale || false,
                sale_percentage: editingItem.sale_percentage?.toString() || ''
              }}
              onItemChange={(formData) => setEditingItem({
                ...editingItem,
                name: formData.name,
                price: parseFloat(formData.price) || 0,
                description: formData.description,
                image: formData.image,
                category: formData.category,
                is_on_sale: formData.is_on_sale,
                sale_percentage: formData.sale_percentage ? parseFloat(formData.sale_percentage) : undefined
              })}
              onSubmit={handleEditItem}
              onCancel={() => setEditingItem(null)}
              isLoading={editItemMutation.isPending}
              title="Edit Item"
              submitText="Save Changes"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsManagement;
