import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/BottomNavigation';
import ConnectWallet from '@/components/ConnectWallet';
import { realTimePriceService, AllPricesResponse } from '@/lib/realTimePrices';
import PriceUpdateIndicator from '@/components/PriceUpdateIndicator';
import solanaLogo from '@assets/image_1756294071167.png';

// Real-time chart data that updates
const generateRealtimeData = () => {
  const basePrice = 4215;
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: basePrice + Math.sin(i * 0.3) * 50 + Math.random() * 30 - 15
  }));
};

const generateSolanaData = () => {
  const basePrice = 161.25;
  return Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: basePrice + Math.cos(i * 0.4) * 8 + Math.random() * 6 - 3
  }));
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [chartData, setChartData] = useState(generateRealtimeData());
  const [solanaChartData, setSolanaChartData] = useState(generateSolanaData());
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

    // Update charts every 3 seconds
    const chartInterval = setInterval(() => {
      setChartData(generateRealtimeData());
      setSolanaChartData(generateSolanaData());
    }, 3000);

    return () => {
      unsubscribe();
      realTimePriceService.stopRealTimeUpdates();
      clearInterval(chartInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-700 relative pb-20">
      <BottomNavigation />
      
      {/* Real-time Price Update Indicator */}
      <PriceUpdateIndicator 
        isUpdating={isLoadingPrices}
        lastUpdated={lastUpdated}
        changePercent={prices?.SOL?.changePercent24h || 0}
      />
      
      {/* Floating Connect Wallet Button */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, type: "spring", bounce: 0.5 }}
        className="fixed top-6 right-6 z-50"
      >
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            boxShadow: [
              "0 0 20px rgba(139, 92, 246, 0.3)",
              "0 0 40px rgba(139, 92, 246, 0.6)",
              "0 0 20px rgba(139, 92, 246, 0.3)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ConnectWallet onConnected={(publicKey) => console.log('Wallet connected:', publicKey)} className="w-16 h-16" />
        </motion.div>
      </motion.div>

      {/* Header with Profile */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-cyan-400/30">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face" 
                alt="Amanda"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-white/90 text-sm">Welcome back,</p>
              <p className="text-white font-semibold text-base">Amanda</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
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
          <h1 className="text-white text-5xl font-bold mb-3">$4,215</h1>
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-1">
              <div className="text-green-400 text-sm">↗</div>
              <span className="text-green-400 text-sm font-medium">6.3%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-white/20 rounded-md flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-sm"></div>
              </div>
              <span className="text-white/80 text-sm">0.21585</span>
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
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs">USV</span>
              </div>
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
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src={solanaLogo} 
                  alt="Solana" 
                  className="w-full h-full object-cover"
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
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">USV</span>
              </div>
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
              <div className="w-12 h-12 rounded-2xl overflow-hidden">
                <img 
                  src={solanaLogo} 
                  alt="Solana" 
                  className="w-full h-full object-cover"
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