import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { realTimePriceService, AllPricesResponse } from '@/lib/realTimePrices';
import PriceUpdateIndicator from '@/components/PriceUpdateIndicator';
import { useAuth } from '@/lib/auth';
// Keep original Solana logo
const solanaLogoSrc = '/solana-logo.png';
// New USV Logo
import usvLogoSrc from '@assets/image_1757431326277.png';

// Chart data structure
interface ChartDataPoint {
  time: number;
  value: number;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [solanaChartData, setSolanaChartData] = useState<ChartDataPoint[]>([]);
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

  // Fetch chart data from API
  const fetchChartData = async (symbol: string) => {
    try {
      const response = await fetch(`/api/prices/chart/${symbol}?days=1`);
      if (!response.ok) throw new Error(`Failed to fetch ${symbol} chart`);
      const data = await response.json();
      return data.data; // Returns array of {time, value}
    } catch (error) {
      console.error(`Error fetching ${symbol} chart:`, error);
      return [];
    }
  };

  // Setup real-time price updates and chart data
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

    // Fetch initial chart data
    const loadChartData = async () => {
      const [usvData, solData] = await Promise.all([
        fetchChartData('USV'),
        fetchChartData('SOL')
      ]);
      setChartData(usvData);
      setSolanaChartData(solData);
    };
    loadChartData();

    // Refresh chart data every 30 seconds
    const chartRefreshInterval = setInterval(loadChartData, 30000);

