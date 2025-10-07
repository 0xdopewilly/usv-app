import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Wallet, Check, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      isConnected: boolean;
      publicKey: { toString: () => string } | null;
    };
  }
}

interface ConnectWalletProps {
  onConnected?: (publicKey: string) => void;
  className?: string;
}

export default function ConnectWallet({ onConnected, className = "" }: ConnectWalletProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkPhantom = () => {
      if (window.solana && window.solana.isPhantom) {
        setIsPhantomInstalled(true);
        // Check if already connected
        if (window.solana.isConnected && window.solana.publicKey) {
          setIsConnected(true);
          setWalletAddress(window.solana.publicKey.toString());
        }
      }
    };

    checkPhantom();
    
    // Check again after a short delay for slower loading
    const timeout = setTimeout(checkPhantom, 1000);
    return () => clearTimeout(timeout);
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      if (!window.solana || !window.solana.isPhantom) {
        // Open Phantom wallet website for download
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Try to open Phantom app directly, fallback to app store
          const phantomDeepLink = `phantom://v1/connect?dapp_encryption_public_key=dummy&redirect_link=${encodeURIComponent(window.location.href)}`;
          window.location.href = phantomDeepLink;
          
          // Fallback to app store after a short delay
          setTimeout(() => {
            window.location.href = 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977';
          }, 1000);
        } else {
          // Desktop - open Phantom extension page
          window.open('https://phantom.app/', '_blank');
        }
        
        toast({
          title: "Phantom Wallet Required",
          description: "Please install Phantom wallet to continue",
          variant: "destructive",
        });
        return;
      }

      const response = await window.solana.connect({ onlyIfTrusted: false });
      const publicKey = response.publicKey.toString();
      
      setIsConnected(true);
      setWalletAddress(publicKey);
      onConnected?.(publicKey);

      toast({
        title: "Wallet Connected!",
        description: `Connected to ${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`,
      });

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
      }
      setIsConnected(false);
      setWalletAddress('');
      
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from Phantom",
      });
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (isConnected) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/30 rounded-2xl ${className?.includes('w-12') ? 'p-2 w-12 h-12' : 'p-3 max-w-[280px]'} backdrop-blur-sm ${className}`}
      >
        {className?.includes('w-12') ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="relative">
              <Check className="w-3 h-3 text-green-400" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full animate-pulse border border-black"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">Connected</p>
                <p className="text-green-400 text-xs font-mono truncate">
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </p>
              </div>
            </div>
            <Button
              onClick={disconnectWallet}
              variant="ghost"
              size="sm"
              className="text-red-300 hover:bg-red-500/20 hover:text-red-200 h-7 px-2 text-xs flex-shrink-0 ml-2"
              data-testid="button-disconnect-wallet"
            >
              ×
            </Button>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className={`${className?.includes('w-12') ? 'w-12 h-12 p-0' : className?.includes('w-16') ? 'w-16 h-16 p-0' : 'w-full h-16'} bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white rounded-2xl font-bold ${className?.includes('w-12') ? 'text-[10px]' : className?.includes('w-16') ? 'text-xs' : 'text-lg'} relative overflow-hidden group shadow-lg shadow-purple-500/25`}
        data-testid="button-connect-wallet"
      >
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        <div className={`relative z-10 flex items-center justify-center ${className?.includes('w-16') ? '' : 'space-x-3'}`}>
          <motion.div
            animate={isConnecting ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: isConnecting ? Infinity : 0, ease: "linear" }}
          >
            <Wallet className={className?.includes('w-12') ? 'w-3 h-3' : className?.includes('w-16') ? 'w-5 h-5' : 'w-6 h-6'} />
          </motion.div>
          {!className?.includes('w-12') && !className?.includes('w-16') && (
            <>
              <span className="font-bold">
                {isConnecting ? 'Connecting...' : 'Connect Phantom Wallet'}
              </span>
              {!isPhantomInstalled && (
                <ExternalLink className="w-4 h-4 ml-2" />
              )}
            </>
          )}
        </div>
        
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-orange-500/50 rounded-2xl blur-lg -z-10"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </Button>
    </motion.div>
  );
}