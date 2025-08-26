import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import SmokeAnimation from '@/components/SmokeAnimation';

export default function AuthSelection() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-8 bg-dark-primary">
      <SmokeAnimation />
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 z-10"
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-electric-blue to-crypto-gold rounded-xl flex items-center justify-center">
          <span className="text-2xl font-bold text-white">USV</span>
        </div>
        <h1 className="text-3xl font-bold mb-2 text-white">Welcome</h1>
        <p className="text-gray-400">Join the USV Token ecosystem</p>
      </motion.div>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-sm space-y-4 z-10"
      >
        <Button
          onClick={() => setLocation('/signup')}
          className="w-full bg-gradient-to-r from-electric-blue to-crypto-gold text-white py-4 h-auto text-lg font-semibold glow-button"
          data-testid="button-signup"
        >
          Sign Up
        </Button>
        <Button
          onClick={() => setLocation('/login')}
          variant="outline"
          className="w-full border-2 border-electric-blue text-electric-blue py-4 h-auto text-lg font-semibold hover:bg-electric-blue hover:text-white transition-all"
          data-testid="button-login"
        >
          Log In
        </Button>
      </motion.div>
    </div>
  );
}
