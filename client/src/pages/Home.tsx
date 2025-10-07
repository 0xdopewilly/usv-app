import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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

  // Fetch real wallet balance from blockchain
  const { data: walletBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance', user?.walletAddress],
    queryFn: async () => {
      if (!user?.walletAddress) return null;
      const response = await fetch(`/api/wallet/balance/${user.walletAddress}`);
      if (!response.ok) throw new Error('Failed to fetch balance');
      return response.json();
    },
    enabled: !!user?.walletAddress,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  // Calculate total portfolio value in USD - only when both balance and prices are loaded
  const totalPortfolioValue = 
    (walletBalance?.balanceSOL && prices?.SOL?.price ? (walletBalance.balanceSOL * prices.SOL.price) : 0) +
    (walletBalance?.balanceUSV && prices?.USV?.price ? (walletBalance.balanceUSV * prices.USV.price) : 0);

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
    <div className="min-h-screen bg-black relative pb-20 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 animate-gradient-shift opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent" />
      
      

      {/* Header with Profile */}
      <motion.div 
        initial={{ y: -40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="px-6 pt-12 pb-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-12 h-12 rounded-[24px] overflow-hidden border-2 border-cyan-400/30 cursor-pointer interactive hover-lift hover-glow relative"
              whileHover={{ 
                scale: 1.08, 
                rotate: 5,
                borderColor: "rgba(34, 211, 238, 0.8)"
              }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              onClick={() => setLocation('/settings')}
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user?.fullName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-electric flex items-center justify-center rounded-[22px] animate-shimmer">
                  <span className="text-white font-bold text-sm relative z-10">{user?.fullName?.charAt(0) || 'U'}</span>
                </div>
              )}
              {/* Online Status Indicator */}
              <motion.div 
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.p 
                className="text-white/90 text-sm"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                Welcome back,
              </motion.p>
              <p className="text-white font-semibold text-base">{user?.fullName?.split(' ')[0] || 'Amanda'}</p>
            </motion.div>
          </div>
          <motion.div 
            className="w-10 h-10 glass-card rounded-[20px] flex items-center justify-center cursor-pointer interactive hover-lift"
            onClick={() => setLocation('/settings')}
            whileHover={{ 
              scale: 1.12, 
              rotate: 180,
              boxShadow: "0 8px 25px rgba(255, 255, 255, 0.2)"
            }}
            whileTap={{ scale: 0.85, rotate: 90 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <motion.div>
              <MoreHorizontal className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        </div>

      </motion.div>

      {/* Main Balance */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 120 }}
        className="px-6 pb-6"
      >
        <motion.div 
          className="text-center relative"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          {/* Balance Loading State */}
          {isLoadingPrices || balanceLoading ? (
            <div className="skeleton w-48 h-14 mx-auto rounded-[16px] mb-3" />
          ) : (
            <motion.h1 
              className="text-white text-5xl font-bold mb-3 relative"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="relative z-10">${totalPortfolioValue.toFixed(2)}</span>
              {/* Glow Effect */}
              <motion.div 
                className="absolute inset-0 text-transparent bg-gradient-electric bg-clip-text blur-sm opacity-50"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ${totalPortfolioValue.toFixed(2)}
              </motion.div>
            </motion.h1>
          )}
          
          <motion.div 
            className="flex items-center justify-center space-x-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {isLoadingPrices ? (
              <div className="skeleton w-20 h-6 rounded-[8px]" />
            ) : (
              prices?.USV && (
                <motion.div 
                  className="flex items-center space-x-1"
                  animate={{ y: [0, -2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div 
                    className={`text-sm ${prices.USV.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {prices.USV.changePercent24h >= 0 ? '↗' : '↘'}
                  </motion.div>
                  <span className={`text-sm font-medium ${prices.USV.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {prices.USV.changePercent24h >= 0 ? '+' : ''}{prices.USV.changePercent24h.toFixed(1)}%
                  </span>
                </motion.div>
              )
            )}
            <motion.div 
              className="flex items-center space-x-1"
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div 
                className="w-4 h-4 bg-gradient-purple rounded-[8px] flex items-center justify-center animate-shimmer"
              >
                <div className="w-2 h-2 bg-white rounded-[4px]"></div>
              </motion.div>
              <span className="text-white/80 text-sm font-medium">
                {walletBalance?.balanceUSV ? walletBalance.balanceUSV.toFixed(2) : '0.00'} USV
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Asset Cards */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="px-6 mb-6"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* USV Token Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, x: -20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
            whileHover={{ 
              scale: 1.03, 
              y: -8,
              boxShadow: "0 20px 40px rgba(168, 85, 247, 0.3), 0 10px 20px rgba(168, 85, 247, 0.2)",
              borderColor: "rgba(168, 85, 247, 0.8)",
              rotate: 1
            }}
            whileTap={{ scale: 0.97, y: -4, rotate: -1 }}
            onClick={() => setLocation('/wallet')}
            className="glass-dark rounded-[32px] p-5 cursor-pointer border border-purple-500/30 shadow-xl hover-lift hover-glow interactive relative overflow-hidden"
            data-testid="card-usv-token"
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-purple opacity-5 animate-gradient-slow rounded-[32px]" />
            <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <motion.div
                className="w-10 h-10 rounded-[16px] p-1 bg-gradient-purple relative overflow-hidden"
              >
                <img src="/usv-logo.png" alt="USV" className="w-full h-full object-contain relative z-10" />
                <div className="absolute inset-0 animate-shimmer" />
              </motion.div>
              <div className="flex-1">
                <motion.p 
                  className="text-white text-sm font-semibold"
                  animate={{ x: [0, 1, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  Ultra Smooth Vape
                </motion.p>
                <p className="text-white/70 text-xs font-medium">USV</p>
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
                <motion.p 
                  className="text-white/60 text-xs mb-1"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  Price • {lastUpdated}
                </motion.p>
                {isLoadingPrices ? (
                  <div className="skeleton w-16 h-5 rounded-[8px]" />
                ) : (
                  <motion.p 
                    className="text-white font-bold text-base flex items-center"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    ${prices?.USV?.price?.toFixed(3) || '0.200'}
                  </motion.p>
                )}
              </div>
              <motion.span 
                className={`text-sm font-bold px-2 py-1 rounded-[12px] ${
                  (prices?.USV?.changePercent24h || 0) >= 0 
                    ? 'text-green-400 bg-green-400/10' 
                    : 'text-red-400 bg-red-400/10'
                }`}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                {(prices?.USV?.changePercent24h || 0) >= 0 ? '+' : ''}{(prices?.USV?.changePercent24h || 0).toFixed(1)}%
              </motion.span>
            </div>
            </div>
          </motion.div>

          {/* Solana Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6, type: "spring" }}
            whileHover={{ 
              scale: 1.03, 
              y: -8,
              boxShadow: "0 20px 40px rgba(79, 172, 254, 0.3), 0 10px 20px rgba(79, 172, 254, 0.2)",
              borderColor: "rgba(79, 172, 254, 0.8)",
              rotate: -1
            }}
            whileTap={{ scale: 0.97, y: -4, rotate: 1 }}
            className="glass-dark rounded-[32px] p-5 cursor-pointer border border-blue-500/30 shadow-xl hover-lift hover-glow interactive relative overflow-hidden"
            data-testid="card-solana-token"
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-electric opacity-5 animate-gradient-slow rounded-[32px]" />
            <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <motion.div 
                className="w-10 h-10 rounded-[16px] overflow-hidden bg-gradient-electric p-1 relative"
              >
                <img 
                  src={solanaLogoSrc} 
                  alt="Solana" 
                  className="w-full h-full object-contain relative z-10"
                  onError={(e) => console.error('Logo failed to load:', e)}
                />
                <div className="absolute inset-0 animate-shimmer" />
              </motion.div>
              <div className="flex-1">
                <motion.p 
                  className="text-white text-sm font-semibold"
                  animate={{ x: [0, -1, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  Solana
                </motion.p>
                <p className="text-white/70 text-xs font-medium">SOL</p>
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
                <motion.p 
                  className="text-white/60 text-xs mb-1"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                >
                  Price • {lastUpdated}
                </motion.p>
                {isLoadingPrices ? (
                  <div className="skeleton w-20 h-5 rounded-[8px]" />
                ) : (
                  <motion.p 
                    className="text-white font-bold text-base flex items-center"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                  >
                    ${prices?.SOL?.price?.toFixed(2) || '161.25'}
                  </motion.p>
                )}
              </div>
              <motion.span 
                className={`text-sm font-bold px-2 py-1 rounded-[12px] ${
                  (prices?.SOL?.changePercent24h || 0) >= 0 
                    ? 'text-green-400 bg-green-400/10' 
                    : 'text-red-400 bg-red-400/10'
                }`}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              >
                {(prices?.SOL?.changePercent24h || 0) >= 0 ? '+' : ''}{(prices?.SOL?.changePercent24h || 0).toFixed(1)}%
              </motion.span>
            </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Your Assets Section */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="px-6"
      >
        <h2 className="text-white text-lg font-semibold mb-4">Your Asset</h2>
        
        <div className="space-y-3">
          {/* USV Token Row */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: -10 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5, type: "spring" }}
            whileHover={{ 
              scale: 1.01, 
              x: 3,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              borderColor: "rgba(168, 85, 247, 0.6)",
              boxShadow: "0 8px 25px rgba(168, 85, 247, 0.2)"
            }}
            whileTap={{ scale: 0.98, x: 1 }}
            onClick={() => setLocation('/wallet')}
            className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-[24px] p-5 cursor-pointer border border-gray-600/30 transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <img src="/usv-logo.png" alt="USV" className="w-12 h-12 object-contain rounded-[20px]" />
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
            initial={{ scale: 0.95, opacity: 0, x: -10 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.5, type: "spring" }}
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-[24px] p-5 cursor-pointer border border-gray-600/30 hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-[20px] overflow-hidden bg-black p-2">
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