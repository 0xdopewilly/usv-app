import { useState } from 'react';
import { ArrowLeft, Copy, Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SimpleWallet() {
  const [, setLocation] = useLocation();
  const [hideBalance, setHideBalance] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white relative pb-20">
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
              {hideBalance ? '••••••' : '$0.000'}
            </h2>
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="text-gray-400 hover:text-white p-1"
            >
              {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-green-400 text-sm">+9.18%</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300">$1.24</span>
          </div>

          {/* Receive and Send Buttons */}
          <div className="flex space-x-4 mb-6">
            <button className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-semibold">
              Receive
            </button>
            <button 
              onClick={() => setLocation('/send')}
              className="flex-1 border border-gray-600 text-white hover:bg-gray-800 py-3 rounded-2xl font-semibold"
            >
              Send
            </button>
          </div>
        </div>

        {/* Copy Address Section */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-sm mb-2">Copy USV address</p>
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
            <p className="text-white font-mono text-sm">
              C3YEqRNvJN696v3ZcXndjnekCai3cL7z...
            </p>
            <button className="text-gray-400 hover:text-white p-2">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Assets Section */}
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold mb-4">Assets</h3>
          <div className="space-y-3">
            {/* USV Token Asset */}
            <div className="flex items-center justify-between bg-gray-900/50 rounded-xl p-4 cursor-pointer hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">USV</span>
                </div>
                <div>
                  <p className="text-white font-medium">Ultra Smooth Vape</p>
                  <p className="text-gray-400 text-sm">USV • 0.0000</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">$0.00</p>
                <button 
                  onClick={() => setLocation('/send')}
                  className="bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1 mt-1 rounded"
                >
                  Send USV
                </button>
              </div>
            </div>

            {/* SOL Asset */}
            <div className="flex items-center justify-between bg-gray-900/50 rounded-xl p-4 cursor-pointer hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SOL</span>
                </div>
                <div>
                  <p className="text-white font-medium">Solana</p>
                  <p className="text-gray-400 text-sm">SOL • 0.0000</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">$0.00</p>
                <button 
                  onClick={() => setLocation('/send')}
                  className="border border-gray-600 text-gray-400 text-xs px-3 py-1 mt-1 rounded hover:bg-gray-800"
                >
                  Send SOL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Placeholder */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around py-3">
          <button onClick={() => setLocation('/')} className="text-gray-400 hover:text-white p-2">
            🏠
          </button>
          <button onClick={() => setLocation('/wallet')} className="text-pink-500 p-2">
            💳
          </button>
          <button onClick={() => setLocation('/nft-portfolio')} className="text-gray-400 hover:text-white p-2">
            🖼️
          </button>
          <button onClick={() => setLocation('/settings')} className="text-gray-400 hover:text-white p-2">
            ⚙️
          </button>
        </div>
      </div>
    </div>
  );
}