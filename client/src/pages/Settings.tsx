import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ChevronRight, Camera, Upload, Loader2, Copy, Key, Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/ThemeProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import NotificationService from '@/lib/notifications';
import { PasscodeSetup } from '@/components/PasscodeSetup';
import { PasscodeEntry } from '@/components/PasscodeEntry';

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const [localSettings, setLocalSettings] = useState({
    pushNotifications: user?.pushNotifications ?? true,
    emailNotifications: user?.emailNotifications ?? true,
    twoFactorEnabled: user?.twoFactorEnabled ?? false,
    preferredLanguage: user?.preferredLanguage ?? 'en',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 2FA state
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState<'setup' | 'verify' | 'disable'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Passcode state
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false);
  const [showPasscodeEntry, setShowPasscodeEntry] = useState(false);
  const [passcodeAction, setPasscodeAction] = useState<'export' | 'setup'>('setup');
  
  // Export state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportedPrivateKey, setExportedPrivateKey] = useState('');
  const [exportedWalletAddress, setExportedWalletAddress] = useState('');

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<typeof localSettings>) => {
      return await apiRequest('PATCH', '/api/user/profile', updates);
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

  const handleToggle = async (key: keyof typeof localSettings, value: boolean) => {
    // Request notification permission if enabling push notifications
    if (key === 'pushNotifications' && value) {
      // Check if it's iOS Safari
      const isIOSSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && !(window.navigator as any).standalone;
      
      if (isIOSSafari) {
        toast({
          title: '📱 iOS Safari Limitation',
          description: 'Push notifications require installing the app to your Home Screen first. Tap Share → Add to Home Screen.',
          variant: 'destructive',
        });
        return;
      }

      if (!('Notification' in window)) {
        toast({
          title: '❌ Not Supported',
          description: 'Your browser doesn\'t support push notifications',
          variant: 'destructive',
        });
        return;
      }

      const hasPermission = await NotificationService.requestPermission();
      if (!hasPermission) {
        toast({
          title: '🔔 Permission Denied',
          description: 'Please enable notifications in your browser settings to receive transaction alerts',
          variant: 'destructive',
        });
        return;
      }
      
      // Show success toast first
      toast({
        title: '🔔 Notifications Enabled!',
        description: 'You\'ll receive alerts for all transactions',
      });
      
      // Show test notification
      await NotificationService.showNotification('🎉 Notifications Enabled', {
        body: 'You\'ll receive push notifications for all your transactions!',
        tag: 'settings',
        requireInteraction: false,
      });
    }
    
    const updates = { [key]: value };
    setLocalSettings(prev => ({ ...prev, ...updates }));
    updateProfileMutation.mutate(updates);
  };

  const handleLanguageChange = (language: string) => {
    const updates = { preferredLanguage: language };
    setLocalSettings(prev => ({ ...prev, ...updates }));
    updateProfileMutation.mutate(updates);
    // Change i18n language and save to localStorage for persistence
    i18n.changeLanguage(language);
    localStorage.setItem('i18nextLng', language);
    
    toast({
      title: t('settings.updateSuccess'),
      description: `Language changed to ${language === 'en' ? 'English' : language === 'es' ? 'Español' : 'Français'}`,
    });
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
  
  // 2FA mutations
  const enable2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/user/2fa/enable');
      return response.json();
    },
    onSuccess: (data) => {
      setQrCodeUrl(data.qrCodeUrl);
      setTwoFASecret(data.secret);
      setTwoFAStep('verify');
    },
    onError: () => {
      toast({
        title: 'Failed to Enable 2FA',
        description: 'Unable to generate 2FA setup',
        variant: 'destructive',
      });
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/user/2fa/verify-enable', { code });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication is now active',
      });
      setShow2FADialog(false);
      setVerificationCode('');
      setLocalSettings(prev => ({ ...prev, twoFactorEnabled: true }));
    },
    onError: () => {
      toast({
        title: 'Verification Failed',
        description: 'Invalid code. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest('POST', '/api/user/2fa/disable', { code });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been turned off',
      });
      setShow2FADialog(false);
      setVerificationCode('');
      setLocalSettings(prev => ({ ...prev, twoFactorEnabled: false }));
    },
    onError: () => {
      toast({
        title: 'Failed to Disable 2FA',
        description: 'Invalid code. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handle2FAClick = () => {
    if (user?.twoFactorEnabled) {
      setTwoFAStep('disable');
    } else {
      setTwoFAStep('setup');
      enable2FAMutation.mutate();
    }
    setShow2FADialog(true);
  };

  const handleVerify2FA = () => {
    if (twoFAStep === 'verify') {
      verify2FAMutation.mutate(verificationCode);
    } else if (twoFAStep === 'disable') {
      disable2FAMutation.mutate(verificationCode);
    }
  };

  // Passcode mutations
  const passcodeSetupMutation = useMutation({
    mutationFn: async (passcode: string) => {
      const response = await apiRequest('POST', '/api/passcode/setup', { passcode });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: 'Passcode Set',
        description: 'Your passcode has been successfully configured',
      });
      setShowPasscodeSetup(false);
      
      // If setting up for export, now show entry dialog
      if (passcodeAction === 'export') {
        setTimeout(() => {
          setShowPasscodeEntry(true);
        }, 300);
      }
    },
    onError: () => {
      toast({
        title: 'Setup Failed',
        description: 'Unable to setup passcode',
        variant: 'destructive',
      });
    },
  });

  const verifyPasscodeMutation = async (passcode: string): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/passcode/verify', { passcode });
      const data = await response.json();
      return data.valid;
    } catch (error) {
      return false;
    }
  };

  const handlePasscodeSetup = () => {
    setPasscodeAction('setup');
    setShowPasscodeSetup(true);
  };

  const handleExportData = () => {
    if (!(user as any)?.hasPasscode) {
      // No passcode set, prompt to setup
      setPasscodeAction('export');
      setShowPasscodeSetup(true);
    } else {
      // Passcode exists, show entry dialog
      setPasscodeAction('export');
      setShowPasscodeEntry(true);
    }
  };

  const handlePasscodeVerified = async (passcode: string) => {
    setShowPasscodeEntry(false);
    
    try {
      // Call backend endpoint to get decrypted private key
      const response = await apiRequest('POST', '/api/passcode/export', { passcode });
      const data = await response.json();
      
      if (data.privateKey && data.walletAddress) {
        // Convert private key array to Base58
        const uint8Array = new Uint8Array(data.privateKey);
        const privateKeyBase58 = btoa(String.fromCharCode(...Array.from(uint8Array)));
        
        // Show in dialog instead of downloading
        setExportedPrivateKey(privateKeyBase58);
        setExportedWalletAddress(data.walletAddress);
        setShowExportDialog(true);
      } else {
        console.error('Export error: Invalid response from server', data);
        toast({
          title: 'Export Failed',
          description: 'Unable to retrieve private key from server.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Unable to export private key. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleCopyPrivateKey = () => {
    navigator.clipboard.writeText(exportedPrivateKey);
    toast({
      title: 'Copied!',
      description: 'Private key copied to clipboard',
    });
  };
  
  const handleCopyWalletAddress = () => {
    navigator.clipboard.writeText(exportedWalletAddress);
    toast({
      title: 'Copied!',
      description: 'Wallet address copied to clipboard',
    });
  };


  return (
    <div className="min-h-screen bg-white dark:bg-black relative pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="flex items-center p-6 pt-12 safe-top"
      >
        <h1 className="text-2xl font-bold text-black dark:text-white">{t('settings.title')}</h1>
      </motion.div>
      
      {/* Settings Groups */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="px-6 space-y-6"
      >
        {/* Profile Section - Enhanced */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
        >
          <Card className="bg-gray-100 dark:bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-[32px] overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-black dark:text-white">{t('settings.profile')}</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <motion.div 
                  className="w-20 h-20 rounded-[28px] overflow-hidden border-2 border-purple-400/50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ 
                    scale: 1.05, 
                    rotate: 2,
                    borderColor: "rgba(168, 85, 247, 0.8)",
                    boxShadow: "0 8px 25px rgba(168, 85, 247, 0.4)"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt={user?.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-400 flex items-center justify-center rounded-[26px]">
                      <span className="text-black dark:text-white font-bold text-xl">{user?.fullName?.charAt(0) || 'U'}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gray-100 dark:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-black dark:text-white" />
                  </div>
                </motion.div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-[12px] border-2 border-black flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-[4px]"></div>
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-black dark:text-white text-lg mb-1" data-testid="text-user-name">
                  {user?.fullName || 'Amanda'}
                </p>
                <p className="text-purple-300 text-sm mb-2" data-testid="text-user-email">
                  {user?.email || 'amanda@example.com'}
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-black dark:text-white font-bold text-sm">{user?.balance?.toFixed(0) || '4,216'}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">USV Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-black dark:text-white font-bold text-sm">{user?.stakedBalance?.toFixed(0) || '850'}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">Staked</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upload Profile Picture Button */}
            <div className="flex flex-col space-y-3">
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 8px 25px rgba(168, 85, 247, 0.4), 0 4px 15px rgba(34, 211, 238, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadProfilePictureMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-black dark:text-white"
                  data-testid="button-upload-picture"
                >
                <Upload className="h-4 w-4 mr-2" />
                  {uploadProfilePictureMutation.isPending ? 'Uploading...' : 'Change Profile Picture'}
                </Button>
              </motion.div>
              <p className="text-gray-600 dark:text-gray-400 text-xs text-center">JPG, PNG or GIF (max 5MB)</p>
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
        </motion.div>

        {/* Language Selection */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
        >
          <Card className="bg-gray-100 dark:bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-[32px] overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-black dark:text-white">{t('settings.language')}</h3>
          </div>
          <div className="p-4">
            <Select
              value={i18n.language || localSettings.preferredLanguage}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-full bg-gray-100 dark:bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 text-gray-800 dark:text-white rounded-[20px] focus:ring-2 focus:ring-cyan-400 transition-all duration-200 focus:scale-[1.02]">
                <SelectValue placeholder="Select Language">
                  {i18n.language === 'en' && 'English 🇺🇸'}
                  {i18n.language === 'es' && 'Español 🇪🇸'}
                  {i18n.language === 'fr' && 'Français 🇫🇷'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                <SelectItem value="en" className="text-gray-800 dark:text-white">English 🇺🇸</SelectItem>
                <SelectItem value="es" className="text-gray-800 dark:text-white">Español 🇪🇸</SelectItem>
                <SelectItem value="fr" className="text-gray-800 dark:text-white">Français 🇫🇷</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
        </motion.div>
        
        {/* Theme Toggle */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
        >
          <Card className="bg-gray-100 dark:bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-[32px] overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <div className="p-4 border-b border-dark-accent">
              <h3 className="font-semibold text-black dark:text-white">{t('settings.appearance')}</h3>
            </div>
            <div className="p-4">
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between hover:bg-purple-500/10 rounded-lg p-2 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-800 dark:text-white">{t('settings.theme')}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={theme === 'light'}
                  onCheckedChange={toggleTheme}
                  onClick={(e) => e.stopPropagation()}
                  className="data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-purple-400"
                />
              </button>
            </div>
          </Card>
        </motion.div>
        
        {/* Address Book */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, type: "spring" }}
        >
          <Card className="bg-gray-100 dark:bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-[32px] overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-black dark:text-white">{t('settings.savedAddresses')}</h3>
          </div>
          <motion.div
            whileHover={{ 
              scale: 1.01,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              boxShadow: "0 4px 15px rgba(168, 85, 247, 0.15)"
            }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="ghost"
              onClick={() => setLocation('/saved-addresses')}
              className="w-full p-4 text-left flex items-center justify-between hover:bg-transparent"
              data-testid="button-address-book"
            >
              <span className="text-gray-700 dark:text-gray-300">{t('settings.manageAddresses')}</span>
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </motion.div>
        </Card>
        </motion.div>
        
        {/* Notifications */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, type: "spring" }}
        >
          <Card className="bg-gray-100 dark:bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-[32px] overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-black dark:text-white">{t('settings.preferences')}</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-gray-700 dark:text-gray-300">
                  {t('settings.pushNotifications')}
                </Label>
                <Switch
                  id="push-notifications"
                  checked={localSettings.pushNotifications}
                  onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
                  className="data-[state=checked]:bg-cyan-400"
                  data-testid="switch-push-notifications"
                />
              </div>
              {localSettings.pushNotifications && NotificationService.hasPermission() && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await NotificationService.showNotification('🔔 Test Notification', {
                      body: 'Push notifications are working! You\'ll receive alerts for transactions.',
                      tag: 'test',
                    });
                    toast({
                      title: 'Test Sent!',
                      description: 'Check for the notification above',
                    });
                  }}
                  className="w-full text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
                  data-testid="button-test-notification"
                >
                  {t('settings.testNotification')}
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="text-gray-700 dark:text-gray-300">
                {t('settings.emailNotifications')}
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
        </motion.div>
        
        {/* Security Settings */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
        >
          <Card className="bg-gray-100 dark:bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-[32px] overflow-hidden hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
            <div className="p-4 border-b border-dark-accent">
              <h3 className="font-semibold text-black dark:text-white">{t('settings.security')}</h3>
            </div>
            <div className="p-4 space-y-4">
              <motion.div
                whileHover={{ 
                  scale: 1.01,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  boxShadow: "0 4px 15px rgba(34, 211, 238, 0.15)"
                }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="ghost"
                  onClick={handle2FAClick}
                  className="w-full text-left py-2 text-gray-700 dark:text-gray-300 flex items-center justify-between hover:bg-transparent"
                  data-testid="button-2fa-setup"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{t('settings.twoFactor')}</span>
                    <div className="flex items-center gap-2">
                      {user?.twoFactorEnabled && (
                        <span className="text-xs text-green-400">Enabled</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ 
                  scale: 1.01,
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  boxShadow: "0 4px 15px rgba(168, 85, 247, 0.15)"
                }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  variant="ghost"
                  onClick={handlePasscodeSetup}
                  className="w-full text-left py-2 text-gray-700 dark:text-gray-300 flex items-center justify-between hover:bg-transparent"
                  data-testid="button-setup-passcode"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{(user as any)?.hasPasscode ? t('settings.changePasscode') : t('settings.setupPasscode')}</span>
                    <div className="flex items-center gap-2">
                      {(user as any)?.hasPasscode ? (
                        <span className="text-xs text-green-400">Enabled</span>
                      ) : (
                        <span className="text-xs text-purple-400">Recommended</span>
                      )}
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Account Actions */}
        <Card className="bg-gray-100 dark:bg-black/40 backdrop-blur-sm border-2 border-purple-500/30 rounded-3xl overflow-hidden">
          <div className="p-4 border-b border-dark-accent">
            <h3 className="font-semibold text-black dark:text-white">Account</h3>
          </div>
          <div className="p-4 space-y-2">
            <Button
              variant="ghost"
              onClick={handleExportData}
              className="w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:bg-dark-accent"
              data-testid="button-export-data"
            >
              {t('settings.exportMyData')}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:bg-dark-accent"
              data-testid="button-privacy-policy"
            >
              Privacy Policy
            </Button>
            <Button
              variant="ghost"
              className="w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:bg-dark-accent"
              data-testid="button-terms-of-service"
            >
              {t('settings.termsOfService')}
            </Button>
            <motion.div
              whileHover={{ 
                scale: 1.01,
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                boxShadow: "0 4px 15px rgba(220, 38, 38, 0.2)"
              }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full text-left py-2 text-error-red hover:bg-transparent hover:text-error-red"
                data-testid="button-logout"
              >
                {t('settings.logOut')}
              </Button>
            </motion.div>
          </div>
        </Card>
      </motion.div>
      
      {/* 2FA Setup/Disable Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-black dark:text-white max-w-md">
          <DialogHeader>
            <DialogTitle>
              {twoFAStep === 'disable' ? t('settings.disable2FA') : t('settings.enable2FA')}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {twoFAStep === 'setup' && 'Setting up 2FA...'}
              {twoFAStep === 'verify' && 'Scan the QR code with your authenticator app'}
              {twoFAStep === 'disable' && 'Enter your 2FA code to disable'}
            </DialogDescription>
          </DialogHeader>
          
          {twoFAStep === 'setup' && enable2FAMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
          )}
          
          {twoFAStep === 'verify' && qrCodeUrl && (
            <div className="space-y-4">
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" data-testid="img-2fa-qr" />
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Secret Key (Manual Entry)</p>
                <p className="text-sm text-black dark:text-white font-mono break-all">{twoFASecret}</p>
              </div>
              <div>
                <Label htmlFor="verify-code" className="text-gray-700 dark:text-gray-300">Enter 6-Digit Code</Label>
                <Input
                  id="verify-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="mt-2 bg-gray-800 border-gray-700 text-black dark:text-white text-center text-lg tracking-widest"
                  maxLength={6}
                  data-testid="input-2fa-code"
                />
              </div>
            </div>
          )}
          
          {twoFAStep === 'disable' && (
            <div>
              <Label htmlFor="disable-code" className="text-gray-700 dark:text-gray-300">Enter 6-Digit Code</Label>
              <Input
                id="disable-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="mt-2 bg-gray-800 border-gray-700 text-black dark:text-white text-center text-lg tracking-widest"
                maxLength={6}
                data-testid="input-2fa-disable-code"
              />
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              onClick={() => {
                setShow2FADialog(false);
                setVerificationCode('');
              }}
              variant="outline"
              className="border-gray-700 text-gray-700 dark:text-gray-300"
              data-testid="button-2fa-cancel"
            >
              Cancel
            </Button>
            {(twoFAStep === 'verify' || twoFAStep === 'disable') && (
              <Button
                onClick={handleVerify2FA}
                disabled={verificationCode.length !== 6 || verify2FAMutation.isPending || disable2FAMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-cyan-500"
                data-testid="button-2fa-verify"
              >
                {verify2FAMutation.isPending || disable2FAMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : twoFAStep === 'disable' ? (
                  'Disable 2FA'
                ) : (
                  'Verify & Enable'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Passcode Setup Dialog */}
      {showPasscodeSetup && (
        <PasscodeSetup
          onComplete={(passcode) => passcodeSetupMutation.mutate(passcode)}
          onCancel={() => setShowPasscodeSetup(false)}
          title={passcodeAction === 'export' ? 'Setup Passcode for Export' : 'Setup Passcode'}
          showSkip={false}
        />
      )}
      
      {/* Passcode Entry Dialog */}
      {showPasscodeEntry && (
        <PasscodeEntry
          onSuccess={handlePasscodeVerified}
          onCancel={() => setShowPasscodeEntry(false)}
          title="Verify Passcode"
          subtitle="Enter passcode to export private key"
          onVerify={verifyPasscodeMutation}
        />
      )}
      
      {/* Private Key Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/30 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
              <Key className="w-6 h-6 text-purple-500" />
              Your Private Key
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              ⚠️ Never share this with anyone. Store it securely offline.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Wallet Address */}
            <div>
              <Label className="text-gray-600 dark:text-gray-400 text-xs mb-2 block">Wallet Address</Label>
              <div className="relative bg-gray-800/50 rounded-[20px] p-4 border border-gray-700">
                <p className="text-black dark:text-white font-mono text-sm break-all pr-10">{exportedWalletAddress}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyWalletAddress}
                  className="absolute top-3 right-3 h-8 w-8 p-0 hover:bg-purple-500/20"
                  data-testid="button-copy-address"
                >
                  <Copy className="w-4 h-4 text-purple-400" />
                </Button>
              </div>
            </div>
            
            {/* Private Key */}
            <div>
              <Label className="text-gray-600 dark:text-gray-400 text-xs mb-2 block">Private Key (Base58)</Label>
              <div className="relative bg-gray-800/50 rounded-[20px] p-4 border border-gray-700">
                <p className="text-black dark:text-white font-mono text-sm break-all pr-10">{exportedPrivateKey}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyPrivateKey}
                  className="absolute top-3 right-3 h-8 w-8 p-0 hover:bg-purple-500/20"
                  data-testid="button-copy-private-key"
                >
                  <Copy className="w-4 h-4 text-purple-400" />
                </Button>
              </div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-[20px] p-4">
              <p className="text-red-400 text-xs">
                <strong>Security Warning:</strong> Anyone with this private key can access and control your wallet. 
                Never store it digitally or share it with anyone.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={() => setShowExportDialog(false)}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 w-full"
              data-testid="button-close-export"
            >
              I've Saved It Securely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
