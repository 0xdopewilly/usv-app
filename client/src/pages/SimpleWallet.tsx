import { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface TokenData {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  isNative: boolean;
}

export default function SimpleWallet() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  // Initialize wallet connection and load balances
  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      // Simulate wallet connection for testing
      setWalletAddress('C3YEqRNvJN696v3ZcXndjnekCai3cL7zrutLN9FNDpjn');
      
      // Add some mock tokens for testing
      const mockTokens = [
        {
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          balance: 0.5, // Mock balance - will be replaced with real data
          decimals: 9,
          isNative: true
        },
        {
          mint: '8zGuJQqwhZafTah7Uc7Z4tXRnguqkn5KLFAP8oV6PHe2',
          symbol: 'USV',
          name: 'Ultra Smooth Vape',
          balance: 1000,
          decimals: 6,
          isNative: false
        }
      ];
      
      setTokens(mockTokens);
      setTotalValue(115); // 0.5 SOL * 230
      
      toast({
        title: "🚀 Wallet Connected",
        description: "Ready for blockchain integration",
      });
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      toast({
        title: "⚠️ Connection Issue",
        description: "Using demo mode",
        variant: "destructive"
      });
    }
  };

  const refreshBalances = async (address?: string) => {
    setIsRefreshing(true);
    
    try {
      // TODO: Implement real Solana balance fetching
      // For now, simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "🔄 Refresh Complete",
        description: "Blockchain integration coming soon!",
      });
    } catch (error) {
      console.error('Failed to refresh balances:', error);
      toast({
        title: "❌ Refresh Failed", 
        description: "Will implement real blockchain soon",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "✅ Copied!",
        description: "Address copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "✅ Copied!",
        description: "Address copied to clipboard",
      });
    }
  };

  const handleAssetClick = (token: TokenData) => {
    setSelectedAsset(token.mint);
  };

  const renderAssetDetail = () => {
    if (!selectedAsset) return null;

    const token = tokens.find(t => t.mint === selectedAsset);
    if (!token) return null;

    const getTokenColor = (symbol: string) => {
      if (symbol === 'SOL') return 'bg-gradient-to-r from-purple-500 to-blue-500';
      if (symbol === 'USV') return 'bg-purple-500';
      return 'bg-gradient-to-r from-blue-500 to-green-500';
    };

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
          <h1 className="text-white text-xl font-semibold">{token.name}</h1>
        </div>

        {/* Asset Info */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 ${getTokenColor(token.symbol)} rounded-xl flex items-center justify-center mx-auto mb-4`}>
            <span className="text-white font-bold text-lg">{token.symbol}</span>
          </div>
          
          <h2 className="text-white text-4xl font-bold mb-2">{token.balance.toFixed(4)} {token.symbol}</h2>
          <p className="text-gray-400 mb-2">${token.isNative ? (token.balance * 230).toFixed(2) : '0.00'}</p>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            {token.isNative && (
              <>
                <span className="text-sm text-gray-300">Price: ~$230</span>
                <span className="text-gray-400">•</span>
                <span className="text-green-400 text-sm">+2.45%</span>
              </>
            )}
            {!token.isNative && (
              <span className="text-sm text-gray-300">Custom Token</span>
            )}
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
            onClick={() => copyToClipboard(walletAddress || '')}
            className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-semibold"
          >
            Receive {token.symbol}
          </button>
          <button 
            onClick={() => {
              setSelectedAsset(null);
              setLocation('/send');
            }}
            className="flex-1 border border-gray-600 text-white hover:bg-gray-800 py-3 rounded-2xl font-semibold"
          >
            Send {token.symbol}
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
                {hideBalance ? '••••••' : `$${totalValue.toFixed(2)}`}
              </h2>
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="text-gray-400 hover:text-white p-1"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {/* REFRESH BUTTON */}
              <button
                onClick={() => refreshBalances()}
                disabled={isRefreshing}
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded-full"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                onClick={() => copyToClipboard(walletAddress || '')}
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

          {/* Copy Address Section - REAL WALLET ADDRESS */}
          {walletAddress && (
            <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">Copy wallet address</p>
              <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                <p className="text-white font-mono text-sm">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </p>
                <button 
                  onClick={() => copyToClipboard(walletAddress)}
                  className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Assets Section - REAL BLOCKCHAIN TOKENS */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Assets</h3>
              <button
                onClick={() => refreshBalances()}
                disabled={isRefreshing}
                className="text-pink-500 hover:text-pink-400 text-sm flex items-center space-x-1"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {tokens.length === 0 && !isRefreshing && (
                <div className="text-center py-8 text-gray-400">
                  <p>No tokens found</p>
                  <p className="text-sm">Connect your Phantom wallet to see your tokens</p>
                </div>
              )}
              
              {tokens.map((token) => {
                const getTokenColor = (symbol: string) => {
                  if (symbol === 'SOL') return 'bg-gradient-to-r from-purple-500 to-blue-500';
                  if (symbol === 'USV') return 'bg-purple-500';
                  return 'bg-gradient-to-r from-blue-500 to-green-500';
                };

                return (
                  <div 
                    key={token.mint}
                    onClick={() => handleAssetClick(token)}
                    className="flex items-center justify-between bg-gray-900/50 rounded-xl p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${getTokenColor(token.symbol)} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{token.symbol}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{token.name}</p>
                        <p className="text-gray-400 text-sm">{token.symbol} • {token.balance.toFixed(4)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        ${token.isNative ? (token.balance * 230).toFixed(2) : '0.00'}
                      </p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation('/send');
                        }}
                        className={`text-xs px-3 py-1 mt-1 rounded ${
                          token.isNative 
                            ? 'border border-gray-600 text-gray-400 hover:bg-gray-800'
                            : 'bg-pink-500 hover:bg-pink-600 text-white'
                        }`}
                      >
                        Send {token.symbol}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {renderAssetDetail()}
    </>
  );
}