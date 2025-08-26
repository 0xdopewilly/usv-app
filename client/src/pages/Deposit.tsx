import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Copy, QrCode as QrCodeIcon, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Deposit() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate a mock Solana address for demonstration
  const walletAddress = user?.walletAddress || '4kXrG8b9PvQx7HjK2mN7cR5qL3wP8uE6yT9sA1bF5vD2';

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed", 
        description: "Unable to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary relative px-6 pt-12 safe-top">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center mb-8"
      >
        <Button
          onClick={() => setLocation('/wallet')}
          variant="ghost"
          size="icon"
          className="w-10 h-10 bg-dark-accent rounded-full text-gray-300 hover:text-white mr-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Deposit</h1>
      </motion.div>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-8"
      >
        <p className="text-gray-400 mb-6">Send USV tokens to this address</p>
        
        {/* QR Code Placeholder */}
        <div className="w-48 h-48 mx-auto mb-6 bg-white p-4 rounded-xl">
          <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
            <QrCodeIcon className="w-16 h-16 text-gray-400" />
          </div>
        </div>
        
        {/* Wallet Address */}
        <Card className="bg-dark-secondary p-4 border-dark-accent mb-6">
          <p className="text-gray-400 text-sm mb-2">Wallet Address</p>
          <p className="text-white font-mono text-sm break-all" data-testid="text-wallet-address">
            {walletAddress}
          </p>
        </Card>
        
        <Button
          onClick={copyAddress}
          className="w-full bg-electric-blue hover:bg-blue-600 text-white py-4 h-auto text-lg font-semibold glow-button flex items-center justify-center space-x-2"
          data-testid="button-copy-address"
        >
          <Copy className="w-5 h-5" />
          <span>Copy Address</span>
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-dark-secondary p-4 border-dark-accent">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-crypto-gold mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-300">
                <strong className="text-white">Important:</strong> Only send USV tokens to this address. 
                Sending other tokens may result in permanent loss.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
