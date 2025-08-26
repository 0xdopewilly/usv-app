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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 relative pb-20">
      <BottomNavigation />
      
      {/* Status Bar */}
      <div className="flex justify-between items-center pt-12 px-6 text-white text-sm">
        <span className="font-medium">09:46</span>
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white/50 rounded-full"></div>
          </div>
          <div className="flex items-center space-x-1 ml-2">
            <div className="w-6 h-3 border border-white rounded-sm">
              <div className="w-4 h-1 bg-white rounded-sm m-0.5"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face" 
                alt="Amanda"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-white/80 text-sm">Welcome back,</p>
              <p className="text-white font-semibold text-lg">Amanda</p>
            </div>
          </div>
          <MoreHorizontal className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      {/* Main Balance */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 py-6"
      >
        <div className="text-center">
          <h1 className="text-white text-5xl font-bold mb-2">$4,215</h1>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <span className="text-green-400 text-sm font-medium">6.3%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded"></div>
              </div>
              <span className="text-white/80 text-sm">0.21585</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Asset Cards */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="px-6 mb-8"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* USV Token Card */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/wallet')}
            className="bg-black/30 backdrop-blur rounded-3xl p-4 cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs">USV</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Ultra Smooth Vape</p>
                <p className="text-white/60 text-xs">USV</p>
              </div>
            </div>
            
            {/* Mini Chart */}
            <div className="h-12 mb-3">
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
                <p className="text-white font-bold">$147,853</p>
              </div>
              <span className="text-green-400 text-xs font-medium">+12.3%</span>
            </div>
          </motion.div>

          {/* Solana Card */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="bg-black/30 backdrop-blur rounded-3xl p-4 cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Solana</p>
                <p className="text-white/60 text-xs">SOL</p>
              </div>
            </div>
            
            {/* Mini Chart */}
            <div className="h-12 mb-3">
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
                <p className="text-white font-bold">$5,748</p>
              </div>
              <span className="text-green-400 text-xs font-medium">+1.2%</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Your Assets Section */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-6"
      >
        <h2 className="text-white text-xl font-semibold mb-4">Your Asset</h2>
        
        <div className="space-y-3">
          {/* USV Token Row */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/wallet')}
            className="flex items-center justify-between bg-black/20 backdrop-blur rounded-2xl p-4 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">USV</span>
              </div>
              <div>
                <p className="text-white font-medium">Ultra Smooth Token</p>
                <p className="text-white/60 text-sm">USV</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">$0.2125</p>
              <p className="text-green-400 text-sm">+12.3%</p>
            </div>
          </motion.div>

          {/* Solana Row */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between bg-black/20 backdrop-blur rounded-2xl p-4 cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
              </div>
              <div>
                <p className="text-white font-medium">Solana</p>
                <p className="text-white/60 text-sm">SOL</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">$161.25</p>
              <p className="text-green-400 text-sm">+4.9%</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}