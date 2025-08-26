import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Phone, Star, Navigation, Search } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface VapeStore {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating: number;
  distance?: number;
  isPartner: boolean;
  hours?: string;
}

const sampleStores: VapeStore[] = [
  {
    id: '1',
    name: 'Cloud Nine Vapes',
    address: '123 Main St, New York, NY 10001',
    phone: '(555) 123-4567',
    rating: 4.8,
    distance: 0.3,
    isPartner: true,
    hours: '9:00 AM - 10:00 PM'
  },
  {
    id: '2',
    name: 'Vapor Central',
    address: '456 Broadway, New York, NY 10013',
    phone: '(555) 234-5678',
    rating: 4.6,
    distance: 0.7,
    isPartner: true,
    hours: '10:00 AM - 9:00 PM'
  },
  {
    id: '3',
    name: 'Mist & Co',
    address: '789 5th Ave, New York, NY 10022',
    phone: '(555) 345-6789',
    rating: 4.3,
    distance: 1.2,
    isPartner: false,
    hours: '11:00 AM - 8:00 PM'
  },
  {
    id: '4',
    name: 'Vape Paradise',
    address: '321 Park Ave, New York, NY 10016',
    phone: '(555) 456-7890',
    rating: 4.9,
    distance: 1.8,
    isPartner: true,
    hours: '8:00 AM - 11:00 PM'
  }
];

export default function StoreLocator() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [stores, setStores] = useState<VapeStore[]>(sampleStores);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location Found",
            description: "Found nearby vape stores",
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            title: "Location Access Denied",
            description: "Using default location for store search",
            variant: "destructive",
          });
        }
      );
    }
  }, [toast]);

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use native maps app on mobile
      window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`);
    } else {
      // Use Google Maps on desktop
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
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
        <h1 className="text-white text-xl font-semibold">Store Locator</h1>
        <MapPin className="w-6 h-6 text-purple-400" />
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
            placeholder="Search stores or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white rounded-2xl h-12 pl-12 backdrop-blur"
            data-testid="input-search-stores"
          />
        </div>
      </motion.div>

      {/* Store List */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 space-y-4"
      >
        {filteredStores.map((store, index) => (
          <motion.div
            key={store.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700/30"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-white font-semibold text-lg">{store.name}</h3>
                  {store.isPartner && (
                    <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                      Partner
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white font-medium">{store.rating}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{store.distance} mi away</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{store.address}</p>
              </div>
              
              {store.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">{store.phone}</p>
                </div>
              )}
              
              {store.hours && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <p className="text-gray-300 text-sm">{store.hours}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => getDirections(store.address)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-10"
                data-testid={`button-directions-${store.id}`}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Directions
              </Button>
              
              <Button
                onClick={() => {
                  toast({
                    title: "Store Info",
                    description: `${store.name} - ${store.isPartner ? 'USV Partner Store' : 'Regular Store'}`,
                  });
                }}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 rounded-2xl h-10"
                data-testid={`button-info-${store.id}`}
              >
                Info
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredStores.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <MapPin className="w-16 h-16 text-gray-600 mb-4" />
          <p className="text-gray-400 text-center">No stores found matching your search</p>
        </motion.div>
      )}
    </div>
  );
}