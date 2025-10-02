import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Scan, User, AlertCircle, CheckCircle, DollarSign, Loader2, Bookmark } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { solanaService } from '@/lib/solana';
import { apiRequest } from '@/lib/queryClient';
import NotificationService from '@/lib/notifications';
// New USV Logo
import usvLogo from '@assets/image_1757431326277.png';

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

  // Fetch real SOL balance using server-authoritative endpoint (architect recommended)
  const { data: balanceData, isLoading: isBalanceLoading, error: balanceError } = useQuery({
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
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const maxBalance = (balanceData as any)?.balanceSOL || 0;
  const amountNum = parseFloat(amount) || 0;
  const feeBuffer = 0.000005; // Small buffer for transaction fees
  
  // Allow sending if we can't fetch balance (server will validate)
  const isValidAmount = isBalanceLoading ? (amountNum > 0) : (amountNum > 0 && amountNum <= (maxBalance - feeBuffer));
  const isValidAddress = recipientAddress.length >= 32; // Basic Solana address length check

  // Debug logging
  console.log('🔍 Send validation debug:', {
    amount,
    amountNum,
    maxBalance,
    isValidAmount,
    isValidAddress,
    recipientAddress: recipientAddress.slice(0, 20),
    balanceData,
    isBalanceLoading,
    feeBuffer,
    maxSendable: maxBalance - feeBuffer
  });

  // Quick send options
  const quickAmounts = [25, 50, 100, 250];
  
  // Common addresses (in a real app, these would be from contacts)
  const commonAddresses = [
    { name: 'Test Wallet 1', address: 'DemoAddress1234567890ABCDEF' },
    { name: 'Test Wallet 2', address: 'DemoAddress0987654321FEDCBA' },
  ];

  const handleSendTokens = async () => {
    if (!isValidAddress || !isValidAmount) return;

    setTransactionStep('confirm');
  };

  // Save address mutation
  const saveAddressMutation = useMutation({
    mutationFn: async (data: { address: string; label?: string }) => {
      const response = await apiRequest('/api/saved-addresses', 'POST', data);
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
    onError: (error: any) => {
      toast({
        title: 'Failed to Save',
        description: error.message || 'Unable to save address',
        variant: 'destructive',
      });
    },
  });

  const confirmTransaction = async () => {
    setIsLoading(true);
    setTransactionStep('processing');
    
    try {
      console.log(`🔄 Sending ${selectedToken} via custodial wallet:`, { recipientAddress, amount: amountNum });
      
      // Send via custodial wallet endpoint
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
        
        // Show save address dialog after successful transaction
        setShowSaveAddressDialog(true);
        
        // Show browser notification if user has enabled push notifications
        if (user?.pushNotifications && NotificationService.hasPermission()) {
          await NotificationService.showTransactionNotification('sent', amountNum, selectedToken);
        }
        
        toast({
          title: "🎉 Transfer Successful!",
          description: `Sent ${amountNum} SOL successfully`,
        });
        
        console.log('✅ SOL sent successfully:', result);
      } else {
        throw new Error(result.error || 'Failed to send SOL');
      }
    } catch (error: any) {
      console.error('❌ Transfer error:', error);
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
    // Leave small buffer for transaction fees
    const maxSendable = Math.max(0, maxBalance - feeBuffer);
    setAmount(maxSendable.toFixed(6));
  };

  if (transactionStep === 'success') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <BottomNavigation />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-white text-2xl font-bold mb-2">Transfer Successful!</h2>
          <p className="text-gray-400 mb-6">
            {amountNum} SOL sent successfully
          </p>
          
          <div className="bg-gray-900 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-400 mb-2">Transaction Hash</p>
            <p className="text-white font-mono text-sm break-all" data-testid="text-transaction-hash">
              {transactionHash}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => setLocation('/')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              data-testid="button-back-home"
            >
              Back to Home
            </Button>
            <Button
              onClick={resetTransaction}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              data-testid="button-send-another"
            >
              Send Another
            </Button>
          </div>
        </motion.div>
        
        {/* Save Address Dialog */}
        <Dialog open={showSaveAddressDialog} onOpenChange={setShowSaveAddressDialog}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-cyan-400" />
                Save Address?
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Would you like to save this address to your address book for future use?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">Recipient Address</p>
                <p className="text-sm text-white font-mono break-all">{recipientAddress}</p>
              </div>
              <div>
                <Label htmlFor="address-label" className="text-gray-300">Label (Optional)</Label>
                <Input
                  id="address-label"
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  placeholder="e.g., Exchange, Friend's wallet"
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
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
                variant="outline"
                className="border-gray-700 text-gray-300"
                data-testid="button-skip-save"
              >
                Skip
              </Button>
              <Button
                onClick={handleSaveAddress}
                disabled={saveAddressMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-cyan-500"
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

  if (transactionStep === 'error') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <BottomNavigation />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-white text-2xl font-bold mb-2">Transfer Failed</h2>
          <p className="text-gray-400 mb-6">
            {errorMessage}
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={resetTransaction}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              data-testid="button-try-again"
            >
              Try Again
            </Button>
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              data-testid="button-back-home-error"
            >
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (transactionStep === 'processing') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <BottomNavigation />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          
          <h2 className="text-white text-2xl font-bold mb-2">Processing Transfer</h2>
          <p className="text-gray-400 mb-6">
            Sending {amountNum} SOL to the recipient...
          </p>
          
          <p className="text-purple-400 text-sm">
            Please wait while we process your transaction on the Solana network
          </p>
        </motion.div>
      </div>
    );
  }

  if (transactionStep === 'confirm') {
    return (
      <div className="min-h-screen bg-black relative pb-20">
        <BottomNavigation />
        
        <div className="px-6 pt-12">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTransactionStep('input')}
              className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10"
              data-testid="button-back-input"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white text-lg font-semibold">Confirm Transfer</h1>
            <div></div>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/20 p-6">
              <div className="text-center mb-6">
                <img 
                  src={selectedToken === 'SOL' ? '/solana-logo.png' : '/usv-logo.png'} 
                  alt={selectedToken} 
                  className="w-16 h-16 rounded-xl object-contain mx-auto mb-4" 
                />
                <h2 className="text-white text-3xl font-bold mb-2" data-testid="text-confirm-amount">
                  {amountNum} {selectedToken}
                </h2>
                <p className="text-gray-400">≈ ${(amountNum * 230).toFixed(2)} USD</p>
              </div>

              <div className="space-y-4">
                <div className="bg-black/30 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2">To</p>
                  <p className="text-white font-mono text-sm break-all" data-testid="text-confirm-recipient">
                    {recipientAddress}
                  </p>
                </div>

                <div className="bg-black/30 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Network Fee</span>
                    <span className="text-white text-sm">~0.000005 SOL</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={confirmTransaction}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-4 text-lg font-semibold"
                data-testid="button-confirm-transfer"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Confirming...</span>
                  </div>
                ) : (
                  <>Confirm Transfer</>
                )}
              </Button>
              
              <Button
                onClick={() => setTransactionStep('input')}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                data-testid="button-cancel-transfer"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative pb-20">
      <BottomNavigation />
      
      <div className="px-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/send')}
            className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-white text-lg font-semibold">Send {selectedToken}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/scan')}
            className="text-purple-400 hover:bg-purple-500/20 p-2 rounded-full w-10 h-10"
            data-testid="button-scan-qr"
          >
            <Scan className="w-5 h-5" />
          </Button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-6"
        >
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={selectedToken === 'SOL' ? '/solana-logo.png' : '/usv-logo.png'} 
                alt={selectedToken} 
                className="w-10 h-10 rounded-xl object-contain" 
              />
              <div>
                <h3 className="text-white font-semibold">Available Balance</h3>
                <p className="text-gray-400 text-sm">{selectedToken} ({selectedToken === 'SOL' ? 'Solana' : 'USV Token'})</p>
              </div>
            </div>
            {isBalanceLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                <p className="text-gray-400">Loading balance...</p>
              </div>
            ) : balanceError ? (
              <p className="text-red-400">Error loading balance</p>
            ) : (
              <>
                <p className="text-white text-3xl font-bold" data-testid="text-available-balance">
                  {maxBalance.toFixed(6)} SOL
                </p>
                <p className="text-gray-400 text-sm">≈ ${(maxBalance * 230).toFixed(2)} USD</p>
              </>
            )}
          </Card>

          {/* Recipient Input */}
          <Card className="bg-gray-900/50 border-gray-700/50 p-6">
            <Label htmlFor="recipient" className="text-white mb-3 block">
              Recipient Address
            </Label>
            <div className="relative">
              <Input
                id="recipient"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter Solana wallet address"
                className="bg-black/50 border-gray-600 text-white placeholder-gray-400 pr-12"
                data-testid="input-recipient-address"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/scan')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:bg-purple-500/20 p-1"
                data-testid="button-scan-recipient"
              >
                <Scan className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quick Contact Selection */}
            {recipientAddress === '' && (
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Quick Select</p>
                <div className="space-y-2">
                  {commonAddresses.map((contact, index) => (
                    <Button
                      key={index}
                      onClick={() => setRecipientAddress(contact.address)}
                      variant="ghost"
                      className="w-full justify-start text-left p-3 hover:bg-gray-800/50"
                      data-testid={`button-quick-contact-${index}`}
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <p className="text-white text-sm">{contact.name}</p>
                        <p className="text-gray-400 text-xs font-mono">
                          {contact.address.slice(0, 8)}...{contact.address.slice(-8)}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Amount Input */}
          <Card className="bg-gray-900/50 border-gray-700/50 p-6">
            <Label htmlFor="amount" className="text-white mb-3 block">
              Amount to Send
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="bg-black/50 border-gray-600 text-white placeholder-gray-400 text-2xl font-bold py-4 pr-20"
                data-testid="input-amount"
              />
              <Button
                onClick={setMaxAmount}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:bg-purple-500/20"
                data-testid="button-max-amount"
              >
                MAX
              </Button>
            </div>
            
            <p className="text-gray-400 text-sm mt-2">
              ≈ ${(amountNum * 230).toFixed(2)} USD
            </p>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  disabled={quickAmount > maxBalance}
                  data-testid={`button-quick-amount-${quickAmount}`}
                >
                  {quickAmount}
                </Button>
              ))}
            </div>

            {/* Validation Messages */}
            {amount && !isValidAmount && (
              <p className="text-red-400 text-sm mt-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {amountNum > (maxBalance - feeBuffer) ? 
                  `Insufficient balance (max: ${(maxBalance - feeBuffer).toFixed(6)} SOL)` : 
                  'Invalid amount'}
              </p>
            )}
          </Card>

          {/* Send Button */}
          <Button
            onClick={handleSendTokens}
            disabled={!isValidAddress || !isValidAmount || isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-send-tokens"
          >
            {isBalanceLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            {isBalanceLoading ? 'Loading...' : `Send ${amountNum || 0} SOL`}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}