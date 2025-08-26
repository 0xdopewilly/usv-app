import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, X } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/BottomNavigation';
import { phantomWallet } from '@/lib/phantom';
import { useToast } from '@/hooks/use-toast';

const chartData = [
  { value: 4100, time: '9:00' },
  { value: 4080, time: '10:00' },
  { value: 4140, time: '11:00' },
  { value: 4120, time: '12:00' },
  { value: 4180, time: '13:00' },
  { value: 4160, time: '14:00' },
  { value: 4216, time: '15:00' },
];

export default function Wallet() {
  const [, setLocation] = useLocation();
  const [showStakingModal, setShowStakingModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const { toast } = useToast();

  const timeframes = ['1d', '7d', '1m', '1y'];
  
  const walletAddress = "871234HHQ87DHPUHHYH39WRGY";

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address copied!",
        description: "Wallet address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const connectPhantom = async () => {
    try {
      const address = await phantomWallet.connectWallet();
      if (address) {
        toast({
          title: "Phantom Connected!",
          description: `Connected to ${address.slice(0, 4)}...${address.slice(-4)}`,
        });
      }
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Could not connect to Phantom wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative pb-20">
      <BottomNavigation />
      

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div 
            className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-white text-lg font-medium">Ultra Smooth Vape</h1>
            <p className="text-gray-400 text-sm">USV</p>
          </div>
          <div className="w-10 h-10" />
        </div>
      </motion.div>

      {/* Balance Section */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 py-6 text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-purple-600 font-bold text-lg">USV</span>
          </div>
          <div>
            <h2 className="text-white text-4xl font-bold">$4,216</h2>
            <p className="text-green-400 text-sm">
              <span className="mr-2">↗ +$0.21585</span>
              <span>+%1.24</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-8">
          <Button 
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl py-3"
            onClick={connectPhantom}
          >
            Receive
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-gray-600 text-white rounded-2xl py-3 bg-transparent hover:bg-gray-800"
          >
            Sent
          </Button>
        </div>
      </motion.div>

      {/* Chart Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-6 mb-6"
      >
        {/* Timeframe Selector */}
        <div className="flex space-x-2 mb-4">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-xl text-sm ${
                selectedTimeframe === timeframe
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-48 bg-gray-900/50 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#fff" 
                strokeWidth={2}
                dot={{ fill: '#fff', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Copy Address Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-6 mb-6"
      >
        <div className="bg-gray-800/50 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Copy USV address</p>
              <p className="text-white font-mono text-sm">{walletAddress}</p>
            </div>
            <button
              onClick={copyAddress}
              className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center"
            >
              <Copy className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="px-6"
      >
        <div className="flex space-x-4">
          <Button 
            variant="outline"
            className="flex-1 border-gray-600 text-white rounded-2xl py-3 bg-transparent hover:bg-gray-800"
            onClick={() => setShowStakingModal(true)}
          >
            Stake
          </Button>
          <Button 
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl py-3"
            onClick={() => setLocation('/nft-portfolio')}
          >
            Pods
          </Button>
        </div>
      </motion.div>

      {/* Staking Modal */}
      {showStakingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6"
          onClick={() => setShowStakingModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowStakingModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            <div className="text-center">
              <h3 className="text-white text-lg font-semibold mb-6">Your staking order</h3>
              
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xl">USV</span>
                </div>
                <div className="text-left">
                  <p className="text-white text-3xl font-bold">400.00</p>
                  <p className="text-purple-400 text-lg">5% <span className="text-gray-400">per year</span></p>
                </div>
              </div>
              
              <div className="text-green-400 text-2xl font-bold mb-8">COMPLETE</div>
              
              <div className="text-left">
                <h4 className="text-white text-lg font-semibold mb-2">Earn Rewards by Staking</h4>
                <h4 className="text-white text-lg font-semibold mb-4">Your USV Tokens!</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Maximize your benefits by staking USV tokens on our platform. With up to 6% APY, 
                  staking rewards increase based on your NFT collection size, giving you more for your 
                  loyalty. Start staking today and enjoy steady growth while supporting a secure and 
                  innovative ecosystem.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}