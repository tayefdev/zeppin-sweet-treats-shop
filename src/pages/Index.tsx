
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Cake } from 'lucide-react';

interface BakeryItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

const Index = () => {
  const [items, setItems] = useState<BakeryItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load items from localStorage or use default items
    const savedItems = localStorage.getItem('bakeryItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      const defaultItems: BakeryItem[] = [
        {
          id: '1',
          name: 'Strawberry Dream Cake',
          price: 25.99,
          description: 'Fluffy vanilla sponge layered with fresh strawberries and whipped cream',
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop&crop=center',
          category: 'Cakes'
        },
        {
          id: '2',
          name: 'Chocolate Chip Cookies',
          price: 12.99,
          description: 'Warm, gooey cookies packed with premium chocolate chips (dozen)',
          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop&crop=center',
          category: 'Cookies'
        },
        {
          id: '3',
          name: 'Blueberry Muffins',
          price: 8.99,
          description: 'Fresh-baked muffins bursting with juicy blueberries (pack of 6)',
          image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop&crop=center',
          category: 'Pastries'
        },
        {
          id: '4',
          name: 'Rainbow Cupcakes',
          price: 18.99,
          description: 'Colorful vanilla cupcakes with rainbow buttercream frosting (set of 12)',
          image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=300&fit=crop&crop=center',
          category: 'Cupcakes'
        },
        {
          id: '5',
          name: 'Apple Cinnamon Danish',
          price: 6.99,
          description: 'Flaky pastry filled with spiced apples and topped with glaze',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop&crop=center',
          category: 'Pastries'
        },
        {
          id: '6',
          name: 'Red Velvet Cake',
          price: 28.99,
          description: 'Rich red velvet layers with cream cheese frosting',
          image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400&h=300&fit=crop&crop=center',
          category: 'Cakes'
        }
      ];
      setItems(defaultItems);
      localStorage.setItem('bakeryItems', JSON.stringify(defaultItems));
    }
  }, []);

  const categories = ['All', ...new Set(items.map(item => item.category))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-400 to-orange-400 p-3 rounded-full">
                <Cake className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                Zeppin Bakery
              </h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin')}
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Admin
            </Button>
          </div>
          <p className="text-gray-600 mt-2 text-lg">Freshly baked with love, every day! 🧁</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full ${
                selectedCategory === category 
                  ? "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600" 
                  : "border-pink-200 text-pink-600 hover:bg-pink-50"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md bg-white/80 backdrop-blur-sm">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-gray-800 flex items-center justify-between">
                  {item.name}
                  <span className="text-lg font-bold text-pink-600">
                    ${item.price}
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold py-2 rounded-full"
                  onClick={() => navigate(`/order/${item.id}`)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Order Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found in this category.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">© 2024 Zeppin Bakery. Made with ❤️ and lots of flour!</p>
          <p className="text-gray-500 text-sm mt-2">Fresh ingredients • Daily baking • Sweet memories</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
