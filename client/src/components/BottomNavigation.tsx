import { useLocation } from 'wouter';
import { Home, QrCode, Clock, User, Grid } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/wallet', icon: Grid, label: 'Wallet' },
    { path: '/qr-scan', icon: QrCode, label: 'Scan' },
    { path: '/transaction-history', icon: Clock, label: 'History' },
    { path: '/settings', icon: User, label: 'Settings' },
  ];

  const shouldShowNavigation = navItems.some(item => location === item.path);

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div 
        className="rounded-[24px] backdrop-blur-lg"
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(255, 255, 255, 0.5)'
        }}
      >        
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path || location.startsWith(item.path + '/');
            
            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.9 }}
                onClick={() => setLocation(item.path)}
                className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
                style={{
                  color: isActive ? 'var(--gray-900)' : 'var(--gray-400)'
                }}
                data-testid={`nav-${item.path.replace('/', 'home') || item.label.toLowerCase()}`}
              >
                <IconComponent 
                  className="w-6 h-6" 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
