import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/BottomNavigation';

const chartData = [
  { value: 4100 },
  { value: 4050 },
  { value: 4180 },
  { value: 4120 },
  { value: 4215 }
];

const solanaChartData = [
  { value: 5600 },
  { value: 5720 },
  { value: 5680 },
  { value: 5748 }
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-purple-700 relative pb-20">
      <BottomNavigation />
      
      {/* Status Bar */}
      <div className="flex justify-between items-center pt-3 px-6 text-white text-sm font-medium">
        <span>09:46</span>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
          </div>
          <div className="text-xs">📶</div>
          <div className="text-xs">📶</div>
          <div className="text-xs">🔋</div>
        </div>
      </div>

      {/* Header with Profile */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-8 pb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/20">
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
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
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
            className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 cursor-pointer"
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
            
            {/* Mini Chart */}
            <div className="h-10 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#fff" 
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/60 text-xs">Balance</p>
                <p className="text-white font-bold text-sm">$147,853</p>
              </div>
              <span className="text-green-400 text-xs font-medium">+12.3%</span>
            </div>
          </motion.div>

          {/* Solana Card */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 cursor-pointer"
          >
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                <div className="w-4 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-4 bg-white rounded-full ml-0.5"></div>
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-medium">Solana</p>
                <p className="text-white/60 text-xs">SOL</p>
              </div>
            </div>
            
            {/* Mini Chart */}
            <div className="h-10 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={solanaChartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#fff" 
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/60 text-xs">Balance</p>
                <p className="text-white font-bold text-sm">$5,748</p>
              </div>
              <span className="text-green-400 text-xs font-medium">+1.2%</span>
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
            className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-xl p-4 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">USV</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Ultra Smooth Token</p>
                <p className="text-white/60 text-xs">USV</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-sm">$0.2125</p>
              <p className="text-green-400 text-xs">+12.3%</p>
            </div>
          </motion.div>

          {/* Solana Row */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-xl p-4 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                <div className="w-4 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-4 bg-white rounded-full ml-0.5"></div>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Solana</p>
                <p className="text-white/60 text-xs">SOL</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-sm">$161.25</p>
              <p className="text-green-400 text-xs">+4.9%</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}