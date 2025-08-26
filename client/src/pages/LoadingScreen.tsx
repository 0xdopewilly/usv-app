import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLocation('/home');
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center mb-16 z-10"
      >
        <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-purple-500/30">
          <span className="text-purple-600 font-bold text-4xl">USV</span>
        </div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-white text-3xl font-bold mb-2"
        >
          Ultra Smooth Vape
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="text-white/80 text-lg"
        >
          Powered by Solana
        </motion.p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="w-80 z-10"
      >
        <div className="bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        <div className="text-center">
          <span className="text-white/60 text-sm">Loading... {progress}%</span>
        </div>
      </motion.div>
    </div>
  );
}