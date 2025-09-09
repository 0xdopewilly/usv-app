import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Wallet } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import ConnectWallet from '@/components/ConnectWallet';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';

export default function WalletLogin() {
  const [, setLocation] = useLocation();
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleWalletConnected = async (publicKey: string) => {
    setIsConnecting(true);
    
    try {
      // Use real Phantom wallet authentication
      const response = await fetch('/api/auth/phantom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          walletAddress: publicKey,
          signature: 'phantom-signature' // In production, get real signature
        }),
      });
      
      if (!response.ok) {
        throw new Error('Phantom authentication failed');
      }
      
      const data = await response.json();
      
      // Store token and redirect
      localStorage.setItem('token', data.token);
      
      toast({
        title: "Welcome!",
        description: `Connected with Phantom wallet: ${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`,
      });
      
      setLocation('/');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Could not authenticate with Phantom wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-blue-900/10 to-transparent"></div>
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-8 flex items-center"
      >
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer" 
          onClick={() => setLocation('/auth-selection')}
        />
        <h1 className="text-white text-xl font-semibold ml-4">Wallet Login</h1>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl mx-auto mb-6 flex items-center justify-center"
          >
            <Wallet className="w-12 h-12 text-white" />
          </motion.div>
          
          <h2 className="text-white text-2xl font-bold mb-3">Access Your Wallet</h2>
          <p className="text-gray-400 text-base max-w-sm mx-auto">
            Continue with email to use your auto-generated wallet, or optionally connect Phantom for additional features.
          </p>
        </div>

        {/* Primary Login Methods - EMAIL FIRST */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Button
            onClick={() => setLocation('/login')}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-2xl h-12 font-semibold"
            data-testid="button-email-login"
          >
            Continue with Email
          </Button>
          
          <Button
            onClick={() => setLocation('/signup')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-2xl h-12 font-semibold"
            data-testid="button-create-account"
          >
            Create New Account
          </Button>
        </motion.div>

        {/* Optional Phantom Wallet */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-700"
        >
          <p className="text-gray-400 text-center text-sm mb-4">Optional: Advanced users only</p>
          
          <ConnectWallet 
            onConnected={handleWalletConnected}
            className="w-full"
          />
          
          {isConnecting && (
            <div className="text-center mt-4">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Completing Phantom connection...</p>
            </div>
          )}
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 space-y-3"
        >
          <h3 className="text-white font-semibold text-center mb-4">Choose your preferred method</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-800/20 border border-green-600/30 rounded-2xl">
              <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Email Login (Recommended)</p>
                <p className="text-gray-400 text-xs">Auto-generated wallet, easy setup, perfect for beginners</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-2xl">
              <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Phantom Wallet (Optional)</p>
                <p className="text-gray-400 text-xs">For advanced users with existing Solana wallets</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}