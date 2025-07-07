
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tag } from 'lucide-react';
import ImageUpload from "@/components/ImageUpload";

interface ItemFormData {
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
  is_on_sale: boolean;
  sale_percentage: string;
}

interface ItemFormProps {
  item: ItemFormData;
  onItemChange: (item: ItemFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
  title: string;
  submitText: string;
}

const ItemForm: React.FC<ItemFormProps> = ({
  item,
  onItemChange,
  onSubmit,
  onCancel,
  isLoading,
  title,
  submitText
}) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={item.name}
                onChange={(e) => onItemChange({...item, name: e.target.value})}
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
                value={item.price}
                onChange={(e) => onItemChange({...item, price: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={item.category} onValueChange={(value) => onItemChange({...item, category: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cakes">Cakes</SelectItem>
                <SelectItem value="cupcakes">Cupcakes</SelectItem>
                <SelectItem value="swissrolls">Swiss Rolls</SelectItem>
                <SelectItem value="cookies">Cookies</SelectItem>
                <SelectItem value="desserts">Desserts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={item.description}
              onChange={(e) => onItemChange({...item, description: e.target.value})}
              placeholder="Describe the item..."
              required
            />
          </div>

          <ImageUpload
            value={item.image}
            onChange={(url) => onItemChange({...item, image: url})}
            label="Item Image"
          />

          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="sale-toggle"
                checked={item.is_on_sale}
                onCheckedChange={(checked) => onItemChange({...item, is_on_sale: checked})}
              />
              <Label htmlFor="sale-toggle" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Put Item on Sale
              </Label>
            </div>
            
            {item.is_on_sale && (
              <div>
                <Label htmlFor="sale-percentage">Sale Percentage (%)</Label>
                <Input
                  id="sale-percentage"
                  type="number"
                  min="1"
                  max="99"
                  value={item.sale_percentage}
                  onChange={(e) => onItemChange({...item, sale_percentage: e.target.value})}
                  placeholder="e.g., 25"
                  required={item.is_on_sale}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : submitText}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ItemForm;
