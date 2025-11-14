import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, Phone, Mail, Globe, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import BottomNavigation from '@/components/BottomNavigation';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

// Fix default marker icon issue in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BACKEND_URL = 'https://usv-qr-backend.replit.app';

interface StoreLocation {
  id: string;
  name: string;
  slug: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateRegion: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  contactEmail: string | null;
  contactPhone: string | null;
  websiteUrl: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

export default function StoreLocator() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStores = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/stores`);
      const result = await response.json();

      if (result.success && result.data) {
        const storesWithDistance = result.data.map((store: StoreLocation) => {
          if (userLocation) {
            const distance = calculateDistance(
              userLocation[0],
              userLocation[1],
              store.latitude,
              store.longitude
            );
            return { ...store, distance };
          }
          return store;
        });
        setStores(storesWithDistance.sort((a: StoreLocation, b: StoreLocation) => 
          (a.distance || 0) - (b.distance || 0)
        ));
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      toast({
        title: "Error loading stores",
        description: "Could not fetch store locations. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation([40.7128, -74.006]);
        }
      );
    } else {
      setUserLocation([40.7128, -74.006]);
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      fetchStores();
    }
  }, [userLocation]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStores();
  };

  const getDirections = (store: StoreLocation) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      window.open(`https://maps.google.com/maps?daddr=${store.latitude},${store.longitude}`);
    } else {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`, '_blank');
    }
  };

  const callStore = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const emailStore = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const openWebsite = (url: string) => {
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  const getFullAddress = (store: StoreLocation): string => {
    const parts = [
      store.addressLine1,
      store.addressLine2,
      store.city,
      store.stateRegion,
      store.postalCode,
      store.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (!userLocation || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading store locations...</p>
        </div>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-white hover:bg-white/20 p-2 rounded-full w-10 h-10"
            data-testid="button-refresh"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
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
              position={[store.latitude, store.longitude]}
              eventHandlers={{
                click: () => setSelectedStore(store)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm mb-1">{store.name}</h3>
                    <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                      USV Partner
                    </span>
                  </div>
                  {store.distance && (
                    <p className="text-xs text-gray-500 mb-2">📍 {store.distance} mi away</p>
                  )}
                  <p className="text-xs text-gray-600 mb-2">{getFullAddress(store)}</p>
                  {store.contactPhone && (
                    <p className="text-xs text-gray-600 mb-1">📞 {store.contactPhone}</p>
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
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    USV Partner
                  </span>
                </div>
                {selectedStore.distance && (
                  <p className="text-sm text-gray-500 mb-2">📍 {selectedStore.distance} mi away</p>
                )}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{getFullAddress(selectedStore)}</p>
                {selectedStore.contactPhone && (
                  <button
                    onClick={() => callStore(selectedStore.contactPhone!)}
                    className="flex items-center space-x-2 mt-1 text-pink-500 hover:text-pink-600"
                  >
                    <Phone className="w-3 h-3" />
                    <p className="text-sm">{selectedStore.contactPhone}</p>
                  </button>
                )}
                {selectedStore.contactEmail && (
                  <button
                    onClick={() => emailStore(selectedStore.contactEmail!)}
                    className="flex items-center space-x-2 mt-1 text-pink-500 hover:text-pink-600"
                  >
                    <Mail className="w-3 h-3" />
                    <p className="text-sm">{selectedStore.contactEmail}</p>
                  </button>
                )}
                {selectedStore.websiteUrl && (
                  <button
                    onClick={() => openWebsite(selectedStore.websiteUrl!)}
                    className="flex items-center space-x-2 mt-1 text-pink-500 hover:text-pink-600"
                  >
                    <Globe className="w-3 h-3" />
                    <p className="text-sm">Visit Website</p>
                  </button>
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
        <h2 className="text-black dark:text-white font-semibold mb-3">
          USV Partner Locations ({stores.length})
        </h2>
        {stores.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No store locations available yet</p>
            <Button
              onClick={handleRefresh}
              className="mt-4 bg-pink-500 hover:bg-pink-600 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : (
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
                        <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full flex-shrink-0">
                          Partner
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                        {store.city}, {store.stateRegion}
                        {store.distance && ` • ${store.distance} mi`}
                      </p>
                    </div>
                  </div>
                  <Navigation className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
