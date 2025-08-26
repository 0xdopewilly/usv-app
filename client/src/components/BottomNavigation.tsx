import { useLocation } from 'wouter';
import { Home, Wallet, QrCode, Image, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/scan', icon: QrCode, label: 'Scan' },
    { path: '/nfts', icon: Image, label: 'NFTs' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const shouldShowNavigation = navItems.some(item => location === item.path);

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-secondary border-t border-dark-accent z-50 safe-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center py-2 px-4 h-auto ${
                isActive ? 'text-electric-blue' : 'text-gray-400'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
