import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ChevronRight, Camera, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import NotificationService from '@/lib/notifications';

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();

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
      
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      
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
    if (key === 'pushNotifications' && value) {
      const hasPermission = await NotificationService.requestPermission();
      if (!hasPermission) {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive',
        });
        return;
      }
      
      await NotificationService.showNotification('Notifications Enabled', {
        body: 'You will now receive transaction notifications',
        tag: 'settings',
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
    i18n.changeLanguage(language);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }
      
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

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--mint-bg)' }}>
      <BottomNavigation />
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('settings.title')}</h1>
      </div>
      
      {/* Settings Groups */}
      <div className="px-6 space-y-4">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[24px] p-6"
          style={{ background: 'var(--white)', boxShadow: 'var(--shadow-md)' }}
        >
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('settings.profile')}</h3>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <motion.div 
                className="w-20 h-20 rounded-[20px] overflow-hidden cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                whileTap={{ scale: 0.95 }}
                style={{ boxShadow: 'var(--shadow)' }}
              >
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user?.fullName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" 
                       style={{ background: 'var(--mint-accent)' }}>
                    <span className="text-white font-bold text-xl">{user?.fullName?.charAt(0) || 'U'}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </motion.div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }} data-testid="text-user-name">
                {user?.fullName || 'User'}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }} data-testid="text-user-email">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadProfilePictureMutation.isPending}
            className="w-full py-3 rounded-[16px] font-semibold text-sm"
            style={{ background: 'var(--mint-accent)', color: 'white', boxShadow: 'var(--shadow)' }}
            data-testid="button-upload-picture"
          >
            {uploadProfilePictureMutation.isPending ? 'Uploading...' : 'Change Profile Picture'}
          </motion.button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
            data-testid="input-profile-picture"
          />
        </motion.div>

        {/* Language */}
        <div className="rounded-[24px] p-6" style={{ background: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('settings.language')}</h3>
          <Select
            value={localSettings.preferredLanguage}
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="input-clean">
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: 'var(--white)' }}>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Address Book */}
        <div className="rounded-[24px]" style={{ background: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/saved-addresses')}
            className="w-full p-6 text-left flex items-center justify-between"
            data-testid="button-address-book"
          >
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{t('settings.savedAddresses')}</span>
            <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </motion.button>
        </div>
        
        {/* Notifications */}
        <div className="rounded-[24px] p-6" style={{ background: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('settings.preferences')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" style={{ color: 'var(--text-secondary)' }}>
                {t('settings.pushNotifications')}
              </Label>
              <Switch
                id="push-notifications"
                checked={localSettings.pushNotifications}
                onCheckedChange={(checked) => handleToggle('pushNotifications', checked)}
                data-testid="switch-push-notifications"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" style={{ color: 'var(--text-secondary)' }}>
                {t('settings.emailNotifications')}
              </Label>
              <Switch
                id="email-notifications"
                checked={localSettings.emailNotifications}
                onCheckedChange={(checked) => handleToggle('emailNotifications', checked)}
                data-testid="switch-email-notifications"
              />
            </div>
          </div>
        </div>
        
        {/* Security */}
        <div className="rounded-[24px]" style={{ background: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handle2FAClick}
            className="w-full p-6 text-left flex items-center justify-between"
            data-testid="button-2fa-setup"
          >
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</span>
            <div className="flex items-center gap-2">
              {user?.twoFactorEnabled && (
                <span className="text-xs font-semibold" style={{ color: 'var(--success-green)' }}>Enabled</span>
              )}
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            </div>
          </motion.button>
        </div>

        {/* Account Actions */}
        <div className="rounded-[24px] p-6 space-y-3" style={{ background: 'var(--white)', boxShadow: 'var(--shadow-md)' }}>
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Account</h3>
          <button className="w-full text-left py-2" style={{ color: 'var(--text-secondary)' }} data-testid="button-privacy-policy">
            Privacy Policy
          </button>
          <button className="w-full text-left py-2" style={{ color: 'var(--text-secondary)' }} data-testid="button-terms-of-service">
            Terms of Service
          </button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full text-left py-2 font-semibold"
            style={{ color: 'var(--error-red)' }}
            data-testid="button-logout"
          >
            Log Out
          </motion.button>
        </div>
      </div>
      
      {/* 2FA Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent style={{ background: 'var(--white)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text-primary)' }}>
              {twoFAStep === 'disable' ? 'Disable 2FA' : 'Enable 2FA'}
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--text-secondary)' }}>
              {twoFAStep === 'setup' && 'Setting up 2FA...'}
              {twoFAStep === 'verify' && 'Scan the QR code with your authenticator app'}
              {twoFAStep === 'disable' && 'Enter your 2FA code to disable'}
            </DialogDescription>
          </DialogHeader>
          
          {twoFAStep === 'setup' && enable2FAMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <div className="spinner w-8 h-8"></div>
            </div>
          )}
          
          {twoFAStep === 'verify' && qrCodeUrl && (
            <div className="space-y-4">
              <div className="flex justify-center p-4 rounded-lg" style={{ background: 'var(--gray-100)' }}>
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" data-testid="img-2fa-qr" />
              </div>
              <div className="rounded-lg p-3" style={{ background: 'var(--gray-100)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Secret Key</p>
                <p className="text-sm font-mono break-all" style={{ color: 'var(--text-primary)' }}>{twoFASecret}</p>
              </div>
              <div>
                <Label htmlFor="verify-code" style={{ color: 'var(--text-secondary)' }}>Enter 6-Digit Code</Label>
                <Input
                  id="verify-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="input-clean mt-2 text-center text-lg tracking-widest"
                  maxLength={6}
                  data-testid="input-2fa-code"
                />
              </div>
            </div>
          )}
          
          {twoFAStep === 'disable' && (
            <div>
              <Label htmlFor="disable-code" style={{ color: 'var(--text-secondary)' }}>Enter 6-Digit Code</Label>
              <Input
                id="disable-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="input-clean mt-2 text-center text-lg tracking-widest"
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
              className="btn-secondary"
              data-testid="button-2fa-cancel"
            >
              Cancel
            </Button>
            {(twoFAStep === 'verify' || twoFAStep === 'disable') && (
              <Button
                onClick={handleVerify2FA}
                disabled={verificationCode.length !== 6 || verify2FAMutation.isPending || disable2FAMutation.isPending}
                className="btn-primary"
                data-testid="button-2fa-verify"
              >
                {verify2FAMutation.isPending || disable2FAMutation.isPending ? (
                  'Verifying...'
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
    </div>
  );
}
