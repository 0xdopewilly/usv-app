import { useState } from 'react';
import { ArrowLeft, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/BottomNavigation';

export default function SimpleWalletTest() {
  const [, setLocation] = useLocation();
  const [hideBalance, setHideBalance] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-black text-white relative pb-20">
        <BottomNavigation />
        
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setLocation('/')}
              className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-white text-lg font-semibold">Ultra Smooth Vape</h1>
            <div className="text-gray-400 text-sm">USV</div>
          </div>
        </div>

        {/* Main Balance Section */}
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">USV</span>
              </div>
              <h2 className="text-white text-4xl font-bold">
                {hideBalance ? '••••••' : '$0.00'}
              </h2>
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="text-gray-400 hover:text-white p-1"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {/* TEST REFRESH BUTTON */}
              <button
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded-full"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-center text-gray-400">
            <p>🔧 Testing basic wallet UI...</p>
            <p>If you see this, the app is working!</p>
            <p>Solana integration loading...</p>
          </div>
        </div>
      </div>
    </>
  );
}