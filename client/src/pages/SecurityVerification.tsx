import { useLocation } from 'wouter';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verificationSchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';

type VerificationForm = z.infer<typeof verificationSchema>;

export default function SecurityVerification() {
  const [, setLocation] = useLocation();
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationForm>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: '',
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerificationForm) => {
      const response = await apiRequest('/api/verify/2fa', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Verification Successful",
        description: "Transaction has been processed successfully",
      });
      setTimeout(() => {
        setLocation('/wallet');
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would trigger sending a new code
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent",
      });
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
  });

  const onSubmit = async (data: VerificationForm) => {
    await verifyMutation.mutateAsync(data);
  };

  const handleResendCode = () => {
    if (resendCooldown === 0) {
      resendMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-dark-primary relative px-6 pt-12 safe-top">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center mb-8"
      >
        <Button
          onClick={() => setLocation('/withdraw')}
          variant="ghost"
          size="icon"
          className="w-10 h-10 bg-dark-accent rounded-full text-gray-300 hover:text-white mr-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Security Verification</h1>
      </motion.div>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-crypto-gold rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-white">Verify Your Transaction</h2>
        <p className="text-gray-400">
          Enter the verification code sent to your email or use your authenticator app
        </p>
      </motion.div>
      
      <motion.form
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div>
          <Label htmlFor="code" className="block text-gray-400 text-sm mb-2">
            Verification Code
          </Label>
          <Input
            id="code"
            type="text"
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full bg-dark-accent text-white px-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-electric-blue text-center text-2xl tracking-widest"
            data-testid="input-verification-code"
            {...register('code')}
          />
          {errors.code && (
            <p className="text-error-red text-sm mt-1">{errors.code.message}</p>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={verifyMutation.isPending}
          className="w-full bg-gradient-to-r from-electric-blue to-crypto-gold text-white py-4 h-auto text-lg font-semibold glow-button disabled:opacity-50"
          data-testid="button-verify"
        >
          {verifyMutation.isPending ? 'Verifying...' : 'Verify & Send'}
        </Button>
        
        <Button
          type="button"
          variant="link"
          onClick={handleResendCode}
          disabled={resendCooldown > 0 || resendMutation.isPending}
          className="w-full text-electric-blue py-2 disabled:text-gray-500"
          data-testid="button-resend-code"
        >
          {resendCooldown > 0 
            ? `Resend Code (${resendCooldown}s)`
            : resendMutation.isPending 
            ? 'Sending...'
            : 'Resend Code'
          }
        </Button>
      </motion.form>
      
      {verifyMutation.isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-success-green text-sm text-center"
          data-testid="text-verification-success"
        >
          Transaction verified successfully!
        </motion.div>
      )}
    </div>
  );
}
