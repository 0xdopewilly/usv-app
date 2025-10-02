import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, QrCode as QrCodeIcon } from 'lucide-react';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/BottomNavigation';
import { realTimePriceService, AllPricesResponse } from '@/lib/realTimePrices';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';

export default function Wallet() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [prices, setPrices] = useState<AllPricesResponse | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  
  // Real-time SOL balance fetching
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
  
  // Real-time token balances
  const { data: tokenBalances } = useQuery({
    queryKey: ['wallet-tokens', user?.walletAddress],
    queryFn: async () => {
      if (!user?.walletAddress) return null;
      const response = await fetch(`/api/wallet/tokens/${user.walletAddress}`);
      if (!response.ok) throw new Error('Failed to fetch tokens');
      return response.json();
    },
    enabled: !!user?.walletAddress,
    refetchInterval: 15000,
  });

  // Generate QR code
  useEffect(() => {
    if (user?.walletAddress) {
      QRCode.toDataURL(user.walletAddress, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1A202C',
          light: '#FFFFFF',
        },
      }).then(setQrCodeDataUrl);
    }
  }, [user?.walletAddress]);

  // Setup real-time price updates
  useEffect(() => {
    const unsubscribe = realTimePriceService.subscribe((newPrices) => {
      setPrices(newPrices);
    });

    realTimePriceService.startRealTimeUpdates(8000);

    return () => {
      unsubscribe();
      realTimePriceService.stopRealTimeUpdates();
    };
  }, []);

  // Calculate balances
  const currentSolBalance = walletBalance?.balanceSOL || 0;
  const usvTokens = tokenBalances?.tokens?.find((token: any) => token.symbol === 'USV')?.amount || 0;
  const totalValue = (currentSolBalance * (prices?.SOL?.price || 0));

  const copyAddress = async (address: string) => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied!",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--mint-bg)' }}>
      <BottomNavigation />
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </motion.button>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>SOL</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Balance Display */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 mb-8"
      >
        <div className="text-center mb-6">
          {balanceLoading ? (
            <div className="skeleton h-20 w-64 mx-auto rounded-lg mb-2"></div>
          ) : (
            <>
              <div className="text-6xl font-black mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                ≈ {currentSolBalance.toFixed(2)}
              </div>
              <div className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Available: {currentSolBalance.toFixed(4)} SOL
              </div>
              {prices?.SOL?.price && (
                <div className="text-lg font-semibold" style={{ color: 'var(--text-muted)' }}>
                  ${totalValue.toFixed(2)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Confirm Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setLocation('/send')}
          className="w-full py-4 rounded-[24px] font-semibold text-base mb-6"
          style={{ background: 'var(--mint-accent)', color: 'white', boxShadow: 'var(--shadow-md)' }}
          data-testid="button-send"
        >
          Confirm
        </motion.button>

        {/* Gas Budget Card */}
        <div className="rounded-[24px] p-5 mb-6" style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Gas Budget</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>0.002 SOL</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Value</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              ${(currentSolBalance * (prices?.SOL?.price || 0)).toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* QR Code and Address Section */}
      <div className="px-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Receive Address</h2>
        
        {/* QR Code Card */}
        {user?.walletAddress && qrCodeDataUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[32px] p-8 mb-6"
            style={{ background: 'var(--white)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex flex-col items-center">
              <div className="mb-6 p-4 rounded-[24px]" style={{ background: 'var(--mint-bg)' }}>
                <img 
                  src={qrCodeDataUrl} 
                  alt="Wallet QR Code" 
                  className="w-48 h-48"
                />
              </div>
              
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Your Wallet Address
              </p>
              <div 
                className="w-full rounded-[16px] p-4 mb-4 flex items-center justify-between"
                style={{ background: 'var(--gray-100)' }}
              >
                <p className="font-mono text-xs flex-1 mr-2" style={{ color: 'var(--text-primary)' }} data-testid="text-usv-wallet-address">
                  {user.walletAddress}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyAddress(user.walletAddress || '')}
                  className="p-2 rounded-xl"
                  style={{ background: 'var(--white)' }}
                  data-testid="button-copy-usv-address"
                >
                  <Copy className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                </motion.button>
              </div>
              
              <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                Share this address to receive SOL and tokens
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
