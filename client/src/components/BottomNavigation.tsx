import { useLocation } from 'wouter';
import { Calendar, QrCode, Image, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: '/home', icon: () => <div className="w-6 h-6 text-current font-bold flex items-center justify-center">W</div>, label: 'Home' },
    { path: '/wallet', icon: Calendar, label: 'Wallet' },
    { path: '/qr-scan', icon: QrCode, label: 'Scan', isCenter: true },
    { path: '/nft-portfolio', icon: Image, label: 'NFTs' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const shouldShowNavigation = navItems.some(item => location === item.path);

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 z-50 safe-bottom">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center py-2 px-4 h-auto relative ${
                item.isCenter 
                  ? 'bg-purple-600 rounded-full w-14 h-14 text-white' 
                  : isActive 
                    ? 'text-purple-400' 
                    : 'text-gray-400'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              {typeof Icon === 'function' ? <Icon /> : <Icon className="w-5 h-5" />}
              {!item.isCenter && <span className="text-xs mt-1">{item.label}</span>}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
