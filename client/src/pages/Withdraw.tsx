import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { withdrawSchema } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';

type WithdrawForm = z.infer<typeof withdrawSchema>;

export default function Withdraw() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<WithdrawForm>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      toAddress: '',
      amount: 0,
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawForm) => {
      const response = await apiRequest('/api/transactions/withdraw', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Initiated",
        description: "Please complete security verification",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setLocation('/security');
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Unable to process withdrawal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: WithdrawForm) => {
    await withdrawMutation.mutateAsync(data);
  };

  const setMaxAmount = () => {
    const availableBalance = (user?.balance || 0) - (user?.stakedBalance || 0);
    setValue('amount', Math.max(0, availableBalance));
  };

  const availableBalance = (user?.balance || 0) - (user?.stakedBalance || 0);

  return (
    <div className="min-h-screen bg-dark-primary relative px-6 pt-12 safe-top">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center mb-8"
      >
        <Button
          onClick={() => setLocation('/wallet')}
          variant="ghost"
          size="icon"
          className="w-10 h-10 bg-dark-accent rounded-full text-gray-300 hover:text-white mr-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white">Withdraw</h1>
      </motion.div>
      
      <motion.form
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div>
          <Label htmlFor="toAddress" className="block text-gray-400 text-sm mb-2">
            Recipient Address
          </Label>
          <Input
            id="toAddress"
            type="text"
            placeholder="Enter Solana wallet address"
            className="w-full bg-dark-accent text-white px-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-electric-blue"
            data-testid="input-recipient-address"
            {...register('toAddress')}
          />
          {errors.toAddress && (
            <p className="text-error-red text-sm mt-1">{errors.toAddress.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="amount" className="block text-gray-400 text-sm mb-2">
            Amount
          </Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              min="0"
              max={availableBalance}
              className="w-full bg-dark-accent text-white px-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-electric-blue pr-16"
              data-testid="input-amount"
              {...register('amount', { valueAsNumber: true })}
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              USV
            </span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-gray-400 text-sm" data-testid="text-available-balance">
              Available: {availableBalance.toFixed(2)} USV
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              onClick={setMaxAmount}
              className="text-electric-blue text-sm p-0 h-auto"
              data-testid="button-max-amount"
            >
              MAX
            </Button>
          </div>
          {errors.amount && (
            <p className="text-error-red text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>
        
        <div>
          <Label className="block text-gray-400 text-sm mb-2">Network Fee</Label>
          <Card className="bg-dark-secondary p-4 border-dark-accent">
            <div className="flex justify-between">
              <span className="text-gray-300">Solana Network Fee</span>
              <span className="text-white" data-testid="text-network-fee">0.000005 SOL</span>
            </div>
          </Card>
        </div>
        
        <Button
          type="submit"
          disabled={withdrawMutation.isPending || availableBalance <= 0}
          className="w-full bg-gradient-to-r from-electric-blue to-crypto-gold text-white py-4 h-auto text-lg font-semibold glow-button disabled:opacity-50"
          data-testid="button-continue"
        >
          {withdrawMutation.isPending ? 'Processing...' : 'Continue'}
        </Button>
      </motion.form>
    </div>
  );
}
