import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, ShoppingCart, Star } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'pods' | 'devices' | 'accessories' | 'ejuice';
  image: string;
  inStock: boolean;
  tokenReward: number;
  rating: number;
  features?: string[];
}

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Ultra Smooth Pod Pro',
    description: 'Premium vape pod with enhanced flavor delivery',
    price: 24.99,
    category: 'pods',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=300&fit=crop',
    inStock: true,
    tokenReward: 50,
    rating: 4.8,
    features: ['2ml capacity', 'Leak-proof', 'Premium coils']
  },
  {
    id: '2',
    name: 'Crystal Clear Device',
    description: 'Next-generation vaping device with smart features',
    price: 89.99,
    category: 'devices',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&h=300&fit=crop',
    inStock: true,
    tokenReward: 200,
    rating: 4.9,
    features: ['USB-C charging', 'LED display', 'Temperature control']
  },
  {
    id: '3',
    name: 'Premium Carrying Case',
    description: 'Protective case for your vaping essentials',
    price: 19.99,
    category: 'accessories',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    inStock: true,
    tokenReward: 25,
    rating: 4.5,
    features: ['Shock-resistant', 'Multiple compartments', 'Travel-friendly']
  },
  {
    id: '4',
    name: 'Tropical Fusion E-Juice',
    description: 'Exotic tropical blend with smooth finish',
    price: 14.99,
    category: 'ejuice',
    image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=300&h=300&fit=crop',
    inStock: true,
    tokenReward: 30,
    rating: 4.7,
    features: ['60ml bottle', '70/30 VG/PG', 'Multiple nicotine levels']
  }
];

const categories = [
  { id: 'all', name: 'All Products', count: sampleProducts.length },
  { id: 'pods', name: 'Pods', count: sampleProducts.filter(p => p.category === 'pods').length },
  { id: 'devices', name: 'Devices', count: sampleProducts.filter(p => p.category === 'devices').length },
  { id: 'accessories', name: 'Accessories', count: sampleProducts.filter(p => p.category === 'accessories').length },
  { id: 'ejuice', name: 'E-Juice', count: sampleProducts.filter(p => p.category === 'ejuice').length },
];

export default function ProductCatalog() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products] = useState<Product[]>(sampleProducts);
  const { toast } = useToast();

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    toast({
      title: "Added to Cart",
      description: `${product.name} added to your cart. Earn ${product.tokenReward} USV tokens!`,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pods': return 'bg-blue-600';
      case 'devices': return 'bg-purple-600';
      case 'accessories': return 'bg-green-600';
      case 'ejuice': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-4 flex items-center justify-between"
      >
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer" 
          onClick={() => setLocation('/')}
        />
        <h1 className="text-white text-xl font-semibold">Product Catalog</h1>
        <Filter className="w-6 h-6 text-purple-400" />
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white rounded-2xl h-12 pl-12 backdrop-blur"
            data-testid="input-search-products"
          />
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-6"
      >
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className={`whitespace-nowrap rounded-2xl ${
                selectedCategory === category.id
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800'
              }`}
              data-testid={`filter-${category.id}`}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Product Grid */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-6 grid grid-cols-2 gap-4"
      >
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur rounded-3xl p-4 border border-gray-700/30"
          >
            <div className="relative mb-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-32 object-cover rounded-2xl"
              />
              <Badge className={`absolute top-2 left-2 ${getCategoryColor(product.category)} text-white text-xs`}>
                {product.category}
              </Badge>
              {!product.inStock && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-semibold">Out of Stock</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-semibold text-sm leading-tight">{product.name}</h3>
              <p className="text-gray-400 text-xs line-clamp-2">{product.description}</p>
              
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs font-medium">{product.rating}</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">${product.price}</p>
                  <p className="text-purple-400 text-xs">+{product.tokenReward} USV</p>
                </div>
                
                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-2 h-8 w-8"
                  data-testid={`add-to-cart-${product.id}`}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <Search className="w-16 h-16 text-gray-600 mb-4" />
          <p className="text-gray-400 text-center">No products found matching your search</p>
        </motion.div>
      )}
    </div>
  );
}