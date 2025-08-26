import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export default function AuthSelection() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center z-10 w-full max-w-sm px-6"
      >
        {/* Logo */}
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-purple-500/30">
          <span className="text-purple-600 font-bold text-2xl">USV</span>
        </div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-white text-3xl font-bold mb-2"
        >
          Welcome to USV
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-white/80 text-lg mb-12"
        >
          Ultra Smooth Vape Ecosystem
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="space-y-4"
        >
          <Button
            onClick={() => setLocation('/signup')}
            className="w-full bg-white text-purple-600 hover:bg-gray-100 rounded-2xl py-4 text-lg font-semibold shadow-lg"
            data-testid="button-signup"
          >
            Sign Up
          </Button>

          <Button
            onClick={() => setLocation('/login')}
            variant="outline"
            className="w-full border-white/30 text-white hover:bg-white/10 rounded-2xl py-4 text-lg font-semibold"
            data-testid="button-login"
          >
            Log In
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}