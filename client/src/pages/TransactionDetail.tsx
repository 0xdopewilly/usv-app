import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, Copy, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  token: string;
  status: string;
  toAddress?: string;
  fromAddress?: string;
  txHash?: string;
  createdAt?: Date;
}

export default function TransactionDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get transaction data from transactions list
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });
  
  const transaction = transactions?.find(tx => tx.id === params.id);
  
  if (!transaction) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Transaction Not Found</h2>
          <Button 
            onClick={() => setLocation('/transaction-history')}
            variant="outline"
            data-testid="button-back-to-history"
          >
            Back to History
          </Button>
        </div>
      </div>
    );
  }
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-8 h-8 text-red-500" />;
      case 'receive':
        return <ArrowDownLeft className="w-8 h-8 text-green-500" />;
      case 'claim':
        return <Clock className="w-8 h-8 text-blue-500" />;
      case 'stake':
        return <ArrowUpRight className="w-8 h-8 text-purple-500" />;
      case 'unstake':
        return <ArrowDownLeft className="w-8 h-8 text-orange-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
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
  
  const getTransactionTitle = (type: string) => {
    switch (type) {
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
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: 'Copied to clipboard',
      description: 'Address copied to clipboard',
    });
  };
  
  const handleCopyTxHash = (txHash: string) => {
    navigator.clipboard.writeText(txHash);
    toast({
      title: 'Copied to clipboard',
      description: 'Transaction hash copied to clipboard',
    });
  };
  
  const truncateAddress = (address: string) => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };
  
  const explorerUrl = transaction.txHash 
    ? `https://explorer.solana.com/tx/${transaction.txHash}` 
    : null;
  
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
          onClick={() => setLocation('/transaction-history')}
          data-testid="button-back"
        />
        <h1 className="text-white text-xl font-semibold">Transaction Details</h1>
        <div className="w-6" />
      </motion.div>
      
      <div className="px-6">
        {/* Main Transaction Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="glass-dark rounded-xl p-6 mb-6"
        >
          {/* Icon and Title */}
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gray-800/50 rounded-full">
              {getTransactionIcon(transaction.type)}
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {getTransactionTitle(transaction.type)}
            </h2>
            <div className="text-3xl font-bold">
              <span className={transaction.type === 'send' ? 'text-red-400' : 'text-green-400'}>
                {transaction.type === 'send' ? '-' : '+'}
                {transaction.amount.toFixed(6)} {transaction.token}
              </span>
            </div>
          </div>
          
          {/* Status */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {getStatusIcon(transaction.status)}
            <span className={`font-semibold capitalize ${getStatusColor(transaction.status)}`}>
              {transaction.status}
            </span>
          </div>
        </motion.div>
        
        {/* Transaction Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass-dark rounded-xl p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
          
          {/* Date/Time */}
          <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
            <span className="text-gray-400">Date & Time</span>
            <span className="text-white font-medium" data-testid="text-date">
              {transaction.createdAt 
                ? new Date(transaction.createdAt).toLocaleString()
                : 'Unknown'
              }
            </span>
          </div>
          
          {/* From Address */}
          {transaction.fromAddress && (
            <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
              <span className="text-gray-400">From</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm" data-testid="text-from-address">
                  {truncateAddress(transaction.fromAddress)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyAddress(transaction.fromAddress!)}
                  data-testid="button-copy-from"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* To Address */}
          {transaction.toAddress && (
            <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
              <span className="text-gray-400">To</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm" data-testid="text-to-address">
                  {truncateAddress(transaction.toAddress)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyAddress(transaction.toAddress!)}
                  data-testid="button-copy-to"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Transaction Hash */}
          {transaction.txHash && (
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-400">TX Hash</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm" data-testid="text-tx-hash">
                  {truncateAddress(transaction.txHash)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyTxHash(transaction.txHash!)}
                  data-testid="button-copy-hash"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* View on Explorer Button */}
        {explorerUrl && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-6"
          >
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
              onClick={() => window.open(explorerUrl, '_blank')}
              data-testid="button-view-explorer"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View on Solana Explorer
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}