import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@shared/schema';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginEmail() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      setLocation('/');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 bg-dark-primary">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLocation('/login')}
        className="absolute top-12 left-6 w-10 h-10 bg-dark-accent rounded-full text-gray-300 hover:text-white z-10"
        data-testid="button-back"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 z-10"
      >
        <h1 className="text-3xl font-bold mb-2 text-white">Log In</h1>
        <p className="text-gray-400">Enter your credentials</p>
      </motion.div>
      
      <motion.form
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-6 z-10"
      >
        <div>
          <Label htmlFor="email" className="sr-only">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            className="w-full bg-dark-accent text-white px-4 py-4 rounded-xl border-0 focus:ring-2 focus:ring-electric-blue"
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
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="current-password"
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
        
        <div className="text-right">
          <Button
            type="button"
            variant="link"
            className="text-electric-blue text-sm p-0 h-auto"
            data-testid="link-forgot-password"
          >
            Forgot Password?
          </Button>
        </div>
        
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-electric-blue to-crypto-gold text-white py-4 h-auto text-lg font-semibold glow-button disabled:opacity-50"
          data-testid="button-login"
        >
          {isLoading ? 'Logging In...' : 'Log In'}
        </Button>
      </motion.form>
    </div>
  );
}
