import { useState } from 'react';
import { ArrowLeft, Copy, Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/BottomNavigation';

export default function SimpleWallet() {
  const [, setLocation] = useLocation();
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Address copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Address copied to clipboard!');
    }
  };

  const handleAssetClick = (assetType: string) => {
    setSelectedAsset(assetType);
  };

  const renderAssetDetail = () => {
    if (!selectedAsset) return null;

    const assetData = {
      USV: {
        name: 'Ultra Smooth Vape',
        symbol: 'USV',
        balance: '0.0000',
        value: '$0.00',
        price: '$1.24',
        change: '+9.18%',
        color: 'bg-purple-500'
      },
      SOL: {
        name: 'Solana',
        symbol: 'SOL',
        balance: '0.0000',
        value: '$0.00',
        price: '$215.58',
        change: '+2.45%',
        color: 'bg-gradient-to-r from-purple-500 to-blue-500'
      }
    };

    const asset = assetData[selectedAsset as keyof typeof assetData];
    if (!asset) return null;

    return (
      <div className="fixed inset-0 bg-black z-50 p-6">
        {/* Header */}
        <div className="flex items-center mb-8 pt-6">
          <button
            onClick={() => setSelectedAsset(null)}
            className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10 flex items-center justify-center mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white text-xl font-semibold">{asset.name}</h1>
        </div>

        {/* Asset Info */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${asset.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
            <span className="text-white font-bold text-lg">{asset.symbol}</span>
          </div>
          
          <h2 className="text-white text-4xl font-bold mb-2">{asset.balance} {asset.symbol}</h2>
          <p className="text-gray-400 mb-2">{asset.value}</p>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-sm text-gray-300">Price: {asset.price}</span>
            <span className="text-gray-400">•</span>
            <span className="text-green-400 text-sm">{asset.change}</span>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
          <div className="h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Price Chart Coming Soon</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mb-6">
          <button 
            onClick={() => copyToClipboard('C3YEqRNvJN696v3ZcXndjnekCai3cL7zrutLN9FNDpjn')}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-semibold"
          >
            Receive {asset.symbol}
          </button>
          <button 
            onClick={() => {
              setSelectedAsset(null);
              setLocation('/send');
            }}
            className="flex-1 border border-gray-600 text-white hover:bg-gray-800 py-3 rounded-2xl font-semibold"
          >
            Send {asset.symbol}
          </button>
        </div>
      </div>
    );
  };

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
              <button 
                onClick={() => copyToClipboard('C3YEqRNvJN696v3ZcXndjnekCai3cL7zrutLN9FNDpjn')}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-semibold"
              >
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

          {/* Copy Address Section - FIXED COPY BUTTON */}
          <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-sm mb-2">Copy USV address</p>
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
              <p className="text-white font-mono text-sm">
                C3YEqRNvJN696v3ZcXndjnekCai3cL7z...
              </p>
              <button 
                onClick={() => copyToClipboard('C3YEqRNvJN696v3ZcXndjnekCai3cL7zrutLN9FNDpjn')}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assets Section - FIXED CLICKABLE ASSETS */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-4">Assets</h3>
            <div className="space-y-3">
              {/* USV Token Asset - NOW CLICKABLE */}
              <div 
                onClick={() => handleAssetClick('USV')}
                className="flex items-center justify-between bg-gray-900/50 rounded-xl p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              >
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation('/send');
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1 mt-1 rounded"
                  >
                    Send USV
                  </button>
                </div>
              </div>

              {/* SOL Asset - NOW CLICKABLE */}
              <div 
                onClick={() => handleAssetClick('SOL')}
                className="flex items-center justify-between bg-gray-900/50 rounded-xl p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              >
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation('/send');
                    }}
                    className="border border-gray-600 text-gray-400 text-xs px-3 py-1 mt-1 rounded hover:bg-gray-800"
                  >
                    Send SOL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {renderAssetDetail()}
    </>
  );
}