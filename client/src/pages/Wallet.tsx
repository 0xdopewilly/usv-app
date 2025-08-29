import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/BottomNavigation';
import { realTimePriceService, AllPricesResponse } from '@/lib/realTimePrices';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

// Real-time chart data based on actual prices
const generatePriceChart = (currentPrice: number) => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: i,
    value: currentPrice + Math.sin(i * 0.3) * (currentPrice * 0.02) + Math.random() * (currentPrice * 0.01) - (currentPrice * 0.005)
  }));
};

export default function Wallet() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hideBalance, setHideBalance] = useState(false);
  const [prices, setPrices] = useState<AllPricesResponse | null>(null);
  const [usvChartData, setUsvChartData] = useState(generatePriceChart(0.20));
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');

  const timeframes = ['1d', '7d', '1m', '1y'];

  // Real-time price updates
  useEffect(() => {
    const unsubscribe = realTimePriceService.subscribe((newPrices) => {
      setPrices(newPrices);
      
      // Update charts with real price data
      if (newPrices.USV?.price) {
        setUsvChartData(generatePriceChart(newPrices.USV.price));
      }
    });

    realTimePriceService.startRealTimeUpdates(5000); // Update every 5 seconds

    return () => {
      unsubscribe();
      realTimePriceService.stopRealTimeUpdates();
    };
  }, []);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(user?.walletAddress || '8712345HQA7DHPUHHHY39WRGY');
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const totalBalance = user?.balance || 0;
  const usvTokens = totalBalance / (prices?.USV?.price || 0.20);

  return (
    <div className="min-h-screen bg-black relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-6"
      >
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-white text-lg font-semibold">Ultra Smooth Vape</h1>
          <div className="text-gray-400 text-sm">USV</div>
        </div>
      </motion.div>

      {/* Balance Section */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 pb-6"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <div className="text-black font-bold text-lg">USV</div>
            </div>
            <h2 className="text-white text-4xl font-bold">
              {hideBalance ? '••••••' : `$${totalBalance.toFixed(3)}`}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHideBalance(!hideBalance)}
              className="text-gray-400 hover:text-white p-1"
            >
              {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          {/* Price Change */}
          {prices?.USV && (
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className={`flex items-center space-x-1 ${
                prices.USV.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {prices.USV.changePercent24h >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {prices.USV.changePercent24h >= 0 ? '+' : ''}{prices.USV.changePercent24h.toFixed(2)}%
                </span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">$1.24</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-2xl">
              Receive
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-600 text-white hover:bg-white/10 px-8 py-3 rounded-2xl"
            >
              Sent
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Time Period Buttons */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-center space-x-2">
          {timeframes.map((period) => (
            <Button
              key={period}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTimeframe(period)}
              className={`px-4 py-2 rounded-xl ${
                period === selectedTimeframe 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Price Chart */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 mb-8"
      >
        <div className="h-48 bg-gradient-to-r from-transparent to-transparent">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={usvChartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#ec4899" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Wallet Address */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-6 mb-8"
      >
        <div className="bg-gray-900 rounded-2xl p-4">
          <h3 className="text-white font-medium mb-3">Copy USV address</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm font-mono">
              {user?.walletAddress || '8712345HQA7DHPUHHHY39WRGY'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAddress}
              className="text-gray-400 hover:text-white p-2"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-6 grid grid-cols-2 gap-4 mb-8"
      >
        <Button 
          variant="outline"
          className="border-gray-600 text-white hover:bg-white/10 py-4 rounded-2xl flex items-center justify-center space-x-2"
        >
          <span>Stake</span>
        </Button>
        <Button className="bg-pink-500 hover:bg-pink-600 text-white py-4 rounded-2xl flex items-center justify-center space-x-2">
          <span>Pods</span>
        </Button>
      </motion.div>

      {/* Assets List */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-6"
      >
        <h3 className="text-white font-medium mb-4">Assets</h3>
        
        {/* USV Token */}
        <div className="bg-gray-900 rounded-2xl p-4 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <div className="text-black font-bold text-sm">USV</div>
              </div>
              <div>
                <p className="text-white font-medium">USV Token</p>
                <p className="text-gray-400 text-sm">{usvTokens.toFixed(5)} USV</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">${totalBalance.toFixed(3)}</p>
              {prices?.USV && (
                <p className={`text-sm ${
                  prices.USV.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {prices.USV.changePercent24h >= 0 ? '+' : ''}{prices.USV.changePercent24h.toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SOL Token (if user has any) */}
        {user?.balance && user.balance > 0 && (
          <div className="bg-gray-900 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                  <div className="text-white font-bold text-sm">SOL</div>
                </div>
                <div>
                  <p className="text-white font-medium">Solana</p>
                  <p className="text-gray-400 text-sm">0.00000 SOL</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-medium">$0.00</p>
                {prices?.SOL && (
                  <p className={`text-sm ${
                    prices.SOL.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {prices.SOL.changePercent24h >= 0 ? '+' : ''}{prices.SOL.changePercent24h.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}