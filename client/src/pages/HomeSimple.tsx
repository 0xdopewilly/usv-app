import { useState } from 'react';
import { useLocation } from 'wouter';
import { MoreHorizontal, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/lib/auth';

export default function HomeSimple() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [balance] = useState(1250.75); // Static balance for now
  const [usvPrice] = useState(0.2034); // Static USV price
  const [solPrice] = useState(142.85); // Static SOL price

  return (
    <div className="min-h-screen bg-black relative pb-20">
      <BottomNavigation />
      
      {/* Header with Profile */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/30 cursor-pointer bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center"
              onClick={() => setLocation('/settings')}
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user?.fullName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">{user?.fullName?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div>
              <p className="text-white/90 text-sm">Welcome back,</p>
              <p className="text-white font-semibold text-base">{user?.fullName?.split(' ')[0] || 'User'}</p>
            </div>
          </div>
          <div 
            className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center cursor-pointer"
            onClick={() => setLocation('/settings')}
          >
            <MoreHorizontal className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Main Balance */}
      <div className="px-6 pb-6">
        <div className="text-center">
          <h1 className="text-white text-5xl font-bold mb-3">
            ${balance.toFixed(2)}
          </h1>
          <p className="text-green-400 text-lg">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            +$24.32 (2.3%) today
          </p>
        </div>
      </div>

      {/* Portfolio Cards */}
      <div className="px-6 space-y-4">
        
        {/* USV Token Card */}
        <Card className="bg-gray-900/50 border-purple-500/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">USV</span>
                </div>
                <span>USV Token</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${usvPrice.toFixed(4)}</p>
                <p className="text-green-400 text-sm">+12.5%</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Balance</p>
                <p className="text-white font-semibold">6,150 USV</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Value</p>
                <p className="text-white font-semibold">${(6150 * usvPrice).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solana Card */}
        <Card className="bg-gray-900/50 border-cyan-500/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SOL</span>
                </div>
                <span>Solana</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${solPrice.toFixed(2)}</p>
                <p className="text-red-400 text-sm">-3.2%</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Balance</p>
                <p className="text-white font-semibold">3.25 SOL</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Value</p>
                <p className="text-white font-semibold">${(3.25 * solPrice).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button 
            onClick={() => setLocation('/wallet')}
            className="bg-purple-600 hover:bg-purple-700 text-white py-6 rounded-2xl flex flex-col items-center space-y-2"
            data-testid="button-wallet"
          >
            <Wallet className="w-6 h-6" />
            <span>Wallet</span>
          </Button>
          
          <Button 
            onClick={() => setLocation('/send')}
            className="bg-gray-800 hover:bg-gray-700 text-white py-6 rounded-2xl flex flex-col items-center space-y-2"
            data-testid="button-send"
          >
            <DollarSign className="w-6 h-6" />
            <span>Send</span>
          </Button>
        </div>

        {/* Recent Activity */}
        <Card className="bg-gray-900/50 border-gray-700/50 text-white mt-6">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Received USV</p>
                  <p className="text-gray-400 text-sm">2 hours ago</p>
                </div>
                <p className="text-green-400 font-semibold">+500 USV</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">Sent SOL</p>
                  <p className="text-gray-400 text-sm">1 day ago</p>
                </div>
                <p className="text-red-400 font-semibold">-0.5 SOL</p>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">QR Scan Reward</p>
                  <p className="text-gray-400 text-sm">2 days ago</p>
                </div>
                <p className="text-green-400 font-semibold">+100 USV</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}