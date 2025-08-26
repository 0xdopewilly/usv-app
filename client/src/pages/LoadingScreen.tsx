import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import SmokeAnimation from '@/components/SmokeAnimation';

export default function LoadingScreen() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Clear any stale localStorage data that might cause issues
    const token = localStorage.getItem('token');
    if (token) {
      // Check if we have a user in localStorage but it's invalid
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token expired, clear it
          localStorage.removeItem('token');
        }
      } catch {
        // Invalid token, clear it
        localStorage.removeItem('token');
      }
    }

    const timer = setTimeout(() => {
      setLocation('/auth');
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-dark-primary">
      <SmokeAnimation />
      
      {/* USV Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-20 z-10"
      >
        <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-electric-blue to-crypto-gold rounded-xl flex items-center justify-center">
          <span className="text-3xl font-bold text-white">USV</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-300">USV Token</h1>
        <p className="text-gray-400 mt-2">Ultra Smooth Vape Ecosystem</p>
      </motion.div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-20 left-8 right-8 z-10">
        <div className="w-full bg-dark-accent rounded-full h-2 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'easeInOut' }}
            className="bg-gradient-to-r from-electric-blue to-crypto-gold h-2 rounded-full"
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-400"
        >
          Loading...
        </motion.p>
        
        {/* Debug: Clear Storage Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          onClick={() => {
            localStorage.clear();
            sessionStorage.clear();
            setLocation('/auth');
          }}
          className="mt-4 mx-auto block text-xs text-gray-500 hover:text-gray-300 underline"
        >
          Having issues? Clear cache & restart
        </motion.button>
      </div>
    </div>
  );
}
