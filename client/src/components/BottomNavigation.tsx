import { useLocation } from 'wouter';
import { Home, QrCode, Image, Settings, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/qr-scan', icon: QrCode, label: 'Scan', isCenter: true },
    { path: '/nft-portfolio', icon: Image, label: 'NFTs' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const shouldShowNavigation = navItems.some(item => location === item.path);

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom mx-3 mb-3"
      initial={{ y: 120, opacity: 0, scale: 0.95 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
    >
      {/* Enhanced Glass Background with Animated Gradient Border */}
      <div className="glass-dark rounded-[28px] p-1 shadow-2xl relative overflow-hidden">
        {/* Animated Gradient Border */}
        <div className="absolute inset-0 animate-gradient-slow rounded-[28px] p-[1px]">
          <div className="glass-dark rounded-[27px] h-full w-full"></div>
        </div>
        
        {/* Navigation Content */}
        <div className="relative flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <motion.div
                key={item.path}
                whileHover={{
                  scale: item.isCenter ? 1.15 : 1.08,
                  y: item.isCenter ? -10 : -4,
                }}
                whileTap={{ 
                  scale: 0.92,
                  y: item.isCenter ? -6 : -2
                }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="flex flex-col items-center"
              >
                {/* Center QR Button - Special Treatment */}
                {item.isCenter ? (
                  <motion.div
                    className="relative"
                    animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <Button
                      onClick={() => setLocation(item.path)}
                      className="animate-gradient-shift hover-lift hover-glow w-16 h-16 rounded-[24px] text-white shadow-lg border-2 border-white/20 relative overflow-hidden interactive"
                      data-testid={`nav-${item.path.replace('/', 'home') || 'qr-scan'}`}
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 animate-shimmer"></div>
                      <IconComponent className="w-7 h-7 relative z-10" />
                    </Button>
                    
                    {/* Active Glow Ring for Center Button */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-[24px] animate-glow"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                ) : (
                  /* Regular Navigation Buttons */
                  <motion.div
                    className="flex flex-col items-center space-y-1 px-1"
                    animate={isActive ? { y: [0, -2, 0] } : {}}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(item.path)}
                      className={`interactive hover-lift rounded-[16px] p-3 h-auto transition-all duration-300 ${
                        isActive 
                          ? 'text-white bg-gradient-purple shadow-md' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                      data-testid={`nav-${item.path.replace('/', 'home') || item.label.toLowerCase()}`}
                    >
                      <motion.div
                        animate={isActive ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </motion.div>
                    </Button>
                    
                    {/* Label with Fade Animation */}
                    <motion.span
                      className={`text-xs font-medium transition-all duration-200 ${
                        isActive ? 'text-white' : 'text-gray-500'
                      }`}
                      animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {item.label}
                    </motion.span>
                    
                    {/* Active Indicator Dot */}
                    {isActive && (
                      <motion.div
                        className="w-1 h-1 bg-gradient-electric rounded-full animate-pulse"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.2 }}
                      />
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Ambient Glow Effect Under Navigation */}
      <motion.div
        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-4 bg-gradient-electric opacity-20 blur-xl rounded-full"
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
