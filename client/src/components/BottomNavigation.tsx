import { useLocation } from 'wouter';
import { Home, QrCode, Clock, Settings, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/qr-scan', icon: QrCode, label: 'Scan', isCenter: true },
    { path: '/transaction-history', icon: Clock, label: 'History' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const shouldShowNavigation = navItems.some(item => location === item.path);

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-[9999] p-2 pb-safe"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 250, damping: 25 }}
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
            const isActive = location === item.path || location.startsWith(item.path + '/');
            
            // Define active styles that apply to ALL tabs
            const activeStylesCenter = 'w-12 h-12 rounded-[16px] text-white bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 animate-gradient-shift ring-2 ring-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.45)] filter drop-shadow-[0_0_14px_rgba(168,85,247,0.55)]';
            const activeStylesRegular = 'rounded-[12px] p-2 h-auto text-white bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 animate-gradient-shift ring-2 ring-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.45)] filter drop-shadow-[0_0_14px_rgba(168,85,247,0.55)]';
            
            return (
              <motion.div
                key={item.path}
                whileHover={{
                  scale: item.isCenter ? 1.08 : 1.03,
                  y: -1,
                }}
                whileTap={{ 
                  scale: 0.96
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="flex flex-col items-center"
              >
                {/* Center QR Button */}
                {item.isCenter ? (
                  <motion.div
                    animate={isActive ? { rotate: [0, 5, -5, 0] } : {}}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <Button
                      onClick={() => setLocation(item.path)}
                      className={`shadow-md relative overflow-hidden transition-all duration-300 ${
                        isActive 
                          ? activeStylesCenter
                          : 'w-12 h-12 rounded-[16px] bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                      }`}
                      data-testid={`nav-${item.path.replace('/', 'home') || 'qr-scan'}`}
                    >
                      <IconComponent className="w-5 h-5 relative z-10" />
                    </Button>
                  </motion.div>
                ) : (
                  /* Regular Navigation Buttons */
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation(item.path)}
                    className={`transition-all duration-200 relative ${
                      isActive 
                        ? activeStylesRegular
                        : 'rounded-[12px] p-2 h-auto text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                    data-testid={`nav-${item.path.replace('/', 'home') || item.label.toLowerCase()}`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
