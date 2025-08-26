import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QrCode, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import BottomNavigation from '@/components/BottomNavigation';

export default function Wallet() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-dark-primary relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between p-6 pt-12 safe-top"
      >
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <Button
          onClick={() => setLocation('/scan')}
          size="icon"
          className="w-10 h-10 bg-electric-blue rounded-full hover:bg-blue-600"
          data-testid="button-qr-scan"
        >
          <QrCode className="w-5 h-5 text-white" />
        </Button>
      </motion.div>
      
      {/* Balance Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 mb-6"
      >
        <Card className="bg-gradient-to-br from-dark-secondary to-dark-accent p-6 border-dark-accent">
          <p className="text-gray-400 text-sm mb-2">Total Balance</p>
          <p className="text-3xl font-bold text-white mb-4" data-testid="text-total-balance">
            {user?.balance?.toFixed(2) || '0.00'} USV
          </p>
          <p className="text-gray-300 text-lg mb-6" data-testid="text-total-balance-usd">
            ≈ ${((user?.balance || 0) * 2.0).toFixed(2)}
          </p>
          
          <div className="flex space-x-3">
            <Button
              onClick={() => setLocation('/deposit')}
              className="flex-1 bg-electric-blue hover:bg-blue-600 text-white py-3 font-medium"
              data-testid="button-deposit"
            >
              Deposit
            </Button>
            <Button
              onClick={() => setLocation('/withdraw')}
              variant="outline"
              className="flex-1 bg-dark-accent hover:bg-gray-600 text-white py-3 font-medium border-gray-600"
              data-testid="button-withdraw"
            >
              Withdraw
            </Button>
          </div>
        </Card>
      </motion.div>
      
      {/* Staking & Tokens Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6 mb-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-white">Staking & Tokens</h3>
        <Card className="bg-dark-secondary p-4 border-dark-accent mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-crypto-gold rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">Staked USV</p>
                <p className="text-gray-400 text-sm">Earning 12% APY</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-white" data-testid="text-staked-balance">
                {user?.stakedBalance?.toFixed(2) || '0.00'} USV
              </p>
              <p className="text-gray-400 text-sm" data-testid="text-staked-balance-usd">
                ≈ ${((user?.stakedBalance || 0) * 2.0).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* Assets Section */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="px-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-white">Assets</h3>
        <div className="space-y-3">
          <Card className="bg-dark-secondary p-4 border-dark-accent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-electric-blue to-crypto-gold rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">USV</span>
                </div>
                <div>
                  <p className="font-medium text-white">USV Token</p>
                  <p className="text-gray-400 text-sm">Available Balance</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white" data-testid="text-available-balance">
                  {((user?.balance || 0) - (user?.stakedBalance || 0)).toFixed(2)} USV
                </p>
                <p className="text-gray-400 text-sm" data-testid="text-available-balance-usd">
                  ≈ ${(((user?.balance || 0) - (user?.stakedBalance || 0)) * 2.0).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
