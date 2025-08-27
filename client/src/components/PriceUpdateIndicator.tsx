import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface PriceUpdateIndicatorProps {
  isUpdating: boolean;
  lastUpdated: string;
  changePercent: number;
}

export default function PriceUpdateIndicator({ 
  isUpdating, 
  lastUpdated, 
  changePercent 
}: PriceUpdateIndicatorProps) {
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (isUpdating) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isUpdating]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
    >
      <motion.div
        animate={showPulse ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5 }}
        className={`flex items-center space-x-2 px-4 py-2 rounded-2xl backdrop-blur-md border ${
          isUpdating 
            ? 'bg-blue-600/20 border-blue-400/30' 
            : changePercent >= 0 
              ? 'bg-green-600/20 border-green-400/30'
              : 'bg-red-600/20 border-red-400/30'
        }`}
      >
        {isUpdating ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-4 h-4 text-blue-400" />
          </motion.div>
        ) : changePercent >= 0 ? (
          <TrendingUp className="w-4 h-4 text-green-400" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-400" />
        )}
        
        <span className="text-white text-sm font-medium">
          {isUpdating ? 'Updating Prices...' : `Updated ${lastUpdated}`}
        </span>
        
        {!isUpdating && (
          <span className={`text-xs font-semibold ${
            changePercent >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}