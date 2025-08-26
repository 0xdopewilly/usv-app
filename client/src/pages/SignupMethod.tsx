import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Apple, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignupMethod() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleAppleSignup = () => {
    setLocation('/signup/apple');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Animated smoke/vape effects - continuation from auth page */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent)`,
              width: Math.random() * 150 + 80,
              height: Math.random() * 150 + 80,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, Math.random() * 80 - 40],
              y: [0, -Math.random() * 250 - 150],
              opacity: [0, 0.6, 0],
              scale: [0.6, 1.1, 0.7],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-cyan-400/70 rounded-full"
            animate={{
              y: [0, -600],
              x: [0, Math.sin(Date.now() * 0.001 + i) * 60],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 4,
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: '100%',
            }}
          />
        ))}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLocation('/auth-selection')}
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
          className="text-center mb-16"
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
            Create Account
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-cyan-300 text-lg"
          >
            Choose your signup method
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Apple ID Button */}
          <motion.div
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={handleAppleSignup}
              className="w-full h-16 bg-white text-black hover:bg-gray-100 rounded-2xl text-lg font-semibold flex items-center justify-center space-x-3 relative overflow-hidden group"
              data-testid="button-apple-signup"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-transparent opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
              <Apple className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Continue with Apple</span>
            </Button>
          </motion.div>
          
          {/* Email Button */}
          <motion.div
            whileHover={{ scale: 1.02, y: -3 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => setLocation('/signup/email')}
              className="w-full h-16 bg-black/40 hover:bg-black/60 border-2 border-purple-500/50 hover:border-purple-400 text-white rounded-2xl text-lg font-semibold backdrop-blur-sm flex items-center justify-center space-x-3 relative overflow-hidden group"
              data-testid="button-email-signup"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
              <Mail className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Continue with Email</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
