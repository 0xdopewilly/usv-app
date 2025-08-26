import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@shared/schema';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupEmail() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { signup, isLoading } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      acceptTerms: false,
    },
  });

  const acceptTerms = watch('acceptTerms');

  const onSubmit = async (data: SignupForm) => {
    try {
      await signup(data);
      setLocation('/captcha');
    } catch (error) {
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : 'Failed to create account',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent)`,
              width: Math.random() * 120 + 60,
              height: Math.random() * 120 + 60,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -Math.random() * 200 - 100],
              opacity: [0, 0.4, 0],
              scale: [0.7, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 4 + 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLocation('/signup')}
        className="absolute top-12 left-6 w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full text-cyan-400 hover:text-white hover:bg-black/50 z-10 border border-cyan-400/30"
        data-testid="button-back"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      
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
            Sign Up
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-cyan-300 text-lg"
          >
            Create your USV Token account
          </motion.p>
        </motion.div>
      
        <motion.form
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-6"
        >
        <div>
          <Label htmlFor="fullName" className="sr-only">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Full Name"
            className="w-full bg-black/40 text-white px-4 py-4 rounded-xl border-2 border-purple-500/30 focus:border-cyan-400 backdrop-blur-sm"
            data-testid="input-fullname"
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-error-red text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email" className="sr-only">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            className="w-full bg-black/40 text-white px-4 py-4 rounded-xl border-2 border-purple-500/30 focus:border-cyan-400 backdrop-blur-sm"
            data-testid="input-email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-error-red text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div className="relative">
          <Label htmlFor="password" className="sr-only">Password</Label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full bg-dark-accent text-white px-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-electric-blue pr-12"
            data-testid="input-password"
            {...register('password')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            data-testid="button-toggle-password"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
          {errors.password && (
            <p className="text-error-red text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={acceptTerms}
            onCheckedChange={(checked) => setValue('acceptTerms', !!checked)}
            className="mt-1 rounded border-cyan-400/50 bg-black/30 text-cyan-400 focus:ring-cyan-400"
            data-testid="checkbox-terms"
          />
          <Label htmlFor="terms" className="text-sm text-gray-300 leading-5">
            I agree to the{' '}
            <a href="#" className="text-cyan-400 hover:underline">
              Terms & Conditions
            </a>{' '}
            and{' '}
            <a href="#" className="text-cyan-400 hover:underline">
              Privacy Policy
            </a>
          </Label>
        </div>
        {errors.acceptTerms && (
          <p className="text-error-red text-sm">{errors.acceptTerms.message}</p>
        )}
        
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold text-lg disabled:opacity-50 relative overflow-hidden"
          data-testid="button-create-account"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
        </motion.form>
      </div>
    </div>
  );
}
