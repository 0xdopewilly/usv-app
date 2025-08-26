import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { useState } from 'react';

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [localSettings, setLocalSettings] = useState({
    pushNotifications: user?.pushNotifications ?? true,
    emailNotifications: user?.emailNotifications ?? true,
    faceIdEnabled: user?.faceIdEnabled ?? false,
    twoFactorEnabled: user?.twoFactorEnabled ?? false,
    preferredLanguage: user?.preferredLanguage ?? 'en',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<typeof localSettings>) => {
      const response = await apiRequest('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: { 'Content-Type': 'application/json' },
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to save settings",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof typeof localSettings, value: boolean) => {
    const updates = { [key]: value };
    setLocalSettings(prev => ({ ...prev, ...updates }));
    updateProfileMutation.mutate(updates);
  };

  const handleLanguageChange = (language: string) => {
    const updates = { preferredLanguage: language };
    setLocalSettings(prev => ({ ...prev, ...updates }));
    updateProfileMutation.mutate(updates);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const appIcons = [
    { id: 'default', gradient: 'from-electric-blue to-crypto-gold', label: 'Default' },
    { id: 'purple', gradient: 'from-purple-500 to-pink-500', label: 'Purple' },
    { id: 'green', gradient: 'from-green-500 to-blue-500', label: 'Green' },
    { id: 'red', gradient: 'from-red-500 to-orange-500', label: 'Red' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center p-6 pt-12 safe-top"
      >
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </motion.div>
      
      {/* Settings Groups */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 space-y-6"
      >
        {/* Profile Section */}
        <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-white">Profile</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-cyan-400 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold">{user?.fullName?.charAt(0) || 'U'}</span>
              </div>
              <div>
                <p className="font-medium text-white" data-testid="text-user-name">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-gray-400 text-sm" data-testid="text-user-email">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Language Selection */}
        <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-white">Language</h3>
          </div>
          <div className="p-4">
            <Select
              value={localSettings.preferredLanguage}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-full bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 text-white rounded-2xl focus:ring-2 focus:ring-cyan-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-accent border-gray-600">
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
        
        {/* Address Book */}
        <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-white">Address Book</h3>
          </div>
          <Button
            variant="ghost"
            className="w-full p-4 text-left flex items-center justify-between hover:bg-dark-accent"
            data-testid="button-address-book"
          >
            <span className="text-gray-300">Manage saved addresses</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </Button>
        </Card>
        
        {/* Notifications */}
        <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="text-gray-300">
                Push Notifications
              </Label>
              <Switch
                id="push-notifications"
                checked={localSettings.pushNotifications}
                onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
                className="data-[state=checked]:bg-cyan-400"
                data-testid="switch-push-notifications"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-gray-300">
                Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={localSettings.emailNotifications}
                onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
                className="data-[state=checked]:bg-cyan-400"
                data-testid="switch-email-notifications"
              />
            </div>
          </div>
        </Card>
        
        {/* App Customization */}
        <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-white">App Icon</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-4 gap-3">
              {appIcons.map((icon) => (
                <button
                  key={icon.id}
                  className="w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${icon.gradient.includes('electric-blue') ? 'var(--electric-blue), var(--crypto-gold)' : 
                      icon.gradient.includes('purple') ? '#8B5CF6, #EC4899' :
                      icon.gradient.includes('green') ? '#10B981, #3B82F6' : '#EF4444, #F97316'})`
                  }}
                  data-testid={`button-icon-${icon.id}`}
                >
                  <span className="text-white font-bold text-sm">USV</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
        
        {/* Security Settings */}
        <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-white">Security</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="face-id" className="text-gray-300">
                Use Face ID
              </Label>
              <Switch
                id="face-id"
                checked={localSettings.faceIdEnabled}
                onCheckedChange={(checked) => handleToggle('faceIdEnabled', checked)}
                className="data-[state=checked]:bg-cyan-400"
                data-testid="switch-face-id"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="require-auth" className="text-gray-300">
                Require Auth for Transactions
              </Label>
              <Switch
                id="require-auth"
                checked={localSettings.twoFactorEnabled}
                onCheckedChange={(checked) => handleToggle('twoFactorEnabled', checked)}
                className="data-[state=checked]:bg-cyan-400"
                data-testid="switch-require-auth"
              />
            </div>
            <Button
              variant="ghost"
              className="w-full text-left py-2 text-gray-300 flex items-center justify-between hover:bg-dark-accent"
              data-testid="button-2fa-setup"
            >
              <span>Two-Factor Authentication</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Button>
          </div>
        </Card>

        {/* Account Actions */}
        <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-white">Account</h3>
          </div>
          <div className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full text-left py-2 text-gray-300 hover:bg-dark-accent"
              data-testid="button-export-data"
            >
              Export My Data
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left py-2 text-gray-300 hover:bg-dark-accent"
              data-testid="button-privacy-policy"
            >
              Privacy Policy
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left py-2 text-gray-300 hover:bg-dark-accent"
              data-testid="button-terms-of-service"
            >
              Terms of Service
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-left py-2 text-error-red hover:bg-dark-accent hover:text-error-red"
              data-testid="button-logout"
            >
              Log Out
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
