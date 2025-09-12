import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/BottomNavigation';
import { realTimePriceService, AllPricesResponse } from '@/lib/realTimePrices';
import PriceUpdateIndicator from '@/components/PriceUpdateIndicator';
import { useAuth } from '@/lib/auth';
// Keep original Solana logo
const solanaLogoSrc = '/solana-logo.png';
// New USV Logo
import usvLogoSrc from '@assets/image_1757431326277.png';

// Real-time chart data that updates based on actual prices
const generateRealtimeData = (currentPrice: number) => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: currentPrice + Math.sin(i * 0.3) * (currentPrice * 0.02) + Math.random() * (currentPrice * 0.01) - (currentPrice * 0.005)
  }));
};

const generateSolanaData = (currentPrice: number) => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: currentPrice + Math.cos(i * 0.4) * (currentPrice * 0.02) + Math.random() * (currentPrice * 0.01) - (currentPrice * 0.005)
  }));
};

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [chartData, setChartData] = useState(generateRealtimeData(0.20));
  const [solanaChartData, setSolanaChartData] = useState(generateSolanaData(200));
  const [prices, setPrices] = useState<AllPricesResponse | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Setup real-time price updates
  useEffect(() => {
    // Subscribe to real-time price updates
    const unsubscribe = realTimePriceService.subscribe((newPrices) => {
      setPrices(newPrices);
      setLastUpdated(new Date().toLocaleTimeString());
      setIsLoadingPrices(false);
      console.log('💰 Real-time prices updated:', newPrices);
    });

    // Start the real-time price service
    realTimePriceService.startRealTimeUpdates(8000); // Update every 8 seconds

    // Update charts when prices change
    const chartInterval = setInterval(() => {
      if (prices?.USV?.price) {
        setChartData(generateRealtimeData(prices.USV.price));
      }
      if (prices?.SOL?.price) {
        setSolanaChartData(generateSolanaData(prices.SOL.price));
      }
    }, 5000);

    return () => {
      unsubscribe();
      realTimePriceService.stopRealTimeUpdates();
      clearInterval(chartInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black relative pb-20">
      <BottomNavigation />
      
      

      {/* Header with Profile */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-cyan-400/30">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user?.fullName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{user?.fullName?.charAt(0) || 'U'}</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-white/90 text-sm">Welcome back,</p>
              <p className="text-white font-semibold text-base">{user?.fullName?.split(' ')[0] || 'Amanda'}</p>
            </div>
          </div>
          <div 
            className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center cursor-pointer"
            onClick={() => setLocation('/settings')}
          >
            <MoreHorizontal className="w-5 h-5 text-white" />
          </div>
        </div>

      </motion.div>

      {/* Main Balance */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 pb-6"
      >
        <div className="text-center">
          <h1 className="text-white text-5xl font-bold mb-3">
            ${user?.balance?.toFixed(2) || '0.00'}
          </h1>
          <div className="flex items-center justify-center space-x-6">
            {prices?.USV && (
              <div className="flex items-center space-x-1">
                <div className={`text-sm ${prices.USV.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {prices.USV.changePercent24h >= 0 ? '↗' : '↘'}
                </div>
                <span className={`text-sm font-medium ${prices.USV.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {prices.USV.changePercent24h >= 0 ? '+' : ''}{prices.USV.changePercent24h.toFixed(1)}%
                </span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-white/20 rounded-md flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
              </div>
              <span className="text-white/80 text-sm">
                {user?.balance ? (user.balance / (prices?.USV?.price || 0.20)).toFixed(5) : '0.00000'} USV
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Asset Cards */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-6"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* USV Token Card */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/wallet')}
            className="bg-black/40 backdrop-blur-sm rounded-3xl p-5 cursor-pointer border border-purple-500/20"
          >
            <div className="flex items-center space-x-2 mb-3">
              <img src="/usv-logo.png" alt="USV" className="w-8 h-8 object-contain" />
              <div className="flex-1">
                <p className="text-white text-xs font-medium">Ultra Smooth Vape</p>
                <p className="text-white/60 text-xs">USV</p>
              </div>
            </div>
            
            {/* Real-time Chart */}
            <div className="h-12 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#fff" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/60 text-xs">Price • {lastUpdated}</p>
                <p className="text-white font-bold text-sm">
                  ${prices?.USV?.price?.toFixed(3) || '0.200'}
                  {isLoadingPrices && <span className="text-xs text-yellow-400 ml-1 animate-spin">⟳</span>}
                </p>
              </div>
              <span className={`text-xs font-medium ${
                (prices?.USV?.changePercent24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(prices?.USV?.changePercent24h || 0) >= 0 ? '+' : ''}{(prices?.USV?.changePercent24h || 0).toFixed(1)}%
              </span>
            </div>
          </motion.div>

          {/* Solana Card */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="bg-black/40 backdrop-blur-sm rounded-3xl p-5 cursor-pointer border border-blue-500/20"
          >
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-black p-1">
                <img 
                  src={solanaLogoSrc} 
                  alt="Solana" 
                  className="w-full h-full object-contain"
                  onError={(e) => console.error('Logo failed to load:', e)}
                />
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-medium">Solana</p>
                <p className="text-white/60 text-xs">SOL</p>
              </div>
            </div>
            
            {/* Real-time Chart */}
            <div className="h-12 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={solanaChartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#fff" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/60 text-xs">Price • {lastUpdated}</p>
                <p className="text-white font-bold text-sm">
                  ${prices?.SOL?.price?.toFixed(2) || '161.25'}
                  {isLoadingPrices && <span className="text-xs text-yellow-400 ml-1 animate-spin">⟳</span>}
                </p>
              </div>
              <span className={`text-xs font-medium ${
                (prices?.SOL?.changePercent24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(prices?.SOL?.changePercent24h || 0) >= 0 ? '+' : ''}{(prices?.SOL?.changePercent24h || 0).toFixed(1)}%
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Your Assets Section */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-6"
      >
        <h2 className="text-white text-lg font-semibold mb-4">Your Asset</h2>
        
        <div className="space-y-3">
          {/* USV Token Row */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/wallet')}
            className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-2xl p-5 cursor-pointer border border-gray-600/30"
          >
            <div className="flex items-center space-x-3">
              <img src="/usv-logo.png" alt="USV" className="w-12 h-12 object-contain rounded-2xl" />
              <div>
                <p className="text-white font-medium text-sm">Ultra Smooth Token</p>
                <p className="text-white/60 text-xs">USV</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-sm">
                ${prices?.USV?.price?.toFixed(4) || '0.2000'}
                {isLoadingPrices && <span className="text-xs text-yellow-400 ml-1 animate-spin">⟳</span>}
              </p>
              <p className={`text-xs ${
                (prices?.USV?.changePercent24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(prices?.USV?.changePercent24h || 0) >= 0 ? '+' : ''}{(prices?.USV?.changePercent24h || 0).toFixed(1)}%
              </p>
            </div>
          </motion.div>

          {/* Solana Row */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-2xl p-5 cursor-pointer border border-gray-600/30"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black p-2">
                <img 
                  src={solanaLogoSrc} 
                  alt="Solana" 
                  className="w-full h-full object-contain"
                  onError={(e) => console.error('Logo failed to load:', e)}
                />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Solana</p>
                <p className="text-white/60 text-xs">SOL</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-sm">
                ${prices?.SOL?.price?.toFixed(2) || '161.25'}
                {isLoadingPrices && <span className="text-xs text-yellow-400 ml-1 animate-spin">⟳</span>}
              </p>
              <p className={`text-xs ${
                (prices?.SOL?.changePercent24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(prices?.SOL?.changePercent24h || 0) >= 0 ? '+' : ''}{(prices?.SOL?.changePercent24h || 0).toFixed(1)}%
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}