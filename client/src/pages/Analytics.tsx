import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Award, Coins, Activity, Calendar } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, BarChart, Bar } from 'recharts';
import BottomNavigation from '@/components/BottomNavigation';

const dailyClaimData = [
  { day: 'Mon', claims: 12, tokens: 300, stakes: 5 },
  { day: 'Tue', claims: 19, tokens: 475, stakes: 8 },
  { day: 'Wed', claims: 15, tokens: 375, stakes: 6 },
  { day: 'Thu', claims: 22, tokens: 550, stakes: 9 },
  { day: 'Fri', claims: 28, tokens: 700, stakes: 12 },
  { day: 'Sat', claims: 35, tokens: 875, stakes: 15 },
  { day: 'Sun', claims: 31, tokens: 775, stakes: 13 }
];

const monthlyData = [
  { month: 'Jan', totalClaims: 245, totalTokens: 6125, totalStakes: 89 },
  { month: 'Feb', totalClaims: 289, totalTokens: 7225, totalStakes: 102 },
  { month: 'Mar', totalClaims: 356, totalTokens: 8900, totalStakes: 134 },
  { month: 'Apr', totalClaims: 423, totalTokens: 10575, totalStakes: 167 },
  { month: 'May', totalClaims: 512, totalTokens: 12800, totalStakes: 198 },
  { month: 'Jun', totalClaims: 589, totalTokens: 14725, totalStakes: 223 }
];

const kpiData = {
  totalClaims: 2414,
  totalTokensEarned: 60350,
  totalStaked: 15750,
  averageDaily: 42.3,
  bestDay: {
    date: 'June 15, 2024',
    claims: 67,
    tokens: 1675
  },
  streakDays: 23,
  rankPosition: 127,
  totalUsers: 15420
};

export default function Analytics() {
  const [, setLocation] = useLocation();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  const getCurrentData = () => {
    switch (timeframe) {
      case 'week':
        return dailyClaimData;
      case 'month':
        return monthlyData.slice(-4).map(item => ({
          day: item.month,
          claims: Math.floor(item.totalClaims / 30),
          tokens: Math.floor(item.totalTokens / 30),
          stakes: Math.floor(item.totalStakes / 30)
        }));
      case 'year':
        return monthlyData;
      default:
        return dailyClaimData;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-4 flex items-center justify-between"
      >
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer" 
          onClick={() => setLocation('/')}
        />
        <h1 className="text-white text-xl font-semibold">Analytics Dashboard</h1>
        <Activity className="w-6 h-6 text-purple-400" />
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 mb-6 grid grid-cols-2 gap-4"
      >
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur rounded-3xl p-4 border border-purple-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Coins className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 text-sm font-medium">Total Earned</span>
          </div>
          <p className="text-white text-2xl font-bold">{kpiData.totalTokensEarned.toLocaleString()}</p>
          <p className="text-gray-400 text-xs">USV Tokens</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur rounded-3xl p-4 border border-green-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Total Claims</span>
          </div>
          <p className="text-white text-2xl font-bold">{kpiData.totalClaims.toLocaleString()}</p>
          <p className="text-gray-400 text-xs">QR Scans</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur rounded-3xl p-4 border border-blue-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Staked</span>
          </div>
          <p className="text-white text-2xl font-bold">{kpiData.totalStaked.toLocaleString()}</p>
          <p className="text-gray-400 text-xs">USV Tokens</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur rounded-3xl p-4 border border-orange-500/30">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">Streak</span>
          </div>
          <p className="text-white text-2xl font-bold">{kpiData.streakDays}</p>
          <p className="text-gray-400 text-xs">Days</p>
        </div>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6"
      >
        <Tabs defaultValue="claims" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700/30">
            <TabsTrigger value="claims" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Claims</TabsTrigger>
            <TabsTrigger value="tokens" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Tokens</TabsTrigger>
            <TabsTrigger value="stakes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Stakes</TabsTrigger>
          </TabsList>

          {/* Timeframe Selector */}
          <div className="flex space-x-2">
            {(['week', 'month', 'year'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? 'default' : 'outline'}
                onClick={() => setTimeframe(period)}
                className={`capitalize rounded-2xl ${
                  timeframe === period
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
                data-testid={`timeframe-${period}`}
              >
                {period}
              </Button>
            ))}
          </div>

          <TabsContent value="claims" className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700/30">
              <h3 className="text-white font-semibold mb-4">QR Code Claims</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getCurrentData()}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Line 
                      type="monotone" 
                      dataKey="claims" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700/30">
              <h3 className="text-white font-semibold mb-4">Tokens Earned</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCurrentData()}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Bar dataKey="tokens" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stakes" className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700/30">
              <h3 className="text-white font-semibold mb-4">Staking Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getCurrentData()}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                    <Line 
                      type="monotone" 
                      dataKey="stakes" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Performance Summary */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700/30"
        >
          <h3 className="text-white font-semibold mb-4">Performance Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Average Daily Claims</span>
              <span className="text-white font-semibold">{kpiData.averageDaily}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Best Performance Day</span>
              <div className="text-right">
                <p className="text-white font-semibold">{kpiData.bestDay.claims} claims</p>
                <p className="text-gray-400 text-sm">{kpiData.bestDay.date}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Global Ranking</span>
              <span className="text-white font-semibold">#{kpiData.rankPosition} of {kpiData.totalUsers.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}