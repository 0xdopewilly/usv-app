import { useState } from 'react';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, Search, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Date utility functions
const formatDate = (date: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (targetDate.getTime() === today.getTime()) {
    return 'TODAY';
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return 'YESTERDAY';
  } else {
    const daysDiff = Math.floor((today.getTime() - targetDate.getTime()) / (24 * 60 * 60 * 1000));
    if (daysDiff < 7) {
      return `${daysDiff} DAYS AGO`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  }
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};

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

// Group transactions by date
const groupTransactionsByDate = (transactions: Transaction[]) => {
  const groups: Record<string, Transaction[]> = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.createdAt);
    const dateKey = formatDate(date);
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
  });

  // Sort groups by date (most recent first)
  const sortedGroups = Object.entries(groups).sort(([dateA], [dateB]) => {
    const getDateValue = (dateStr: string) => {
      if (dateStr === 'TODAY') return 0;
      if (dateStr === 'YESTERDAY') return 1;
      if (dateStr.includes('DAYS AGO')) {
        return parseInt(dateStr.split(' ')[0]);
      }
      return 999; // older dates
    };
    return getDateValue(dateA) - getDateValue(dateB);
  });

  return sortedGroups;
};

export default function TransactionHistory() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, refreshToken } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Force unregister service worker on component mount
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          console.log('🚫 Force unregistering service worker:', registration);
          registration.unregister();
        });
      });
    }
  }, []);

  // Fetch user transactions
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
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Sync incoming transactions mutation
  const syncTransactionsMutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await apiRequest('POST', '/api/wallet/sync-transactions');
        return response.json();
      } catch (error: any) {
        // Handle token expiry specifically
        if (error.message.includes('Invalid token') || error.message.includes('Access token required') || error.message.includes('Session expired')) {
          // Try to refresh token first
          const tokenRefreshed = await refreshToken();
          if (tokenRefreshed) {
            // Retry the request with new token
            const response = await apiRequest('POST', '/api/wallet/sync-transactions');
            return response.json();
          } else {
            throw new Error('Session expired. Please log in again.');
          }
        }
        throw error;
      }
    },
    onSuccess: (data: any) => {
      toast({
        title: 'Transactions synced',
        description: `Synced ${data.syncedCount} new incoming transactions`,
      });
      // Refresh the transactions list
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Sync failed',
        description: error.message || 'Failed to sync transactions',
        variant: 'destructive',
      });
    },
  });

  const handleSyncTransactions = () => {
    syncTransactionsMutation.mutate();
  };

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction: Transaction) => 
    transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (transaction.txHash && transaction.txHash.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-5 h-5 text-red-500" />;
      case 'receive':
        return <ArrowDownLeft className="w-5 h-5 text-green-500" />;
      case 'claim':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'stake':
        return <ArrowUpRight className="w-5 h-5 text-purple-500" />;
      case 'unstake':
        return <ArrowDownLeft className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'send':
        return 'Sent';
      case 'receive':
        return 'Received';
      case 'claim':
        return 'Claimed Rewards';
      case 'stake':
        return 'Staked';
      case 'unstake':
        return 'Unstaked';
      default:
        return (transaction.type as string).charAt(0).toUpperCase() + (transaction.type as string).slice(1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="px-6 pt-16 pb-6 flex items-center justify-between"
      >
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer hover:text-purple-400 transition-colors" 
          onClick={() => setLocation('/')}
          data-testid="button-back"
        />
        <h1 className="text-white text-xl font-semibold">Transaction History</h1>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSyncTransactions}
          disabled={syncTransactionsMutation.isPending}
          data-testid="button-sync-transactions"
        >
          <RefreshCw className={`w-5 h-5 ${syncTransactionsMutation.isPending ? 'animate-spin' : ''}`} />
        </Button>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="px-6 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white pl-10 focus:border-purple-500"
            data-testid="input-search-transactions"
          />
        </div>
      </motion.div>

      {/* Transaction List */}
      <div className="px-6 space-y-6">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-gray-900 border-gray-700 p-4">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-700 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : groupedTransactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No transactions yet</p>
            <p className="text-gray-500 text-sm">Your transaction history will appear here</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {groupedTransactions.map(([dateGroup, groupTransactions], groupIndex) => (
              <motion.div
                key={dateGroup}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
                className="space-y-3"
              >
                {/* Date Separator */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                  <span className="text-sm font-medium text-gray-400 bg-black px-3" data-testid={`text-date-${dateGroup.toLowerCase().replace(/\s+/g, '-')}`}>
                    {dateGroup}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                </div>

                {/* Transactions for this date */}
                <div className="space-y-3">
                  {groupTransactions
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by time within date
                    .map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLocation(`/transaction/${transaction.id}`)}
                    >
                      <Card className="bg-gray-900/50 border-gray-700 p-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-200" data-testid={`card-transaction-${transaction.id}`}>
                        <div className="flex items-center space-x-4">
                          {/* Transaction Icon */}
                          <div className="flex-shrink-0 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                            {getTransactionIcon(transaction.type)}
                          </div>

                          {/* Transaction Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-white font-medium text-sm" data-testid={`text-transaction-title-${transaction.id}`}>
                                {getTransactionTitle(transaction)}
                              </h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-semibold text-sm" data-testid={`text-amount-${transaction.id}`}>
                                  {transaction.type === 'send' ? '-' : '+'}
                                  {transaction.amount} {transaction.token}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)} bg-gray-800`} data-testid={`status-${transaction.id}`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-xs" data-testid={`text-time-${transaction.id}`}>
                                {formatTime(new Date(transaction.createdAt))}
                              </span>
                              {transaction.txHash && (
                                <span className="text-gray-500 text-xs truncate max-w-[100px]" data-testid={`text-hash-${transaction.id}`}>
                                  {transaction.txHash.slice(0, 8)}...{transaction.txHash.slice(-8)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}