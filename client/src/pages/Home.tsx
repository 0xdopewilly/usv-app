import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, QrCode } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import BottomNavigation from '@/components/BottomNavigation';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const mockChartData = [
  { value: 4.100 }, { value: 4.150 }, { value: 4.180 }, { value: 4.120 }, 
  { value: 4.200 }, { value: 4.215 }, { value: 4.180 }, { value: 4.215 }
];

const usvChartData = [
  { value: 145.200 }, { value: 146.100 }, { value: 147.853 }, { value: 146.500 }, 
  { value: 147.200 }, { value: 147.853 }, { value: 146.800 }, { value: 147.853 }
];

const solChartData = [
  { value: 5.500 }, { value: 5.600 }, { value: 5.748 }, { value: 5.650 }, 
  { value: 5.700 }, { value: 5.748 }, { value: 5.680 }, { value: 5.748 }
];

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/auth');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  const handleWalletClick = () => {
    setLocation('/wallet');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 to-gray-900 relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-12 px-6 pb-4 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <p className="text-white font-medium">{user?.fullName?.split(' ')[0] || 'Amanda'}</p>
          </div>
        </div>
        <QrCode className="w-6 h-6 text-white" onClick={() => setLocation('/qr-scan')} />
      </motion.div>

      {/* Total Portfolio Value */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 mb-8"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">$4.215</h1>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-sm">6.3%</span>
            </div>
            <div className="flex items-center text-gray-400">
              <span className="text-sm">0.2158₿</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Asset Cards */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6 mb-8"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* USV Token Card */}
          <div 
            className="bg-gradient-to-br from-purple-800/30 to-purple-900/20 rounded-2xl p-4 border border-purple-700/30 cursor-pointer"
            onClick={handleWalletClick}
          >
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold text-sm">USV</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Ultra Smooth Vape</p>
                <p className="text-gray-400 text-xs">USV</p>
              </div>
            </div>
            <div className="h-12 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usvChartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Balance</p>
              <p className="text-white font-bold">$147,853</p>
              <p className="text-green-400 text-xs">+ 12.3%</p>
            </div>
          </div>

          {/* Solana Card */}
          <div className="bg-gradient-to-br from-blue-800/30 to-blue-900/20 rounded-2xl p-4 border border-blue-700/30">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xs">SOL</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Solana</p>
                <p className="text-gray-400 text-xs">SOL</p>
              </div>
            </div>
            <div className="h-12 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={solChartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Balance</p>
              <p className="text-white font-bold">$5,748</p>
              <p className="text-green-400 text-xs">+ 4.9%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Your Assets Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="px-6"
      >
        <h3 className="text-white text-lg font-semibold mb-4">Your Asset</h3>
        
        <div className="space-y-3">
          {/* USV Token Row */}
          <div className="flex items-center justify-between bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold text-sm">USV</span>
              </div>
              <div>
                <p className="text-white font-medium">Ultra Smooth Token</p>
                <p className="text-gray-400 text-sm">USV</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">$0.2125</p>
              <p className="text-green-400 text-sm">+ 12.3%</p>
            </div>
          </div>

          {/* Solana Row */}
          <div className="flex items-center justify-between bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xs">SOL</span>
              </div>
              <div>
                <p className="text-white font-medium">Solana</p>
                <p className="text-gray-400 text-sm">SOL</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">$161.25</p>
              <p className="text-green-400 text-sm">+ 4.9%</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}