import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send as SendIcon, Scan, AlertCircle, CheckCircle, Loader2, Bookmark } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import NotificationService from '@/lib/notifications';

export default function SendTokens() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const selectedToken = params.token?.toUpperCase() || 'SOL';
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStep, setTransactionStep] = useState<'input' | 'confirm' | 'processing' | 'success' | 'error'>('input');
  const [transactionHash, setTransactionHash] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSaveAddressDialog, setShowSaveAddressDialog] = useState(false);
  const [addressLabel, setAddressLabel] = useState('');
  const queryClient = useQueryClient();

  // Fetch real SOL balance
  const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['/api/wallet/me/balance'],
    queryFn: async () => {
      const response = await fetch('/api/wallet/me/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch balance');
      return response.json();
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const maxBalance = (balanceData as any)?.balanceSOL || 0;
  const amountNum = parseFloat(amount) || 0;
  const feeBuffer = 0.000005;
  
  const isValidAmount = isBalanceLoading ? (amountNum > 0) : (amountNum > 0 && amountNum <= (maxBalance - feeBuffer));
  const isValidAddress = recipientAddress.length >= 32;

  // Save address mutation
  const saveAddressMutation = useMutation({
    mutationFn: async (data: { address: string; label?: string }) => {
      const response = await apiRequest('POST', '/api/saved-addresses', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-addresses'] });
      toast({
        title: 'Address Saved',
        description: 'The address has been added to your address book',
      });
      setShowSaveAddressDialog(false);
      setAddressLabel('');
    },
  });

  const handleSendTokens = async () => {
    if (!isValidAddress || !isValidAmount) return;
    setTransactionStep('confirm');
  };

  const confirmTransaction = async () => {
    setIsLoading(true);
    setTransactionStep('processing');
    
    try {
      const response = await fetch('/api/wallet/send-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recipientAddress,
          amount: amountNum,
          token: selectedToken
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setTransactionHash(result.signature);
        setTransactionStep('success');
        setShowSaveAddressDialog(true);
        
        if (user?.pushNotifications && NotificationService.hasPermission()) {
          await NotificationService.showTransactionNotification('sent', amountNum, selectedToken);
        }
        
        toast({
          title: "Transfer Successful!",
          description: `Sent ${amountNum} SOL successfully`,
        });
      } else {
        throw new Error(result.error || 'Failed to send SOL');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Transaction failed');
      setTransactionStep('error');
      
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to send SOL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAddress = () => {
    saveAddressMutation.mutate({ address: recipientAddress, label: addressLabel || undefined });
  };

  const resetTransaction = () => {
    setTransactionStep('input');
    setAmount('');
    setRecipientAddress('');
    setTransactionHash('');
    setErrorMessage('');
  };

  const setMaxAmount = () => {
    const maxSendable = Math.max(0, maxBalance - feeBuffer);
    setAmount(maxSendable.toFixed(6));
  };

  // Success Screen
  if (transactionStep === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--mint-bg)' }}>
        <BottomNavigation />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center w-full max-w-md"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" 
               style={{ background: 'var(--success-green)' }}>
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Transfer Successful!</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {amountNum} SOL sent successfully
          </p>
          
          <div className="rounded-[24px] p-5 mb-6" style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Transaction Hash</p>
            <p className="font-mono text-xs break-all" style={{ color: 'var(--text-primary)' }} data-testid="text-transaction-hash">
              {transactionHash}
            </p>
          </div>
          
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setLocation('/')}
              className="w-full py-4 rounded-[20px] font-semibold"
              style={{ background: 'var(--mint-accent)', color: 'white', boxShadow: 'var(--shadow-md)' }}
              data-testid="button-back-home"
            >
              Back to Home
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={resetTransaction}
              className="w-full py-4 rounded-[20px] font-semibold"
              style={{ background: 'var(--white)', color: 'var(--text-primary)', boxShadow: 'var(--shadow)' }}
              data-testid="button-send-another"
            >
              Send Another
            </motion.button>
          </div>
        </motion.div>
        
        {/* Save Address Dialog */}
        <Dialog open={showSaveAddressDialog} onOpenChange={setShowSaveAddressDialog}>
          <DialogContent style={{ background: 'var(--white)' }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Bookmark className="h-5 w-5" style={{ color: 'var(--mint-accent)' }} />
                Save Address?
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--text-secondary)' }}>
                Would you like to save this address to your address book?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg p-3" style={{ background: 'var(--gray-100)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Recipient Address</p>
                <p className="text-sm font-mono break-all" style={{ color: 'var(--text-primary)' }}>{recipientAddress}</p>
              </div>
              <div>
                <Label htmlFor="address-label" style={{ color: 'var(--text-secondary)' }}>Label (Optional)</Label>
                <Input
                  id="address-label"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  placeholder="e.g., Exchange, Friend's wallet"
                  className="input-clean mt-2"
                  data-testid="input-save-address-label"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                onClick={() => {
                  setShowSaveAddressDialog(false);
                  setAddressLabel('');
                }}
                className="btn-secondary"
                data-testid="button-skip-save"
              >
                Skip
              </Button>
              <Button
                onClick={handleSaveAddress}
                disabled={saveAddressMutation.isPending}
                className="btn-primary"
                data-testid="button-confirm-save"
              >
                {saveAddressMutation.isPending ? 'Saving...' : 'Save Address'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Error Screen
  if (transactionStep === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--mint-bg)' }}>
        <BottomNavigation />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center w-full max-w-md"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" 
               style={{ background: 'var(--error-red)' }}>
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Transfer Failed</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            {errorMessage}
          </p>
          
          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={resetTransaction}
              className="w-full py-4 rounded-[20px] font-semibold"
              style={{ background: 'var(--mint-accent)', color: 'white', boxShadow: 'var(--shadow-md)' }}
              data-testid="button-try-again"
            >
              Try Again
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setLocation('/')}
              className="w-full py-4 rounded-[20px] font-semibold"
              style={{ background: 'var(--white)', color: 'var(--text-primary)', boxShadow: 'var(--shadow)' }}
              data-testid="button-back-home-error"
            >
              Back to Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Processing Screen
  if (transactionStep === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--mint-bg)' }}>
        <BottomNavigation />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="spinner w-20 h-20 mx-auto mb-6"></div>
          
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Processing Transfer</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Sending {amountNum} SOL to the recipient...
          </p>
          
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Please wait while we process your transaction
          </p>
        </motion.div>
      </div>
    );
  }

  // Confirm Screen
  if (transactionStep === 'confirm') {
    return (
      <div className="min-h-screen pb-20" style={{ background: 'var(--mint-bg)' }}>
        <BottomNavigation />
        
        <div className="px-6 pt-12">
          <div className="flex items-center justify-between mb-8">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setTransactionStep('input')}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}
              data-testid="button-back-input"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </motion.button>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Confirm Transfer</h1>
            <div className="w-10" />
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="rounded-[32px] p-8" style={{ background: 'var(--white)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="text-center mb-6">
                <h2 className="text-4xl font-black mb-2" style={{ color: 'var(--text-primary)' }} data-testid="text-confirm-amount">
                  {amountNum} {selectedToken}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>≈ ${(amountNum * 230).toFixed(2)} USD</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[16px] p-4" style={{ background: 'var(--gray-100)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>To</p>
                  <p className="font-mono text-sm break-all" style={{ color: 'var(--text-primary)' }} data-testid="text-confirm-recipient">
                    {recipientAddress}
                  </p>
                </div>

                <div className="rounded-[16px] p-4" style={{ background: 'var(--gray-100)' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Network Fee</span>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>~0.000005 SOL</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={confirmTransaction}
                disabled={isLoading}
                className="w-full py-4 rounded-[20px] font-semibold text-base"
                style={{ background: 'var(--success-green)', color: 'white', boxShadow: 'var(--shadow-md)' }}
                data-testid="button-confirm-transfer"
              >
                {isLoading ? 'Confirming...' : 'Confirm Transfer'}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setTransactionStep('input')}
                className="w-full py-4 rounded-[20px] font-semibold"
                style={{ background: 'var(--white)', color: 'var(--text-primary)', boxShadow: 'var(--shadow)' }}
                data-testid="button-cancel-transfer"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Input Screen
  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--mint-bg)' }}>
      <BottomNavigation />
      
      <div className="px-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </motion.button>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Send {selectedToken}</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/scan')}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}
            data-testid="button-scan-qr"
          >
            <Scan className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </motion.button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-6"
        >
          {/* Balance Card */}
          <div className="rounded-[24px] p-6" style={{ background: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Available Balance</p>
            {isBalanceLoading ? (
              <div className="skeleton h-10 w-40 rounded"></div>
            ) : (
              <>
                <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }} data-testid="text-available-balance">
                  {maxBalance.toFixed(6)} SOL
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>≈ ${(maxBalance * 230).toFixed(2)} USD</p>
              </>
            )}
          </div>

          {/* Recipient Input */}
          <div className="rounded-[24px] p-6" style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}>
            <Label htmlFor="recipient" className="text-sm mb-3 block" style={{ color: 'var(--text-secondary)' }}>
              Recipient Address
            </Label>
            <div className="relative">
              <Input
                id="recipient"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter Solana wallet address"
                className="input-clean pr-12"
                data-testid="input-recipient-address"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocation('/scan')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2"
                data-testid="button-scan-recipient"
              >
                <Scan className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              </motion.button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="rounded-[24px] p-6" style={{ background: 'var(--white)', boxShadow: 'var(--shadow)' }}>
            <Label htmlFor="amount" className="text-sm mb-3 block" style={{ color: 'var(--text-secondary)' }}>
              Amount to Send
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="input-clean text-2xl font-bold py-4 pr-20"
                data-testid="input-amount"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={setMaxAmount}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-lg font-semibold text-sm"
                style={{ background: 'var(--mint-accent)', color: 'white' }}
                data-testid="button-max-amount"
              >
                MAX
              </motion.button>
            </div>
            
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              ≈ ${(amountNum * 230).toFixed(2)} USD
            </p>

            {/* Validation Messages */}
            {amount && !isValidAmount && (
              <p className="text-sm mt-2 flex items-center" style={{ color: 'var(--error-red)' }}>
                <AlertCircle className="w-4 h-4 mr-1" />
                {amountNum > (maxBalance - feeBuffer) ? 
                  `Insufficient balance (max: ${(maxBalance - feeBuffer).toFixed(6)} SOL)` : 
                  'Invalid amount'}
              </p>
            )}
          </div>

          {/* Send Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSendTokens}
            disabled={!isValidAddress || !isValidAmount || isLoading}
            className="w-full py-4 rounded-[20px] font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--mint-accent)', color: 'white', boxShadow: 'var(--shadow-md)' }}
            data-testid="button-send-tokens"
          >
            {isBalanceLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <SendIcon className="w-5 h-5" />
                {`Send ${amountNum || 0} SOL`}
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
