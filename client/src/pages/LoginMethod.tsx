import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Apple, Mail } from 'lucide-react';
import SmokeAnimation from '@/components/SmokeAnimation';
import { useToast } from '@/hooks/use-toast';

export default function LoginMethod() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleAppleLogin = () => {
    toast({
      title: "Apple ID Login",
      description: "Apple ID integration would be implemented here",
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 bg-dark-primary">
      <SmokeAnimation />
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLocation('/auth')}
        className="absolute top-12 left-6 w-10 h-10 bg-dark-accent rounded-full text-gray-300 hover:text-white z-10"
        data-testid="button-back"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 z-10"
      >
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome Back</h1>
        <p className="text-gray-400">Sign in to your account</p>
      </motion.div>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-sm space-y-4 z-10"
      >
        <Button
          onClick={handleAppleLogin}
          className="w-full bg-white text-black py-4 h-auto text-lg font-semibold hover:bg-gray-100 flex items-center justify-center space-x-3"
          data-testid="button-apple-login"
        >
          <Apple className="w-5 h-5" />
          <span>Continue with Apple</span>
        </Button>
        
        <Button
          onClick={() => setLocation('/login/email')}
          className="w-full bg-dark-accent text-white py-4 h-auto text-lg font-semibold hover:bg-gray-600 flex items-center justify-center space-x-3"
          data-testid="button-email-login"
        >
          <Mail className="w-5 h-5" />
          <span>Continue with Email</span>
        </Button>
      </motion.div>
    </div>
  );
}
