import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

interface LoadingScreenProps {
  autoNavigate?: boolean;
}

export default function LoadingScreen({ autoNavigate = false }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (autoNavigate) {
            setTimeout(() => {
              setLocation('/');
            }, 500);
          }
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [setLocation, autoNavigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            animate={{
              x: [0, Math.random() * 400, 0],
              y: [0, Math.random() * 800, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
          />
        ))}
      </div>

      {/* Futuristic grid overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* USV Logo with holographic effect */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-center mb-20 relative z-10"
      >
        {/* Holographic rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-40 h-40 rounded-full border-2 border-cyan-400/30 -m-12"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-48 h-48 rounded-full border border-purple-400/20 -m-16"
        />
        
        <motion.div
          animate={{ 
            textShadow: [
              "0 0 20px #8b5cf6, 0 0 40px #06b6d4",
              "0 0 40px #06b6d4, 0 0 60px #8b5cf6",
              "0 0 60px #8b5cf6, 0 0 80px #06b6d4",
              "0 0 20px #8b5cf6, 0 0 40px #06b6d4"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-7xl font-bold text-white mb-4 relative"
          style={{
            background: 'linear-gradient(45deg, #8b5cf6, #06b6d4, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          USV
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-xl text-cyan-300 font-light tracking-wider"
        >
          Ultra Smooth Vape
        </motion.p>
      </motion.div>

      {/* Futuristic Progress Bar */}
      <div className="fixed bottom-20 left-8 right-8 z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-cyan-400/50 rounded-full blur-md" />
          <div className="relative bg-gray-900/80 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-purple-500/30">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400 rounded-full relative"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 bg-cyan-400/30 rounded-full"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </div>
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white/90 mt-6 text-sm font-medium tracking-wide"
        >
          {progress < 100 ? (
            <span className="flex items-center justify-center space-x-2">
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Initializing Blockchain...
              </motion.span>
              <span className="text-cyan-400">{Math.round(progress)}%</span>
            </span>
          ) : (
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-cyan-400 font-semibold"
            >
              Welcome to the Future!
            </motion.span>
          )}
        </motion.p>
      </div>
    </div>
  );
}