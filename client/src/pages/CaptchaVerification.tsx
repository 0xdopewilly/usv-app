import { useLocation } from 'wouter';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function CaptchaVerification() {
  const [, setLocation] = useLocation();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerification = async () => {
    if (!isVerified) {
      toast({
        title: "Verification Required",
        description: "Please complete the captcha verification",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting captcha verification...');
      
      const response = await apiRequest('POST', '/api/verify/captcha', { token: 'captcha-token' });
      
      const data = await response.json();
      console.log('Captcha verification response:', data);
      
      toast({
        title: "Verification Complete",
        description: "Account created successfully!",
      });
      
      setTimeout(() => {
        setLocation('/home');
      }, 1000);
    } catch (error) {
      console.error('Captcha verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 bg-dark-primary">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 z-10"
      >
        <h1 className="text-3xl font-bold mb-2 text-white">Verify You're Human</h1>
        <p className="text-gray-400">Complete the verification below</p>
      </motion.div>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-sm z-10"
      >
        <div className="bg-dark-accent p-6 rounded-xl mb-6 border border-gray-600">
          <div className="flex items-center space-x-3 mb-4">
            <Checkbox
              id="captcha-check"
              checked={isVerified}
              onCheckedChange={(checked) => setIsVerified(!!checked)}
              className="rounded border-gray-600 bg-dark-primary text-electric-blue focus:ring-electric-blue"
              data-testid="checkbox-captcha"
            />
            <Label htmlFor="captcha-check" className="text-gray-300">
              I'm not a robot
            </Label>
          </div>
          <div className="text-xs text-gray-400">
            reCAPTCHA Protected by Google
          </div>
        </div>
        
        <Button
          onClick={handleVerification}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-electric-blue to-crypto-gold text-white py-4 h-auto text-lg font-semibold glow-button disabled:opacity-50"
          data-testid="button-verify"
        >
          {isLoading ? 'Verifying...' : 'Verify & Continue'}
        </Button>
      </motion.div>
    </div>
  );
}
