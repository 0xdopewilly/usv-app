import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export default function AuthSelection() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Animated smoke/vape effects */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(139, 92, 246, 0.3), transparent)`,
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, -Math.random() * 300 - 200],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/60 rounded-full"
            animate={{
              y: [0, -800],
              x: [0, Math.sin(Date.now() * 0.001 + i) * 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 8 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: '100%',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <motion.h1
            animate={{
              textShadow: [
                "0 0 20px #8b5cf6",
                "0 0 40px #06b6d4",
                "0 0 20px #8b5cf6"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-5xl font-bold text-white mb-4"
            style={{
              background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Welcome to USV
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-cyan-300 font-light"
          >
            Enter the Future of Vaping
          </motion.p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="space-y-6 w-full max-w-sm"
        >
          {/* Signup Button */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setLocation('/signup')}
              className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-0 rounded-2xl text-white font-semibold text-lg relative overflow-hidden group"
              data-testid="button-signup"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">Create Account</span>
            </Button>
          </motion.div>

          {/* Login Button */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setLocation('/login')}
              className="w-full h-16 bg-black/40 hover:bg-black/60 border-2 border-cyan-400/50 hover:border-cyan-400 rounded-2xl text-white font-semibold text-lg backdrop-blur-sm relative overflow-hidden group"
              data-testid="button-login"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10">Sign In</span>
            </Button>
          </motion.div>

          {/* Wallet Login Button */}
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setLocation('/wallet-login')}
              className="w-full h-16 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 border-0 rounded-2xl text-white font-semibold text-lg relative overflow-hidden group"
              data-testid="button-wallet-login"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <span className="relative z-10">🔗 Connect Wallet</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-white/60 mt-12 text-sm"
        >
          Powered by Solana Blockchain
        </motion.p>
      </div>
    </div>
  );
}