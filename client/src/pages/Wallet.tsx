import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, TrendingUp, TrendingDown, Eye, EyeOff, Wallet as WalletIcon, ExternalLink, Send, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNavigation from '@/components/BottomNavigation';
import { realTimePriceService, AllPricesResponse } from '@/lib/realTimePrices';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { solanaService, phantomWallet, isPhantomInstalled } from '@/lib/solana';
import { useTranslation } from 'react-i18next';

// New USV Logo
import usvLogo from '@assets/image_1757431326277.png';

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
  const { t } = useTranslation();
  const [hideBalance, setHideBalance] = useState(false);
  const [prices, setPrices] = useState<AllPricesResponse | null>(null);
  const [usvChartData, setUsvChartData] = useState(generatePriceChart(0));
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [activeTab, setActiveTab] = useState<'assets' | 'history'>('assets');
  
  // Real Solana Integration States
  const [phantomConnected, setPhantomConnected] = useState(false);
  const [phantomAddress, setPhantomAddress] = useState<string | null>(null);
  const [phantomBalance, setPhantomBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [realSolBalance, setRealSolBalance] = useState(0);
  
  // Real-time SOL and USV balance fetching
  const { data: walletBalance, refetch: refetchBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance', user?.walletAddress],
    queryFn: async () => {
      if (!user?.walletAddress) return null;
      console.log('🔍 Fetching balance for:', user.walletAddress);
      const response = await fetch(`/api/wallet/balance/${user.walletAddress}`);
      if (!response.ok) throw new Error('Failed to fetch balance');
      const data = await response.json();
      console.log('💰 Balance API Response:', data);
      return data;
    },
    enabled: !!user?.walletAddress,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  const timeframes = ['1d', '7d', '1m', '1y'];

  // Setup real-time price updates and blockchain integration
  useEffect(() => {
    const unsubscribe = realTimePriceService.subscribe((newPrices) => {
      setPrices(newPrices);
      if (newPrices.USV?.price) {
        setUsvChartData(generatePriceChart(newPrices.USV.price));
      }
    });

    realTimePriceService.startRealTimeUpdates(5000);
    checkPhantomConnection();

    return () => {
      unsubscribe();
      realTimePriceService.stopRealTimeUpdates();
    };
  }, []);

  // Calculate balances from real-time API data
  const currentSolBalance = walletBalance?.balanceSOL || 0;
  const usvTokens = walletBalance?.balanceUSV || 0; // Real USV balance from blockchain
  
  // Debug logging
  console.log('💰 Wallet Balance Data:', {
    walletBalance,
    usvTokens,
    currentSolBalance,
    prices
  });
  
  const usvValue = usvTokens * (prices?.USV?.price || 0);
  const solValue = currentSolBalance * (prices?.SOL?.price || 23.45);
  const totalBalance = solValue + usvValue;
  
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
      const result = await solanaService.transferSOL(user.walletAddress, 0.01);
      
      toast({
        title: "🎉 Transfer Successful!",
        description: "0.01 SOL transferred to your app wallet",
      });
      
      // Update balances
      setTimeout(async () => {
        const newBalance = await phantomWallet.getBalance();
        setPhantomBalance(newBalance);
        refetchBalance(); // Refresh API balance
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

  // Remove duplicate variable declarations - already defined above

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
          <motion.div
            whileHover={{ 
              scale: 1.1,
              rotate: -5,
              boxShadow: "0 8px 25px rgba(236, 72, 153, 0.4)"
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          <h1 className="text-white text-lg font-semibold">Ultra Smooth Vape</h1>
          <div className="text-gray-400 text-sm">USV</div>
        </div>
      </motion.div>

      {/* Main Wallet Balance Section */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6 pb-6"
      >
        {/* Main Balance Display */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/usv-logo.png" alt="USV" className="w-12 h-12 rounded-xl object-contain" />
            <h2 className="text-white text-4xl font-bold" data-testid="text-app-balance">
              {hideBalance ? '••••••' : `$${totalBalance.toFixed(3)}`}
            </h2>
            <div className="text-center">
              <div className="text-gray-400 text-xs">💰 Real-time mainnet balance</div>
              <div className="text-electric-blue text-xs">{currentSolBalance.toFixed(4)} SOL</div>
            </div>
            <motion.div
              whileHover={{ 
                scale: 1.1,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 15px rgba(255, 255, 255, 0.2)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHideBalance(!hideBalance)}
                className="text-gray-400 hover:text-white p-1"
                data-testid="button-toggle-balance"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </motion.div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className={`text-sm flex items-center ${
              (prices?.USV?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {(prices?.USV?.change24h || 0) >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              +{Math.abs(prices?.USV?.change24h || 9.18).toFixed(2)}%
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-300">${prices?.USV?.price?.toFixed(2) || '1.24'}</span>
          </div>

          {/* FIXED: Receive and Send Buttons (was showing "Sent" before) */}
          <div className="flex space-x-4 mb-6">
            <motion.div
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 8px 25px rgba(236, 72, 153, 0.4), 0 4px 15px rgba(236, 72, 153, 0.3)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex-1"
            >
              <Button
                onClick={() => {
                  copyAddress(user?.walletAddress || '', 'USV wallet');
                  toast({
                    title: "Receive Address Copied!",
                    description: "Share this address to receive USV tokens and SOL",
                  });
                }}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-semibold"
                data-testid="button-receive"
              >
                {t('wallet.receive')}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ 
                scale: 1.02,
                borderColor: "rgba(255, 255, 255, 0.4)",
                boxShadow: "0 4px 15px rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex-1"
            >
              <Button
                onClick={() => setLocation('/send')}
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-800 py-3 rounded-2xl font-semibold"
                data-testid="button-send"
              >
                {t('wallet.send')}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Price Chart Section */}
        <Card className="bg-gray-900/50 border-gray-700/50 p-6 mb-6">
          <div className="flex space-x-2 mb-4">
            {timeframes.map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`flex-1 text-xs ${
                  selectedTimeframe === timeframe 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                data-testid={`button-timeframe-${timeframe}`}
              >
                {timeframe}
              </Button>
            ))}
          </div>

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
        </Card>

        {/* Copy USV Address Section */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-sm mb-2">{t('wallet.yourWalletAddress')}</p>
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
            <p className="text-white font-mono text-sm" data-testid="text-usv-address">
              {user?.walletAddress || 'No wallet address'}
            </p>
            <motion.div
              whileHover={{ 
                scale: 1.1,
                backgroundColor: "rgba(34, 211, 238, 0.2)",
                boxShadow: "0 4px 15px rgba(34, 211, 238, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyAddress(user?.walletAddress || '', 'USV wallet')}
                className="text-gray-400 hover:text-white p-2"
                data-testid="button-copy-usv-address"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* TABS FOR ASSETS AND HISTORY - SIMPLE TOGGLE */}
        <div className="flex space-x-2 mb-6 bg-gray-800 p-2 rounded-xl border-2 border-pink-500">
          <Button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 h-12 font-bold text-base rounded-lg transition-all ${
              activeTab === 'assets'
                ? 'bg-pink-500 text-white hover:bg-pink-600'
                : 'bg-transparent text-white hover:bg-gray-700'
            }`}
            data-testid="tab-assets"
          >
            💰 ASSETS
          </Button>
          <Button
            onClick={() => setActiveTab('history')}
            className={`flex-1 h-12 font-bold text-base rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-pink-500 text-white hover:bg-pink-600'
                : 'bg-transparent text-white hover:bg-gray-700'
            }`}
            data-testid="tab-history"
          >
            📜 HISTORY
          </Button>
        </div>

        {/* ASSETS VIEW */}
        {activeTab === 'assets' && (
          <div>
            {/* Stake and Pods Buttons */}
            <div className="flex space-x-4 mb-6">
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-white hover:bg-gray-800 py-3 rounded-2xl font-semibold"
                data-testid="button-stake"
              >
                Stake
              </Button>
              <Button
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-semibold"
                data-testid="button-pods"
              >
                Pods
              </Button>
            </div>

            {/* Assets Section */}
            <div className="mb-6">
              <h3 className="text-white text-lg font-semibold mb-4">{t('wallet.assets')}</h3>
          <div className="space-y-3">
            {/* USV Token Asset - CLICKABLE with SEND button */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                toast({
                  title: "USV Token",
                  description: `Balance: ${usvTokens.toFixed(4)} USV ($${totalBalance.toFixed(2)})`,
                });
              }}
              className="flex items-center justify-between bg-gray-900/50 rounded-xl p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              data-testid="asset-usv"
            >
              <div className="flex items-center space-x-3">
                <img src="/usv-logo.png" alt="USV" className="w-10 h-10 rounded-lg object-contain" />
                <div>
                  <p className="text-white font-medium">Ultra Smooth Vape</p>
                  <p className="text-gray-400 text-sm">USV • {usvTokens.toFixed(4)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">${usvValue.toFixed(2)}</p>
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocation('/send');
                    }}
                    size="sm"
                    className="bg-pink-500 hover:bg-pink-600 text-white text-xs px-3 py-1 mt-1"
                    data-testid="button-send-usv"
                  >
                    {t('wallet.send')} USV
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* SOL Asset - LIVE MAINNET BALANCE with SEND functionality */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                toast({
                  title: "Solana (SOL)",
                  description: `Live mainnet balance: ${currentSolBalance.toFixed(4)} SOL`,
                });
              }}
              className="flex items-center justify-between bg-gray-900/50 rounded-xl p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              data-testid="asset-sol"
            >
              <div className="flex items-center space-x-3">
                <img 
                  src="/solana-logo.png?v=2" 
                  alt="Solana" 
                  className="w-10 h-10 object-contain rounded-lg" 
                  onError={(e) => {
                    console.error('Solana logo failed to load');
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = `
                      <div class="w-10 h-10 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-xs">◆</span>
                      </div>
                    `;
                  }}
                />
                <div>
                  <p className="text-white font-medium">Solana</p>
                  <p className="text-gray-400 text-sm">SOL • {currentSolBalance.toFixed(4)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold">${solValue.toFixed(2)}</p>
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: currentSolBalance > 0 
                      ? "0 4px 15px rgba(59, 130, 246, 0.4)" 
                      : "0 4px 15px rgba(107, 114, 128, 0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentSolBalance > 0) {
                        setLocation('/send');
                      } else {
                        toast({
                          title: "Send SOL",
                          description: "Send SOL to your USV wallet first to see balance and send",
                          variant: "default",
                        });
                      }
                    }}
                    size="sm"
                    className={`text-xs px-3 py-1 mt-1 ${
                      currentSolBalance > 0 
                        ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                        : 'border border-gray-600 text-gray-400 hover:bg-gray-800'
                    }`}
                    data-testid="button-send-sol"
                  >
                    {t('wallet.send')} SOL
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

            {/* Show Your Auto-Generated Wallet Info (for email/Apple users) */}
            {user?.walletAddress && (
              <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <WalletIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Your USV Wallet</h3>
                      <p className="text-gray-400 text-xs">Auto-generated Solana wallet</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs">Active</span>
                  </div>
                </div>
                
                <div className="bg-black/30 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-400">Live Mainnet Balance</p>
                    <p className="text-white font-semibold" data-testid="text-usv-wallet-balance">
                      {currentSolBalance.toFixed(4)} SOL
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-mono text-sm" data-testid="text-usv-wallet-address">
                      {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-8)}
                    </p>
                    <motion.div
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: "rgba(59, 130, 246, 0.2)",
                        boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAddress(user.walletAddress || '', 'USV Wallet')}
                        className="text-blue-400 hover:bg-blue-500/20 p-1"
                        data-testid="button-copy-usv-wallet-address"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
                
                <div className="text-center py-4">
                  <div className="text-green-400 text-sm mb-2">✅ Your wallet is ready!</div>
                  <p className="text-gray-400 text-xs">
                    This wallet was auto-generated when you signed up. Send SOL to this address to see real-time balance updates.
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* HISTORY VIEW */}
        {activeTab === 'history' && (
          <div>
            <TransactionHistoryContent />
          </div>
        )}
        
        {/* REMOVED: No Phantom wallet section for email users */}
      </motion.div>

      {/* REMOVED: No Phantom install prompts for email users */}
    </div>
  );
}

// Transaction History Component for the History Tab
function TransactionHistoryContent() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();

  interface Transaction {
    id: string;
    type: 'send' | 'receive' | 'claim' | 'stake' | 'unstake';
    amount: number;
    token: string;
    status: 'completed' | 'pending' | 'failed';
    toAddress?: string;
    fromAddress?: string;
    txHash?: string;
    createdAt: string;
  }

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/transactions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) return 'Today';
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receive':
      case 'claim':
        return <ArrowDownLeft className="w-5 h-5 text-green-400" />;
      case 'send':
        return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'stake':
      case 'unstake':
        return <Clock className="w-5 h-5 text-blue-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'receive':
      case 'claim':
        return 'text-green-400';
      case 'send':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg mb-2">{t('history.noTransactions')}</p>
        <p className="text-gray-500 text-sm">{t('history.noTransactionsDescription')}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction: Transaction, index: number) => (
        <motion.div
          key={transaction.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-gray-900/50 rounded-xl p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
          onClick={() => {
            if (transaction.txHash) {
              window.open(`https://solscan.io/tx/${transaction.txHash}`, '_blank');
            }
          }}
          data-testid={`transaction-${transaction.id}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center">
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className="text-white font-medium capitalize">{transaction.type}</p>
                <p className="text-gray-400 text-sm">
                  {formatDate(transaction.createdAt)} • {formatTime(transaction.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                {transaction.type === 'send' ? '-' : '+'}{transaction.amount.toFixed(4)} {transaction.token}
              </p>
              <p className="text-gray-400 text-xs capitalize">{transaction.status}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}