import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Home, Phone, Info, MapPin, Heart, Facebook, Instagram } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useCart } from '@/contexts/CartContext';
import CartModal from '@/components/CartModal';
import { useToast } from "@/hooks/use-toast";

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

const Index = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const { addToCart, getTotalItems } = useCart();
  const { toast } = useToast();

  // Fetch bakery items from Supabase
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['bakery-items'],
    queryFn: async () => {
      console.log('Fetching bakery items from Supabase...');
      const { data, error } = await supabase
        .from('bakery_items')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching bakery items:', error);
        throw error;
      }
      
      console.log('Fetched bakery items:', data);
      return data || [];
    }
  });

  const categories = ['All', ...new Set(items.map(item => item.category))];

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: BakeryItem) => {
    const finalPrice = item.is_on_sale && item.sale_percentage 
      ? item.price * (1 - item.sale_percentage / 100)
      : item.price;
    
    addToCart({
      id: item.id,
      name: item.name,
      price: finalPrice,
      image: item.image
    });
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart!`,
    });
  };

  const handleLocationClick = () => {
    const address = "HATIR POOL, DHAKA";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  };

  const handlePhoneClick = () => {
    window.open('tel:01304073314', '_self');
  };

  const handleHomeClick = () => {
    window.location.reload();
  };

  const scrollToMenu = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-rose-400 mx-auto mb-4"></div>
          <p className="text-lg text-rose-600">Loading delicious treats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600">Error loading bakery items. Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 via-rose-50 to-amber-50">
      {/* Top Banner */}
      <div className="bg-rose-300 text-center py-2 text-sm text-rose-800 flex items-center justify-center gap-4">
        <div>Check out our great new range in desserts</div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <button onClick={handlePhoneClick} className="hover:underline">
            01304073314
          </button>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <button onClick={handleLocationClick} className="hover:underline">
            HATIR POOL, DHAKA
          </button>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/6f30b366-0e3c-498f-a5ab-c9b2a19bac7a.png" 
                alt="Zeppin Bakery Logo" 
                className="h-20 w-20 object-contain"
              />
            </div>

            {/* Centered Navigation */}
            <nav className="flex items-center space-x-8">
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-rose-600 font-medium"
                onClick={handleHomeClick}
              >
                HOME
              </Button>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-rose-600 font-medium"
                onClick={scrollToMenu}
              >
                MENU
              </Button>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-rose-600 font-medium"
                onClick={() => setShowAbout(!showAbout)}
              >
                ABOUT US
              </Button>
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              <button onClick={handleLocationClick} className="hover:text-rose-600 transition-colors">
                <MapPin className="h-5 w-5 text-gray-600 hover:text-rose-600" />
              </button>
              <Heart className="h-5 w-5 text-gray-600" />
              <button 
                onClick={() => setIsCartModalOpen(true)}
                className="relative hover:text-rose-600 transition-colors"
              >
                <ShoppingCart className="h-5 w-5 text-gray-600 hover:text-rose-600" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* About Us Section */}
      {showAbout && (
        <section className="bg-white border-b py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-serif text-gray-800 mb-4 italic">About Us</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Welcome to Zeppin Bakery – your cozy neighborhood spot for fresh, handmade treats. 
                We bake daily with love, using only quality ingredients to bring you everything from 
                soft breads to custom cakes.
              </p>
              <Button
                variant="ghost"
                onClick={() => setShowAbout(false)}
                className="mt-4 text-rose-600 hover:text-rose-700"
              >
                Close
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-r from-rose-200 via-rose-100 to-amber-100">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-6xl font-serif text-gray-800 mb-6 italic leading-tight">
            Delight in<br />every bite!
          </h2>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            Discover fresh and artisanal desserts & sweets
          </p>
          <Button 
            className="bg-rose-400 hover:bg-rose-500 text-white px-8 py-3 rounded-full text-lg font-medium"
            onClick={scrollToMenu}
          >
            ORDER NOW
          </Button>
        </div>
      </section>

      {/* Signature Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h3 className="text-4xl font-serif text-center text-gray-800 mb-12 italic">Signature</h3>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Custom Cakes */}
            <div className="text-center">
              <div 
                className="aspect-square mb-4 rounded-lg overflow-hidden bg-rose-100 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => {
                  setSelectedCategory('Cakes');
                  scrollToMenu();
                }}
              >
                <img 
                  src="/lovable-uploads/7a8a873c-4e49-44ee-9063-a6667dc9c301.png" 
                  alt="Custom Cakes"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-xl font-serif text-gray-800 mb-2">Custom Cake</h4>
              <p className="text-gray-600 text-sm">Beautiful and delicious cakes for every occasion</p>
            </div>

            {/* Brownies */}
            <div className="text-center">
              <div 
                className="aspect-square mb-4 rounded-lg overflow-hidden bg-rose-100 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => {
                  setSelectedCategory('Dessert');
                  scrollToMenu();
                }}
              >
                <img 
                  src="/lovable-uploads/40b5c73f-9655-4801-ab66-33d8e09eebb5.png" 
                  alt="Brownies"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-xl font-serif text-gray-800 mb-2">Brownies</h4>
              <p className="text-gray-600 text-sm">Rich and fudgy chocolate brownies</p>
            </div>

            {/* Cupcake Collections */}
            <div className="text-center">
              <div 
                className="aspect-square mb-4 rounded-lg overflow-hidden bg-rose-100 cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => {
                  setSelectedCategory('Cupcake');
                  scrollToMenu();
                }}
              >
                <img 
                  src="/lovable-uploads/54b7ffd4-f04c-42e2-9fe6-e610d1ab5050.png" 
                  alt="Cupcake Collections"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="text-xl font-serif text-gray-800 mb-2">Cupcake Collections</h4>
              <p className="text-gray-600 text-sm">Gourmet cupcakes for every craving</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-rose-50">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-6 py-2 ${
                  selectedCategory === category 
                    ? "bg-rose-400 text-white hover:bg-rose-500" 
                    : "border-rose-300 text-rose-700 hover:bg-rose-100"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredItems.map((item) => {
              const finalPrice = item.is_on_sale && item.sale_percentage 
                ? item.price * (1 - item.sale_percentage / 100)
                : item.price;
              const discountedPrice = item.price * 0.93; // 7% off for 7.7 sale
              
              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white relative">
                  {item.is_on_sale && item.sale_percentage && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold z-10">
                      {item.sale_percentage}% OFF
                    </div>
                  )}
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl text-gray-800 flex items-center justify-between font-serif">
                      {item.name}
                      <div className="flex flex-col items-end">
                        {item.is_on_sale && item.sale_percentage ? (
                          <>
                            <span className="text-sm text-gray-500 line-through">৳{item.price}</span>
                            <span className="text-lg font-bold text-red-600">৳{finalPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-gray-500 line-through">৳{item.price}</span>
                            <span className="text-lg font-bold text-rose-600">৳{discountedPrice.toFixed(2)}</span>
                            <span className="text-xs text-green-600">7.7 Sale - 7% OFF</span>
                          </>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="space-y-2">
                    <div className="flex gap-2 w-full">
                      <Button 
                        className="flex-1 bg-rose-400 hover:bg-rose-500 text-white font-semibold py-2 rounded-full"
                        onClick={() => navigate(`/order/${item.id}`)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Order Now
                      </Button>
                      <Button 
                        className="flex-1 bg-rose-400 hover:bg-rose-500 text-white font-semibold py-2 rounded-full"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {filteredItems.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Holiday Collection Section */}
      <section className="py-16 bg-gradient-to-r from-rose-200 to-amber-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex-1">
              <img 
                src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Holiday Cake"
                className="w-full max-w-md mx-auto"
              />
            </div>
            <div className="flex-1 text-center">
              <h3 className="text-4xl font-serif text-gray-800 mb-6 italic">7.7 Sale</h3>
              <div className="bg-white p-6 rounded-lg shadow-lg inline-block mb-6">
                <span className="text-3xl font-bold text-rose-600">7% OFF</span>
                <p className="text-sm text-gray-600 mt-2">On all purchases!</p>
              </div>
              <div>
                <Button 
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full text-lg font-medium"
                  onClick={scrollToMenu}
                >
                  ORDER TODAY
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-8 mb-6">
            <div className="text-center">
              <button
                onClick={() => window.open('https://www.facebook.com/zeppin.bakery.bd', '_blank')}
                className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-2 mx-auto hover:bg-rose-200 transition-colors hover:scale-105"
              >
                <Facebook className="h-5 w-5 text-rose-600" />
              </button>
              <p className="text-xs text-gray-600">FACEBOOK</p>
              <p className="text-xs text-gray-500">Follow us</p>
            </div>
            <div className="text-center">
              <button
                onClick={() => window.open('https://www.instagram.com/zeppin.cakes/', '_blank')}
                className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-2 mx-auto hover:bg-rose-200 transition-colors hover:scale-105"
              >
                <Instagram className="h-5 w-5 text-rose-600" />
              </button>
              <p className="text-xs text-gray-600">INSTAGRAM</p>
              <p className="text-xs text-gray-500">Follow us</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-rose-600 font-bold">B</span>
              </div>
              <p className="text-xs text-gray-600">BKASH</p>
              <p className="text-xs text-gray-500">01763663279</p>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm space-y-2">
            <div className="flex justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <button onClick={handlePhoneClick} className="hover:underline">
                  01304073314
                </button>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <button onClick={handleLocationClick} className="hover:underline">
                  HATIR POOL, DHAKA
                </button>
              </div>
            </div>
            <div>© 2024 Zeppin Bakery. Made with ❤️ and lots of flour!</div>
          </div>
        </div>
      </footer>

      {/* Cart Modal */}
      <CartModal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} />
    </div>
  );
};

export default Index;
