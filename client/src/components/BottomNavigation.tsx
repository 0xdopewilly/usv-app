import { useLocation } from 'wouter';
import { Calendar, QrCode, Image, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: '/home', icon: () => <div className="w-5 h-5 text-current font-bold flex items-center justify-center">W</div>, label: '' },
    { path: '/wallet', icon: Calendar, label: '' },
    { path: '/qr-scan', icon: QrCode, label: '', isCenter: true },
    { path: '/nft-portfolio', icon: Image, label: '' },
    { path: '/settings', icon: Settings, label: '' },
  ];

  const shouldShowNavigation = navItems.some(item => location === item.path);

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/60 backdrop-blur-lg z-50 safe-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center py-2 px-3 h-auto relative ${
                item.isCenter 
                  ? 'bg-pink-500 rounded-2xl w-12 h-12 text-white shadow-lg shadow-pink-500/40' 
                  : isActive 
                    ? 'text-white' 
                    : 'text-gray-400'
              }`}
              data-testid={`nav-${item.path.replace('/', '')}`}
            >
              {typeof IconComponent === 'function' ? <IconComponent /> : <IconComponent className={item.isCenter ? "w-5 h-5" : "w-4 h-4"} />}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
