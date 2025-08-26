import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import BottomNavigation from '@/components/BottomNavigation';

export default function Home() {
  const { user } = useAuth();
  
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-dark-primary relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-12 pb-6 text-center safe-top"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-electric-blue to-crypto-gold rounded-xl flex items-center justify-center">
          <span className="text-xl font-bold text-white">USV</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-300">USV Token</h1>
        <p className="text-gray-400 text-sm">Welcome back, {user?.fullName?.split(' ')[0]}</p>
      </motion.div>
      
      {/* Balance Display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex justify-center py-8"
      >
        <div className="w-48 h-48 bg-gradient-to-br from-dark-secondary to-dark-accent rounded-full flex flex-col items-center justify-center balance-circle">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Total Balance</p>
            <p className="text-3xl font-bold text-white" data-testid="text-balance">
              {user?.balance?.toFixed(2) || '0.00'}
            </p>
            <p className="text-lg text-crypto-gold">USV</p>
            <p className="text-gray-400 text-sm mt-2" data-testid="text-balance-usd">
              ≈ ${((user?.balance || 0) * 2.0).toFixed(2)}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Vape Map Button */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-8 mb-8"
      >
        <Button className="w-full bg-gradient-to-r from-electric-blue to-crypto-gold text-white py-4 h-auto text-lg font-semibold glow-button flex items-center justify-center space-x-3" data-testid="button-find-stores">
          <MapPin className="w-5 h-5" />
          <span>Find Vape Stores</span>
        </Button>
      </motion.div>
      
      {/* Recent Activity */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="px-8 mb-20"
      >
        <h3 className="text-lg font-semibold mb-4 text-white">Recent Activity</h3>
        
        {!Array.isArray(transactions) || transactions.length === 0 ? (
          <Card className="p-6 bg-dark-secondary border-dark-accent text-center">
            <p className="text-gray-400 mb-4">No transactions yet</p>
            <p className="text-sm text-gray-500">
              Scan QR codes at partner vape stores to earn USV tokens
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {Array.isArray(transactions) && transactions.slice(0, 5).map((transaction: any, index: number) => (
              <Card key={transaction.id || index} className="p-4 bg-dark-secondary border-dark-accent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'claim' ? 'bg-success-green' : 
                      transaction.type === 'deposit' ? 'bg-electric-blue' : 'bg-error-red'
                    }`}>
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white capitalize">{transaction.type}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'withdraw' ? 'text-error-red' : 'text-success-green'
                    }`}>
                      {transaction.type === 'withdraw' ? '-' : '+'}
                      {transaction.amount.toFixed(2)} USV
                    </p>
                    <p className="text-gray-400 text-sm">
                      ≈ ${(transaction.amount * 2.0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
