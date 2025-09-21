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
      className="fixed bottom-0 left-0 right-0 z-[9999] p-2"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
      style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'auto'
      }}
    >
      {/* Compact Glass Background */}
      <div className="glass-dark rounded-[20px] shadow-lg relative overflow-hidden">        
        {/* Navigation Content - Much More Compact */}
        <div className="relative flex items-center justify-around px-1 py-2">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <motion.div
                key={item.path}
                whileHover={{
                  scale: item.isCenter ? 1.1 : 1.05,
                  y: -2,
                }}
                whileTap={{ 
                  scale: 0.95
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex flex-col items-center relative"
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
                      className={`w-12 h-12 rounded-[16px] shadow-md relative overflow-hidden transition-all duration-300 ${
                        isActive 
                          ? 'animate-gradient-shift text-white' 
                          : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                      }`}
                      data-testid={`nav-${item.path.replace('/', 'home') || 'qr-scan'}`}
                    >
                      <IconComponent className="w-5 h-5 relative z-10" />
                    </Button>
                    
                    {/* Active Purple Glow Ring for Center Button */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-[16px] ring-2 ring-purple-500/70 shadow-lg shadow-purple-500/30 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          boxShadow: ['0 0 10px rgba(168, 85, 247, 0.5)', '0 0 20px rgba(168, 85, 247, 0.7)', '0 0 10px rgba(168, 85, 247, 0.5)']
                        }}
                        transition={{ 
                          duration: 0.3,
                          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    )}
                  </motion.div>
                ) : (
                  /* Regular Navigation Buttons - More Compact */
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(item.path)}
                      className={`rounded-[12px] p-2 h-auto transition-all duration-200 relative ${
                        isActive 
                          ? 'text-white bg-white/20' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                      data-testid={`nav-${item.path.replace('/', 'home') || item.label.toLowerCase()}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </Button>
                    
                    {/* Active Purple Glow Ring for Regular Buttons */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-[12px] ring-2 ring-purple-500/70 shadow-lg shadow-purple-500/30 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          boxShadow: ['0 0 10px rgba(168, 85, 247, 0.5)', '0 0 20px rgba(168, 85, 247, 0.7)', '0 0 10px rgba(168, 85, 247, 0.5)']
                        }}
                        transition={{ 
                          duration: 0.3,
                          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      />
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
