import { useLocation } from 'wouter';
import { Home, QrCode, Image, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '' },
    { path: '/trading', icon: TrendingUp, label: '' },
    { path: '/qr-scan', icon: QrCode, label: '', isCenter: true },
    { path: '/nft-portfolio', icon: Image, label: '' },
    { path: '/settings', icon: Settings, label: '' },
  ];

  const shouldShowNavigation = navItems.some(item => location === item.path);

  if (!shouldShowNavigation) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-xl z-50 safe-bottom rounded-t-3xl mx-4 mb-4">
      <div className="flex items-center justify-around py-4">
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
                  ? 'bg-pink-500 rounded-2xl w-14 h-14 text-white shadow-lg shadow-pink-500/40' 
                  : isActive 
                    ? 'text-white' 
                    : 'text-gray-400'
              }`}
              data-testid={`nav-${item.path.replace('/', '')}`}
            >
              {typeof IconComponent === 'function' ? <IconComponent /> : <IconComponent className={item.isCenter ? "w-6 h-6" : "w-5 h-5"} />}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
