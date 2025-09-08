import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, TrendingUp, TrendingDown, Eye, EyeOff, Wallet as WalletIcon, ExternalLink, Zap, Send } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BottomNavigation from '@/components/BottomNavigation';
import { realTimePriceService, AllPricesResponse } from '@/lib/realTimePrices';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { solanaService, phantomWallet, isPhantomInstalled } from '@/lib/solana';
// Using a fallback since logo file needs to be placed in assets
const usvLogo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM4QjVDRjYiLz4KPHB0aCBkPSJNMTYgMjBoMTJMMjQgMzIgMTYgMjB6IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=';

// Real-time chart data based on actual prices
const generatePriceChart = (currentPrice: number) => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: i,
    value: currentPrice + Math.sin(i * 0.3) * (currentPrice * 0.02) + Math.random() * (currentPrice * 0.01) - (currentPrice * 0.005)
  }));
};

export default function Wallet() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [hideBalance, setHideBalance] = useState(false);
  const [prices, setPrices] = useState<AllPricesResponse | null>(null);
  const [usvChartData, setUsvChartData] = useState(generatePriceChart(0.20));
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  
  // Phantom Wallet States
  const [phantomConnected, setPhantomConnected] = useState(false);
  const [phantomAddress, setPhantomAddress] = useState<string | null>(null);
  const [phantomBalance, setPhantomBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const timeframes = ['1d', '7d', '1m', '1y'];

  // Real-time price updates
  useEffect(() => {
    const unsubscribe = realTimePriceService.subscribe((newPrices) => {
      setPrices(newPrices);
      
      // Update charts with real price data
      if (newPrices.USV?.price) {
        setUsvChartData(generatePriceChart(newPrices.USV.price));
      }
    });

    realTimePriceService.startRealTimeUpdates(5000); // Update every 5 seconds
    
    // Check Phantom connection on mount
    checkPhantomConnection();

    return () => {
      unsubscribe();
      realTimePriceService.stopRealTimeUpdates();
    };
  }, []);
  
  const checkPhantomConnection = async () => {
    if (phantomWallet.isConnected && phantomWallet.publicKey) {
      setPhantomConnected(true);
      setPhantomAddress(phantomWallet.publicKey.toString());
      const balance = await phantomWallet.getBalance();
      setPhantomBalance(balance);
    }
  };
  
  // REAL Phantom Wallet Connection
  const connectPhantomWallet = async () => {
    if (!isPhantomInstalled()) {
      toast({
        title: "🦄 Phantom Not Installed",
        description: "Please install the Phantom browser extension to continue.",
        variant: "destructive",
      });
      // Open Phantom website
      window.open('https://phantom.app/', '_blank');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await phantomWallet.connect();
      if (result.success) {
        setPhantomConnected(true);
        setPhantomAddress(result.publicKey!);
        const balance = await phantomWallet.getBalance();
        setPhantomBalance(balance);
        
        toast({
          title: "🦄 Phantom Connected!",
          description: `Connected to ${result.publicKey!.slice(0, 8)}...${result.publicKey!.slice(-8)}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect to Phantom wallet",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to Phantom",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const disconnectPhantomWallet = async () => {
    await phantomWallet.disconnect();
    setPhantomConnected(false);
    setPhantomAddress(null);
    setPhantomBalance(0);
    
    toast({
      title: "Phantom Disconnected",
      description: "Phantom wallet has been disconnected",
    });
  };

  const copyAddress = async (address: string, type: string) => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied!",
        description: `${type} address copied to clipboard`,
      });
    }
  };

  // Transfer from Phantom to App Wallet
  const transferToAppWallet = async () => {
    if (!phantomConnected || !phantomAddress || !user?.walletAddress) return;
    
    setIsLoading(true);
    try {
      // Transfer a small amount (0.01 SOL) to app wallet
      const result = await solanaService.transferSOL(user.walletAddress, 0.01);
      
      toast({
        title: "🎉 Transfer Successful!",
        description: "0.01 SOL transferred to your app wallet",
      });
      
      // Update balances
      setTimeout(async () => {
        const newBalance = await phantomWallet.getBalance();
        setPhantomBalance(newBalance);
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer SOL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalBalance = user?.balance || 0;
  const usvTokens = totalBalance / (prices?.USV?.price || 0.20);

  return (
    <div className="min-h-screen bg-black relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-6"
      >
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-white text-lg font-semibold">Ultra Smooth Vape</h1>
          <div className="text-gray-400 text-sm">USV</div>
        </div>
      </motion.div>

      {/* App Wallet Balance Section */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 pb-6"
      >
        <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/20 p-6 mb-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img src={usvLogo} alt="USV" className="w-12 h-12 rounded-xl" />
              <h2 className="text-white text-4xl font-bold" data-testid="text-app-balance">
                {hideBalance ? '••••••' : `$${totalBalance.toFixed(3)}`}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHideBalance(!hideBalance)}
                className="text-gray-400 hover:text-white p-1"
                data-testid="button-toggle-balance"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="text-center text-gray-300 mb-4">
              <p className="text-sm">
                {usvTokens.toFixed(2)} USV tokens ≈ ${prices?.USV?.price?.toFixed(4) || '0.0000'}/token
              </p>
              <p className="text-xs text-gray-400 mt-1">App Wallet</p>
            </div>
            
            {/* App Wallet Address */}
            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-400 mb-2">App Wallet Address</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono text-sm" data-testid="text-app-address">
                  {user?.walletAddress ? 
                    `${user.walletAddress.slice(0, 8)}...${user.walletAddress.slice(-8)}` : 
                    'No wallet address'
                  }
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyAddress(user?.walletAddress || '', 'App wallet')}
                  className="text-pink-500 hover:bg-pink-500/20 p-1"
                  data-testid="button-copy-app-address"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Phantom Wallet Section */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Phantom Wallet</h3>
                <p className="text-gray-400 text-xs">External wallet connection</p>
              </div>
            </div>
            
            {phantomConnected ? (
              <Button
                onClick={disconnectPhantomWallet}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                data-testid="button-disconnect-phantom"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={connectPhantomWallet}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                data-testid="button-connect-phantom"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Connect Phantom'
                )}
              </Button>
            )}
          </div>
          
          {phantomConnected && phantomAddress ? (
            <>
              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-400">Phantom Balance</p>
                  <p className="text-white font-semibold" data-testid="text-phantom-balance">
                    {phantomBalance.toFixed(4)} SOL
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-white font-mono text-sm" data-testid="text-phantom-address">
                    {phantomAddress.slice(0, 8)}...{phantomAddress.slice(-8)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyAddress(phantomAddress, 'Phantom')}
                    className="text-blue-400 hover:bg-blue-500/20 p-1"
                    data-testid="button-copy-phantom-address"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Transfer Button */}
              <Button
                onClick={transferToAppWallet}
                disabled={isLoading || phantomBalance < 0.01}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                data-testid="button-transfer-to-app"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Transfer 0.01 SOL to App</span>
                  </div>
                )}
              </Button>
              
              {phantomBalance < 0.01 && (
                <p className="text-red-400 text-xs text-center mt-2">
                  Insufficient SOL balance for transfer
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <WalletIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-sm mb-2">Connect your Phantom wallet</p>
              <p className="text-gray-500 text-xs">
                Connect to transfer SOL and interact with the Solana blockchain
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Price Chart Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6 pb-6"
      >
        <Card className="bg-gray-900/50 border-gray-700/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img src={usvLogo} alt="USV" className="w-8 h-8 rounded-full" />
              <div>
                <h3 className="text-white font-semibold">USV Token</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-white">
                    ${prices?.USV?.price?.toFixed(4) || '0.0000'}
                  </span>
                  <span className={`text-sm flex items-center ${
                    (prices?.USV?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(prices?.USV?.change24h || 0) >= 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(prices?.USV?.change24h || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-32 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usvChartData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ec4899" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Timeframe Selection */}
          <div className="flex space-x-2">
            {timeframes.map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`flex-1 text-xs ${
                  selectedTimeframe === timeframe 
                    ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                data-testid={`button-timeframe-${timeframe}`}
              >
                {timeframe}
              </Button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Install Phantom CTA (if not installed) */}
      {!isPhantomInstalled() && (
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="px-6 pb-6"
        >
          <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/20 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <WalletIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Get Phantom Wallet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Install Phantom to connect your existing Solana wallet and transfer real tokens
              </p>
              <Button
                onClick={() => window.open('https://phantom.app/', '_blank')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                data-testid="button-install-phantom"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Install Phantom
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}