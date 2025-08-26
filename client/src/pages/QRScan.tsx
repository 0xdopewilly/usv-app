import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import QRScanner from '@/components/QRScanner';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function QRScan() {
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('/api/qr/claim', {
        method: 'POST',
        body: JSON.stringify({ code }),
        headers: { 'Content-Type': 'application/json' },
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "QR Code Claimed!",
        description: `You earned ${data.reward} USV tokens!`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setLocation('/home');
    },
    onError: (error: any) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Unable to claim QR code",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleQRScan = async (data: string) => {
    setIsProcessing(true);
    
    // Simulate QR code detection for demo purposes
    // In a real app, this would come from the camera
    const mockQRCodes = [
      'STORE_1_PRODUCT_1',
      'STORE_1_PRODUCT_2',
      'STORE_2_PRODUCT_1',
      'STORE_3_PRODUCT_1',
    ];
    
    // For demo, use a random mock QR code
    const qrCode = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
    
    try {
      await claimMutation.mutateAsync(qrCode);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleClose = () => {
    setLocation('/home');
  };

  // Show processing overlay if claiming
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-dark-primary z-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-electric-blue to-crypto-gold rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xl font-bold text-white">USV</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Processing QR Code</h2>
          <p className="text-gray-400">Please wait...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative">
      <QRScanner onClose={handleClose} onScan={handleQRScan} />
      
      {/* Demo Button for Testing */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-60">
        <Button
          onClick={() => handleQRScan('demo')}
          className="bg-gradient-to-r from-electric-blue to-crypto-gold text-white px-6 py-3 rounded-xl font-semibold glow-button"
          data-testid="button-demo-scan"
        >
          Simulate QR Scan
        </Button>
      </div>
    </div>
  );
}
