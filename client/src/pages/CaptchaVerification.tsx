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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent)`,
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -Math.random() * 150 - 100],
              opacity: [0, 0.4, 0],
              scale: [0.8, 1.2, 0.6],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h1
            animate={{
              textShadow: [
                "0 0 20px #8b5cf6",
                "0 0 30px #06b6d4",
                "0 0 20px #8b5cf6"
              ]
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-4xl font-bold mb-4 text-white"
            style={{
              background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Verify You're Human
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-cyan-300 text-lg"
          >
            Complete the verification below
          </motion.p>
        </motion.div>
      
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-sm"
        >
          <div className="bg-black/40 p-6 rounded-2xl mb-6 border-2 border-purple-500/30 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Checkbox
              id="captcha-check"
              checked={isVerified}
              onCheckedChange={(checked) => setIsVerified(!!checked)}
              className="rounded border-cyan-400/50 bg-black/30 text-cyan-400 focus:ring-cyan-400"
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
          className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold text-lg disabled:opacity-50 relative overflow-hidden"
          data-testid="button-verify"
        >
          {isLoading ? 'Verifying...' : 'Verify & Continue'}
        </Button>
        </motion.div>
      </div>
    </div>
  );
}
