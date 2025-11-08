import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, Star, Phone } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import BottomNavigation from '@/components/BottomNavigation';
import { useTranslation } from 'react-i18next';

// Fix default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface VapeStore {
  id: string;
  name: string;
  address: string;
  phone?: string;
  rating: number;
  lat: number;
  lng: number;
  distance?: number;
  isPartner: boolean;
  hours?: string;
  type: 'vape_shop' | 'pharmacy';
}

const sampleStores: VapeStore[] = [
  {
    id: '1',
    name: 'Cloud Nine Vapes',
    address: '123 Main St, New York, NY 10001',
    phone: '(555) 123-4567',
    rating: 4.8,
    lat: 40.7489,
    lng: -73.9680,
    distance: 0.3,
    isPartner: true,
    hours: '9:00 AM - 10:00 PM',
    type: 'vape_shop'
  },
  {
    id: '2',
    name: 'Vapor Central',
    address: '456 Broadway, New York, NY 10013',
    phone: '(555) 234-5678',
    rating: 4.6,
    lat: 40.7189,
    lng: -74.0021,
    distance: 0.7,
    isPartner: true,
    hours: '10:00 AM - 9:00 PM',
    type: 'vape_shop'
  },
  {
    id: '3',
    name: 'Mist & Co',
    address: '789 5th Ave, New York, NY 10022',
    phone: '(555) 345-6789',
    rating: 4.3,
    lat: 40.7614,
    lng: -73.9776,
    distance: 1.2,
    isPartner: false,
    hours: '11:00 AM - 8:00 PM',
    type: 'pharmacy'
  },
  {
    id: '4',
    name: 'Vape Paradise',
    address: '321 Park Ave, New York, NY 10016',
    phone: '(555) 456-7890',
    rating: 4.9,
    lat: 40.7451,
    lng: -73.9776,
    distance: 1.8,
    isPartner: true,
    hours: '8:00 AM - 11:00 PM',
    type: 'vape_shop'
  }
];

export default function StoreLocator() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [stores] = useState<VapeStore[]>(sampleStores);
  const [selectedStore, setSelectedStore] = useState<VapeStore | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to New York if location access is denied
          setUserLocation([40.7128, -74.0060]);
        }
      );
    } else {
      // Default to New York
      setUserLocation([40.7128, -74.0060]);
    }
  }, []);

  const getDirections = (store: VapeStore) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.open(`https://maps.google.com/maps?daddr=${store.lat},${store.lng}`);
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`, '_blank');
    }
  };

  if (!userLocation) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 relative z-20"
      >
        <div className="flex items-center justify-between">
          <motion.div
            whileHover={{ 
              scale: 1.1,
              rotate: -5,
              boxShadow: "0 8px 25px rgba(236, 72, 153, 0.4)"
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-white hover:bg-white/20 p-2 rounded-full w-10 h-10"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          <h1 className="text-white text-lg font-semibold">Store Locator</h1>
          <MapPin className="w-6 h-6 text-white/80" />
        </div>
      </motion.div>

      {/* Map Container */}
      <div className="relative" style={{ height: 'calc(100vh - 300px)' }}>
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          <Marker position={userLocation}>
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-sm">📍 You are here</p>
              </div>
            </Popup>
          </Marker>

          {/* Store markers */}
          {stores.map((store) => (
            <Marker 
              key={store.id} 
              position={[store.lat, store.lng]}
              eventHandlers={{
                click: () => setSelectedStore(store)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm mb-1">{store.name}</h3>
                    {store.isPartner && (
                      <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                        Partner
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs font-medium">{store.rating}</span>
                    <span className="text-xs text-gray-500">• {store.distance} mi</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{store.address}</p>
                  {store.hours && (
                    <p className="text-xs text-gray-500 mb-2">⏰ {store.hours}</p>
                  )}
                  <Button
                    size="sm"
                    onClick={() => getDirections(store)}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white text-xs mt-2"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Get Directions
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Selected Store Card */}
        {selectedStore && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-2xl z-10 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <MapPin className="w-4 h-4 text-pink-500" />
                  <h3 className="text-black dark:text-white font-semibold">{selectedStore.name}</h3>
                  {selectedStore.isPartner && (
                    <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                      Partner
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 mb-2">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-black dark:text-white">{selectedStore.rating}</span>
                  <span className="text-sm text-gray-500">• {selectedStore.distance} mi away</span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedStore.address}</p>
                {selectedStore.phone && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedStore.phone}</p>
                  </div>
                )}
                {selectedStore.hours && (
                  <p className="text-gray-500 text-xs mt-1">⏰ {selectedStore.hours}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStore(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 h-auto"
              >
                ✕
              </Button>
            </div>
            <Button
              onClick={() => getDirections(selectedStore)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </motion.div>
        )}
      </div>

      {/* Store List */}
      <div className="px-6 py-4 bg-white dark:bg-black">
        <h2 className="text-black dark:text-white font-semibold mb-3">Nearby Locations ({stores.length})</h2>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {stores.map((store) => (
            <motion.div
              key={store.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedStore(store)}
              className="bg-gray-100 dark:bg-gray-900 rounded-xl p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
              data-testid={`store-item-${store.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <MapPin className="w-5 h-5 text-pink-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-black dark:text-white font-medium text-sm truncate">{store.name}</p>
                      {store.isPartner && (
                        <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                          Partner
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{store.rating} • {store.distance} mi</span>
                    </div>
                  </div>
                </div>
                <Navigation className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
