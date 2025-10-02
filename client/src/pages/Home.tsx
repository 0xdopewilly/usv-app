import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Download, RefreshCw, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import BottomNavigation from '@/components/BottomNavigation';
import { realTimePriceService, AllPricesResponse } from '@/lib/realTimePrices';
import { useAuth } from '@/lib/auth';

const solanaLogoSrc = '/solana-logo.png';
import usvLogoSrc from '@assets/image_1757431326277.png';

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [prices, setPrices] = useState<AllPricesResponse | null>(null);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  // Fetch real wallet balance from blockchain
  const { data: walletBalance, isLoading: balanceLoading } = useQuery({
    queryKey: ['wallet-balance', user?.walletAddress],
    queryFn: async () => {
      if (!user?.walletAddress) return null;
      const response = await fetch(`/api/wallet/balance/${user.walletAddress}`);
      if (!response.ok) throw new Error('Failed to fetch balance');
      return response.json();
    },
    enabled: !!user?.walletAddress,
    refetchInterval: 10000,
  });

  // Calculate total portfolio value in USD
  const totalPortfolioValue = walletBalance?.balanceSOL && prices?.SOL?.price ? 
    (walletBalance.balanceSOL * prices.SOL.price) : 0;

  // Setup real-time price updates
  useEffect(() => {
    const unsubscribe = realTimePriceService.subscribe((newPrices) => {
      setPrices(newPrices);
      setIsLoadingPrices(false);
    });

    realTimePriceService.startRealTimeUpdates(8000);

    return () => {
      unsubscribe();
      realTimePriceService.stopRealTimeUpdates();
    };
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--mint-bg)' }}>
      <BottomNavigation />
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {user?.walletAddress?.slice(0, 16)}...{user?.walletAddress?.slice(-4)}
          </p>
          <motion.button
            onClick={() => setLocation('/settings')}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}
          >
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={user?.fullName || 'User'}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-full" 
                   style={{ background: 'var(--mint-accent)' }}>
                <span className="text-white font-semibold text-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </motion.button>
        </div>
        
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          {user?.fullName || 'Gem Wallet'}
        </p>
      </div>

      {/* Balance Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 mb-6"
      >
        <div className="rounded-[32px] p-8" style={{ background: 'var(--white)', boxShadow: 'var(--shadow-lg)' }}>
          {isLoadingPrices || balanceLoading ? (
            <div className="skeleton h-16 w-48 rounded-lg mb-4"></div>
          ) : (
            <h1 className="text-balance mb-2">${totalPortfolioValue.toFixed(2)}</h1>
          )}
          
          <div className="flex items-center gap-2 mb-6">
            {prices?.SOL && (
              <div className="flex items-center gap-1">
                {prices.SOL.changePercent24h >= 0 ? (
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--success-green)' }} />
                ) : (
                  <TrendingDown className="w-4 h-4" style={{ color: 'var(--error-red)' }} />
                )}
                <span 
                  className="text-sm font-semibold"
                  style={{ color: prices.SOL.changePercent24h >= 0 ? 'var(--success-green)' : 'var(--error-red)' }}
                >
                  {prices.SOL.changePercent24h >= 0 ? '+' : ''}{prices.SOL.changePercent24h.toFixed(2)}%
                </span>
              </div>
            )}
            {walletBalance?.balanceSOL && (
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                ≈ {walletBalance.balanceSOL.toFixed(4)} SOL
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation('/send')}
              className="btn-secondary flex flex-col items-center gap-2 py-4"
              data-testid="button-send"
            >
              <Send className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              <span className="text-sm font-semibold">Send</span>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation('/wallet')}
              className="btn-secondary flex flex-col items-center gap-2 py-4"
              data-testid="button-receive"
            >
              <Download className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              <span className="text-sm font-semibold">Receive</span>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation('/wallet')}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl" 
              style={{ background: 'var(--gray-900)', color: 'white' }}
              data-testid="button-swap"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="text-sm font-semibold">Swap</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Assets Section */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Your Assets</h2>
          <button className="p-2">
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {/* USV Card */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/wallet')}
            className="rounded-[24px] p-4 cursor-pointer hover-lift transition-smooth"
            style={{ background: 'var(--lavender-card)' }}
            data-testid="card-usv"
          >
            <div className="w-10 h-10 rounded-2xl mb-3 p-2 flex items-center justify-center" 
                 style={{ background: 'rgba(255,255,255,0.5)' }}>
              <img src="/usv-logo.png" alt="USV" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>USV</p>
            {isLoadingPrices ? (
              <div className="skeleton h-5 w-16 rounded"></div>
            ) : (
              <>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  ${prices?.USV?.price?.toFixed(2) || '0.20'}
                </p>
                <div className="flex items-center gap-1">
                  <span 
                    className="text-xs font-semibold"
                    style={{ color: (prices?.USV?.changePercent24h || 0) >= 0 ? 'var(--success-green)' : 'var(--error-red)' }}
                  >
                    {(prices?.USV?.changePercent24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(prices?.USV?.changePercent24h || 0).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* Solana Card */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/wallet')}
            className="rounded-[24px] p-4 cursor-pointer hover-lift transition-smooth"
            style={{ background: 'var(--mint-card)' }}
            data-testid="card-solana"
          >
            <div className="w-10 h-10 rounded-2xl mb-3 p-2 flex items-center justify-center" 
                 style={{ background: 'rgba(255,255,255,0.5)' }}>
              <img src={solanaLogoSrc} alt="Solana" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Solana</p>
            {isLoadingPrices ? (
              <div className="skeleton h-5 w-16 rounded"></div>
            ) : (
              <>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  ${prices?.SOL?.price?.toFixed(2) || '224.75'}
                </p>
                <div className="flex items-center gap-1">
                  <span 
                    className="text-xs font-semibold"
                    style={{ color: (prices?.SOL?.changePercent24h || 0) >= 0 ? 'var(--success-green)' : 'var(--error-red)' }}
                  >
                    {(prices?.SOL?.changePercent24h || 0) >= 0 ? '▲' : '▼'} {Math.abs(prices?.SOL?.changePercent24h || 0).toFixed(1)}%
                  </span>
                </div>
              </>
            )}
          </motion.div>

          {/* Bitcoin Card */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="rounded-[24px] p-4 cursor-pointer hover-lift transition-smooth"
            style={{ background: 'var(--blue-card)' }}
            data-testid="card-bitcoin"
          >
            <div className="w-10 h-10 rounded-2xl mb-3 p-2 flex items-center justify-center" 
                 style={{ background: 'rgba(255,255,255,0.5)' }}>
              <div className="w-6 h-6 rounded-full" style={{ background: 'var(--warning-orange)' }}></div>
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>BTC</p>
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>$98,234</p>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--success-green)' }}>
                ▲ 2.3%
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Activity</h2>
        
        <div className="space-y-3">
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/transactions')}
            className="rounded-[24px] p-4 flex items-center gap-4 cursor-pointer hover-lift transition-smooth"
            style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" 
                 style={{ background: 'var(--mint-card)' }}>
              <Send className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Send</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@nicky</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm" style={{ color: 'var(--error-red)' }}>-2 SOL</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>$840.22</p>
            </div>
          </motion.div>
          
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/transactions')}
            className="rounded-[24px] p-4 flex items-center gap-4 cursor-pointer hover-lift transition-smooth"
            style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" 
                 style={{ background: 'var(--blue-card)' }}>
              <Download className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Received</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>@hamster</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm" style={{ color: 'var(--success-green)' }}>+1 SOL</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>$240.22</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
