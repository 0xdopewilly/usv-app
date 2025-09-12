import { useLocation } from 'wouter';
import { Home, QrCode, Image, Settings, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '' },
    { path: '/wallet', icon: Wallet, label: '' },
    { path: '/qr-scan', icon: QrCode, label: '', isCenter: true },
    { path: '/nft-portfolio', icon: Image, label: '' },
    { path: '/settings', icon: Settings, label: '' },
  ];

  const shouldShowNavigation = navItems.some(item => location === item.path);

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-xl z-50 safe-bottom rounded-t-[32px] mx-4 mb-4 shadow-2xl"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
    >
      <div className="flex items-center justify-around py-4">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location === item.path;
          
          return (
            <motion.div
              key={item.path}
              whileHover={{
                scale: item.isCenter ? 1.1 : 1.05,
                y: item.isCenter ? -8 : -2,
                boxShadow: item.isCenter 
                  ? "0 12px 30px rgba(236, 72, 153, 0.6)"
                  : isActive 
                    ? "0 4px 15px rgba(255, 255, 255, 0.2)" 
                    : "0 4px 15px rgba(156, 163, 175, 0.2)"
              }}
              whileTap={{ 
                scale: 0.95,
                y: 0
              }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center py-2 px-3 h-auto relative ${
                  item.isCenter 
                    ? 'bg-pink-500 rounded-[28px] w-14 h-14 text-white shadow-lg shadow-pink-500/40' 
                    : isActive 
                      ? 'text-white' 
                      : 'text-gray-400'
                }`}
                data-testid={`nav-${item.path.replace('/', '')}`}
              >
                <IconComponent className={item.isCenter ? "w-6 h-6" : "w-5 h-5"} />
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
