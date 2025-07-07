
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, Trash2, Tag } from 'lucide-react';

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

interface ItemCardProps {
  item: BakeryItem;
  onEdit: (item: BakeryItem) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  isEditing: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  isDeleting,
  isEditing
}) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              {item.is_on_sale && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {item.sale_percentage}% OFF
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
            <div className="flex items-center gap-2">
              <p className="font-bold text-pink-600">৳{item.price}</p>
              {item.is_on_sale && item.sale_percentage && (
                <p className="text-sm text-green-600">
                  Sale Price: ৳{(item.price * (1 - item.sale_percentage / 100)).toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(item)}
              disabled={isEditing}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(item.id)}
              className="text-red-600 border-red-300 hover:bg-red-50"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