    return () => {
      unsubscribe();
      realTimePriceService.stopRealTimeUpdates();
      clearInterval(chartRefreshInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-black relative pb-20 overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 animate-gradient-shift opacity-10 dark:opacity-5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-purple-200/10 dark:from-purple-900/10 via-transparent to-transparent" />
      
      

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
              className="w-12 h-12 rounded-[24px] overflow-hidden border-2 border-cyan-400/30 cursor-pointer relative"
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation('/settings')}
              style={{ willChange: 'transform' }}
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user?.fullName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-electric flex items-center justify-center rounded-[22px] animate-shimmer">
                  <span className="text-black dark:text-white font-bold text-sm relative z-10">{user?.fullName?.charAt(0) || 'U'}</span>
                </div>
              )}
              {/* Online Status Indicator */}
              <motion.div 
                className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-black animate-pulse"
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
              <p className="text-gray-600 dark:text-white/90 text-sm">
                Welcome back,
              </p>
              <p className="text-gray-900 dark:text-white font-semibold text-base">{user?.fullName?.split(' ')[0] || 'Amanda'}</p>
            </motion.div>
          </div>
          <motion.div 
            className="w-10 h-10 glass-card rounded-[20px] flex items-center justify-center cursor-pointer"
            onClick={() => setLocation('/settings')}
            whileHover={{ 
              scale: 1.1, 
              rotate: 90,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
            style={{ willChange: 'transform' }}
          >
            <motion.div>
              <MoreHorizontal className="w-5 h-5 text-gray-900 dark:text-white" />
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
            <h1 className="text-gray-900 dark:text-white text-5xl font-bold mb-3 relative">
              <span className="relative z-10">${totalPortfolioValue.toFixed(2)}</span>
              {/* Glow Effect */}
              <div className="absolute inset-0 text-transparent bg-gradient-electric bg-clip-text blur-sm opacity-50">
                ${totalPortfolioValue.toFixed(2)}
              </div>
            </h1>
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
                <div className="flex items-center space-x-1">
                  <div className={`text-sm ${prices.USV.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {prices.USV.changePercent24h >= 0 ? '↗' : '↘'}
                  </div>
                  <span className={`text-sm font-medium ${prices.USV.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {prices.USV.changePercent24h >= 0 ? '+' : ''}{prices.USV.changePercent24h.toFixed(1)}%
                  </span>
                </div>
              )
            )}
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gradient-purple rounded-[8px] flex items-center justify-center animate-shimmer">
                <div className="w-2 h-2 bg-white rounded-[4px]"></div>
              </div>
              <span className="text-gray-600 dark:text-white/80 text-sm font-medium">
                {walletBalance?.balanceUSV ? walletBalance.balanceUSV.toFixed(2) : '0.00'} USV
              </span>
            </div>
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
              scale: 1.02, 
              y: -4,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/wallet')}
            className="glass-dark rounded-[32px] p-5 cursor-pointer border border-purple-500/30 shadow-xl relative overflow-hidden"
            style={{ willChange: 'transform' }}
            data-testid="card-usv-token"
          >
            <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-[16px] bg-gray-200 dark:bg-black/40 relative overflow-hidden">
                <img src="/usv-logo.png" alt="USV" className="w-full h-full object-cover relative z-10" />
              </div>
              <div className="flex-1">
                <p className="text-black dark:text-white text-sm font-semibold">Ultra Smooth Vape</p>
                <p className="text-gray-800 dark:text-white/70 text-xs font-medium">USV</p>
              </div>
            </div>
            
            {/* Real-time Chart */}
            <div className="h-16 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <YAxis domain={['dataMin', 'dataMax']} hide={true} />
                  <Line 
                    type="linear" 
                    dataKey="value" 
                    stroke="#fff" 
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    strokeLinejoin="miter"
                    strokeLinecap="square"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-gray-700 dark:text-white/60 text-xs mb-1">
                  Price • {lastUpdated}
                </p>
                {isLoadingPrices ? (
                  <div className="skeleton w-16 h-5 rounded-[8px]" />
                ) : (
                  <p className="text-black dark:text-white font-bold text-base flex items-center">
                    ${prices?.USV?.price?.toFixed(3) || '0.000'}
                  </p>
                )}
              </div>
              <span className={`text-sm font-bold px-2 py-1 rounded-[12px] ${
                (prices?.USV?.changePercent24h || 0) >= 0 
                  ? 'text-green-400 bg-green-400/10' 
                  : 'text-red-400 bg-red-400/10'
              }`}>
                {(prices?.USV?.changePercent24h || 0) >= 0 ? '+' : ''}{(prices?.USV?.changePercent24h || 0).toFixed(1)}%
              </span>
            </div>
            </div>
          </motion.div>

          {/* Solana Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, x: 20 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6, type: "spring" }}
            whileHover={{ 
              scale: 1.02, 
              y: -4,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="glass-dark rounded-[32px] p-5 cursor-pointer border border-blue-500/30 shadow-xl relative overflow-hidden"
            style={{ willChange: 'transform' }}
            data-testid="card-solana-token"
          >
            <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-[16px] overflow-hidden bg-gray-200 dark:bg-black/40 relative">
                <img 
                  src={solanaLogoSrc} 
                  alt="Solana" 
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => console.error('Logo failed to load:', e)}
                />
              </div>
              <div className="flex-1">
                <p className="text-black dark:text-white text-sm font-semibold">Solana</p>
                <p className="text-gray-800 dark:text-white/70 text-xs font-medium">SOL</p>
              </div>
            </div>
            
            {/* Real-time Chart */}
            <div className="h-16 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={solanaChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <YAxis domain={['dataMin', 'dataMax']} hide={true} />
                  <Line 
                    type="linear" 
                    dataKey="value" 
                    stroke="#fff" 
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    strokeLinejoin="miter"
                    strokeLinecap="square"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-gray-700 dark:text-white/60 text-xs mb-1">
                  Price • {lastUpdated}
                </p>
                {isLoadingPrices ? (
                  <div className="skeleton w-20 h-5 rounded-[8px]" />
                ) : (
                  <p className="text-black dark:text-white font-bold text-base flex items-center">
                    ${prices?.SOL?.price?.toFixed(2) || '210.00'}
                  </p>
                )}
              </div>
              <span className={`text-sm font-bold px-2 py-1 rounded-[12px] ${
                (prices?.SOL?.changePercent24h || 0) >= 0 
                  ? 'text-green-400 bg-green-400/10' 
                  : 'text-red-400 bg-red-400/10'
              }`}>
                {(prices?.SOL?.changePercent24h || 0) >= 0 ? '+' : ''}{(prices?.SOL?.changePercent24h || 0).toFixed(1)}%
              </span>
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
        <h2 className="text-black dark:text-white text-lg font-semibold mb-4">Your Asset</h2>
        
        <div className="space-y-3">
          {/* USV Token Row */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, x: -10 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5, type: "spring" }}
            whileHover={{ 
              x: 3,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/wallet')}
            className="flex items-center justify-between bg-gray-200 dark:bg-black/30 backdrop-blur-sm rounded-[24px] p-5 cursor-pointer border border-gray-600/30"
            style={{ willChange: 'transform' }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-[20px] overflow-hidden bg-purple-500">
                <img src="/usv-logo.png" alt="USV" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-black dark:text-white font-medium text-sm">Ultra Smooth Token</p>
                <p className="text-gray-700 dark:text-white/60 text-xs">USV</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-black dark:text-white font-bold text-sm">
                ${prices?.USV?.price?.toFixed(4) || '0.0000'}
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
            whileHover={{ 
              x: 3,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between bg-gray-200 dark:bg-black/30 backdrop-blur-sm rounded-[24px] p-5 cursor-pointer border border-gray-600/30"
            style={{ willChange: 'transform' }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-[20px] overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600">
                <img 
                  src={solanaLogoSrc} 
                  alt="Solana" 
                  className="w-full h-full object-cover"
                  onError={(e) => console.error('Logo failed to load:', e)}
                />
              </div>
              <div>
                <p className="text-black dark:text-white font-medium text-sm">Solana</p>
                <p className="text-gray-700 dark:text-white/60 text-xs">SOL</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-black dark:text-white font-bold text-sm">
                ${prices?.SOL?.price?.toFixed(2) || '210.00'}
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