import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { LineChart, Line, ResponsiveContainer, XAxis } from 'recharts';

const chartData = [
  { time: '9:00', value: 4.100 },
  { time: '10:00', value: 4.150 },
  { time: '11:00', value: 4.180 },
  { time: '12:00', value: 4.120 },
  { time: '13:00', value: 4.200 },
  { time: '14:00', value: 4.216 },
  { time: '15:00', value: 4.180 },
  { time: '16:00', value: 4.216 }
];

const timeFilters = ['1d', '7d', '1m', '1y'];

export default function Wallet() {
  const [, setLocation] = useLocation();
  const [selectedFilter, setSelectedFilter] = useState('1d');
  const [showStaking, setShowStaking] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const walletAddress = "871234HHQ87DHPUHMYH39WRGY";

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleStake = () => {
    setShowStaking(true);
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
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer" 
          onClick={() => setLocation('/home')}
        />
        <div className="text-center">
          <h1 className="text-white font-medium">Ultra Smooth Vape</h1>
          <p className="text-gray-400 text-sm">USV</p>
        </div>
        <div className="w-6 h-6" /> {/* Spacer */}
      </motion.div>
      
      {/* Balance Section */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 mb-8 text-center"
      >
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-purple-600 font-bold text-lg">USV</span>
        </div>
        <h2 className="text-4xl font-bold text-white mb-2">$4.216</h2>
        <div className="flex items-center justify-center text-green-400 mb-6">
          <TrendingUp className="w-4 h-4 mr-1" />
          <span className="text-sm">+$0.21585 +%1.24</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full">
            Receive
          </Button>
          <Button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-full">
            Sent
          </Button>
        </div>
      </motion.div>
      
      {/* Time Filter */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6 mb-6"
      >
        <div className="flex space-x-2">
          {timeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm ${
                selectedFilter === filter
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>
      
      {/* Chart */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="px-6 mb-8"
      >
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#a855f7" 
                strokeWidth={3}
                dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#a855f7' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Copy Address Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="px-6 mb-6"
      >
        <p className="text-gray-400 text-sm mb-2">Copy USV address</p>
        <div className="flex items-center justify-between bg-gray-800/50 rounded-xl p-4">
          <p className="text-white font-mono text-sm">{walletAddress}</p>
          <Copy 
            className="w-5 h-5 text-gray-400 cursor-pointer hover:text-white"
            onClick={copyAddress}
          />
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="px-6 flex space-x-4"
      >
        <Button 
          onClick={handleStake}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-full"
        >
          Stake
        </Button>
        <Button 
          onClick={() => setLocation('/nft-portfolio')}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full"
        >
          Pods
        </Button>
      </motion.div>

      {/* Staking Modal */}
      {showStaking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
          onClick={() => setShowStaking(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-white text-lg font-semibold mb-2">Your staking order</h3>
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">USV</span>
                </div>
                <div>
                  <p className="text-white text-2xl font-bold">400.00</p>
                  <p className="text-purple-400 text-sm">5% per year</p>
                </div>
              </div>
              <div className="text-green-400 text-xl font-bold mb-4">COMPLETE</div>
            </div>
            
            <div className="text-center">
              <h4 className="text-white text-lg font-semibold mb-2">Earn Rewards by Staking</h4>
              <h4 className="text-white text-lg font-semibold mb-4">Your USV Tokens!</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Maximize your benefits by staking USV tokens on our platform. With up to 6% APY, 
                staking rewards increase based on your NFT collection size, giving you more for your 
                loyalty. Start staking today and enjoy steady growth while supporting a secure and 
                innovative ecosystem.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
