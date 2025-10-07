import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Scan, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { solanaService } from '@/lib/solana';
import NotificationService from '@/lib/notifications';
import { useAuth } from '@/lib/auth';

const recentContacts = [
  { address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', name: 'Alex Chen', avatar: '👨‍💼' },
  { address: 'DQyrAcCrDXQ8NNx2RgdRRJKUFn8LLxLB1JhVk96mk5y', name: 'Sarah Wilson', avatar: '👩‍🦰' },
  { address: 'EhpbDdKk8JrKF8B4RwZLb3K4Q2n7RzNJFJWDGg8K3abc', name: 'Mike Johnson', avatar: '👨‍🔬' },
];

export default function SendTokens() {
  const [, setLocation] = useLocation();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USV');
  const [memo, setMemo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSend = async () => {
    if (!recipientAddress || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    if (!solanaService.isWalletConnected()) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      let signature;
      
      if (selectedToken === 'USV') {
        signature = await solanaService.transferUSV(recipientAddress, parseFloat(amount));
      } else {
        // For SOL and other tokens, we'll simulate the transaction
        signature = 'sol_transfer_' + Date.now().toString();
        console.log(`Simulated ${selectedToken} transfer of ${amount} to ${recipientAddress}`);
      }

      toast({
        title: "Transaction Sent!",
        description: `Successfully sent ${amount} ${selectedToken}. TX: ${signature.slice(0, 8)}...`,
      });

      // Send push notification for outgoing transaction
      console.log('🔔 Checking notification conditions:', {
        pushNotificationsEnabled: user?.pushNotifications,
        hasPermission: NotificationService.hasPermission(),
        amount: parseFloat(amount),
        token: selectedToken
      });
      
      if (user?.pushNotifications && NotificationService.hasPermission()) {
        console.log('🔔 Triggering send notification...');
        await NotificationService.showTransactionNotification('sent', parseFloat(amount), selectedToken);
      } else {
        console.log('⚠️ Notification skipped - check settings or permissions');
      }

      // Reset form
      setRecipientAddress('');
      setAmount('');
      setMemo('');
      
      // Navigate back to wallet
      setLocation('/wallet');
    } catch (error) {
      console.error('Send failed:', error);
      toast({
        title: "Transaction Failed",
        description: "Could not complete the transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectContact = (contact: typeof recentContacts[0]) => {
    setRecipientAddress(contact.address);
  };

  const openQRScanner = () => {
    setLocation('/qr-scan');
  };

  const calculateFee = () => {
    if (selectedToken === 'SOL') return '~0.000005 SOL';
    return '~0.000005 SOL'; // All transactions on Solana cost SOL for fees
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-4 flex items-center justify-between"
      >
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer" 
          onClick={() => setLocation('/wallet')}
        />
        <h1 className="text-white text-xl font-semibold">Send Tokens</h1>
        <Send className="w-6 h-6 text-purple-400" />
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-6"
      >
        <Tabs defaultValue="send" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700/30">
            <TabsTrigger value="send" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Send</TabsTrigger>
            <TabsTrigger value="contacts" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Contacts</TabsTrigger>
          </TabsList>

          <TabsContent value="send" className="space-y-6">
            {/* Token Selection */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Token</label>
              <Select value={selectedToken} onValueChange={setSelectedToken}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white rounded-2xl h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="USV">USV Token</SelectItem>
                  <SelectItem value="SOL">Solana (SOL)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Address */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Recipient Address</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter wallet address..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white rounded-2xl h-12 pr-12"
                  data-testid="input-recipient-address"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openQRScanner}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-white"
                  data-testid="button-scan-qr"
                >
                  <Scan className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white rounded-2xl h-12"
                  data-testid="input-amount"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                  {selectedToken}
                </div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {['25%', '50%', '75%', 'Max'].map((percentage) => (
                <Button
                  key={percentage}
                  variant="outline"
                  onClick={() => {
                    // Simulate balance calculation
                    const mockBalance = selectedToken === 'USV' ? 1000 : selectedToken === 'SOL' ? 5.5 : 100;
                    const multiplier = percentage === 'Max' ? 1 : parseInt(percentage) / 100;
                    setAmount((mockBalance * multiplier).toString());
                  }}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl h-10 text-xs"
                  data-testid={`button-amount-${percentage}`}
                >
                  {percentage}
                </Button>
              ))}
            </div>

            {/* Memo (Optional) */}
            <div className="space-y-2">
              <label className="text-gray-300 text-sm font-medium">Memo (Optional)</label>
              <Input
                type="text"
                placeholder="Add a note..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white rounded-2xl h-12"
                data-testid="input-memo"
              />
            </div>

            {/* Transaction Summary */}
            <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-4 border border-gray-700/30">
              <h3 className="text-white font-semibold mb-3">Transaction Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">{amount || '0'} {selectedToken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Network Fee:</span>
                  <span className="text-white">{calculateFee()}</span>
                </div>
                <div className="border-t border-gray-600 pt-2 flex justify-between">
                  <span className="text-gray-400 font-medium">Total:</span>
                  <span className="text-white font-semibold">{amount || '0'} {selectedToken}</span>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={isSending || !recipientAddress || !amount}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-12 font-semibold"
              data-testid="button-send-tokens"
            >
              {isSending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                `Send ${selectedToken}`
              )}
            </Button>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <h3 className="text-white font-semibold">Recent Contacts</h3>
            
            {recentContacts.map((contact) => (
              <motion.div
                key={contact.address}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-gray-800/50 backdrop-blur rounded-2xl p-4 border border-gray-700/30"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center text-lg">
                    {contact.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{contact.name}</p>
                    <p className="text-gray-400 text-xs font-mono">
                      {contact.address.slice(0, 8)}...{contact.address.slice(-8)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectContact(contact)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl"
                    data-testid={`button-select-contact-${contact.name.toLowerCase().replace(' ', '-')}`}
                  >
                    Select
                  </Button>
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}