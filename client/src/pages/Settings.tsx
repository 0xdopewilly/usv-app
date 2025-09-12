import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronRight, Camera, Upload } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { useState, useRef } from 'react';

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<typeof localSettings>) => {
      return await apiRequest('/api/user/profile', 'PATCH', updates);
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

  const uploadProfilePictureMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
      // Add Authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Unable to upload profile picture",
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      uploadProfilePictureMutation.mutate(file);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };


  return (
    <div className="min-h-screen bg-black relative pb-20">
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
        {/* Profile Section - Enhanced */}
        <Card className="bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-white">Profile</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-400/50 cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user?.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">{user?.fullName?.charAt(0) || 'U'}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-black flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-lg mb-1" data-testid="text-user-name">
                  {user?.fullName || 'Amanda'}
                </p>
                <p className="text-purple-300 text-sm mb-2" data-testid="text-user-email">
                  {user?.email || 'amanda@example.com'}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{user?.balance?.toFixed(0) || '4,216'}</p>
                    <p className="text-gray-400 text-xs">USV Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">{user?.stakedBalance?.toFixed(0) || '850'}</p>
                    <p className="text-gray-400 text-xs">Staked</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upload Profile Picture Button */}
            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProfilePictureMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white"
                data-testid="button-upload-picture"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadProfilePictureMutation.isPending ? 'Uploading...' : 'Change Profile Picture'}
              </Button>
              <p className="text-gray-400 text-xs text-center">JPG, PNG or GIF (max 5MB)</p>
            </div>
            
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
              data-testid="input-profile-picture"
            />
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
