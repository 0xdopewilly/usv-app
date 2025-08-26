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
      // Simulate user login with wallet address
      await login('wallet_user@phantom.app', 'wallet_password');
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in with Phantom wallet",
      });
      
      setLocation('/');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Could not complete wallet login",
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
          
          <h2 className="text-white text-2xl font-bold mb-3">Connect Your Wallet</h2>
          <p className="text-gray-400 text-base max-w-sm mx-auto">
            Login instantly with your Phantom wallet. Your wallet is your identity in the USV ecosystem.
          </p>
        </div>

        {/* Wallet Connection */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <ConnectWallet 
            onConnected={handleWalletConnected}
            className="w-full"
          />
          
          {isConnecting && (
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Completing login...</p>
            </div>
          )}
        </motion.div>

        {/* Alternative Login Methods */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-700"
        >
          <p className="text-gray-400 text-center text-sm mb-4">Or continue with</p>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setLocation('/login')}
              className="w-full bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700 rounded-2xl h-12"
              data-testid="button-email-login"
            >
              Email Login
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setLocation('/signup')}
              className="w-full bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700 rounded-2xl h-12"
              data-testid="button-create-account"
            >
              Create Account
            </Button>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 space-y-3"
        >
          <h3 className="text-white font-semibold text-center mb-4">Why connect your wallet?</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-2xl">
              <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Instant Access</p>
                <p className="text-gray-400 text-xs">No passwords, no verification needed</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-2xl">
              <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Secure & Private</p>
                <p className="text-gray-400 text-xs">Your keys, your tokens, your control</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-2xl">
              <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Full Functionality</p>
                <p className="text-gray-400 text-xs">Trade, stake, and claim rewards directly</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}