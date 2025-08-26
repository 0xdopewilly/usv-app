import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, ExternalLink } from 'lucide-react';
import { useWallet } from '@/lib/wallet';
import { motion } from 'framer-motion';

export default function WalletConnect() {
  const { connect, disconnect, connected, publicKey } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (connected && publicKey) {
    return (
      <Card className="p-4 bg-dark-secondary border-dark-accent">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-success-green rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-white">Wallet Connected</p>
              <p className="text-sm text-gray-400">
                {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={disconnect}
            className="border-error-red text-error-red hover:bg-error-red hover:text-white"
            data-testid="disconnect-wallet"
          >
            Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-dark-secondary border-dark-accent text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 bg-electric-blue rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400 mb-6">
          Connect your Solana wallet to access all features
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-electric-blue to-crypto-gold text-white glow-button"
            data-testid="connect-wallet"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <ExternalLink className="w-4 h-4" />
            <span>Don't have a wallet? Get one from</span>
            <a
              href="https://phantom.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-electric-blue hover:underline"
            >
              Phantom
            </a>
          </div>
        </div>
      </motion.div>
    </Card>
  );
}
