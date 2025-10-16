import { useState, useEffect } from 'react';
import { PasscodeEntry } from './PasscodeEntry';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';

interface PasscodeLockProps {
  children: React.ReactNode;
}

export function PasscodeLock({ children }: PasscodeLockProps) {
  const { user } = useAuth();
  const [isLocked, setIsLocked] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user has passcode and if session is unlocked
    const checkPasscodeLock = () => {
      const hasPasscode = (user as any)?.hasPasscode;
      
      if (!hasPasscode) {
        // No passcode set, unlock immediately
        setIsLocked(false);
        setIsChecking(false);
        return;
      }

      // Check if session is already unlocked for THIS specific user
      const userUnlockKey = `passcode_unlocked_${user?.id}`;
      const sessionUnlocked = sessionStorage.getItem(userUnlockKey);
      
      if (sessionUnlocked === 'true') {
        setIsLocked(false);
      } else {
        setIsLocked(true);
      }
      
      setIsChecking(false);
    };

    if (user) {
      checkPasscodeLock();
    }
  }, [user]);

  const verifyPasscode = async (passcode: string): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/passcode/verify', { passcode });
      const data = await response.json();
      return data.valid;
    } catch (error) {
      return false;
    }
  };

  const handlePasscodeSuccess = () => {
    // Set user-specific session flag to remember unlock state
    if (user?.id) {
      const userUnlockKey = `passcode_unlocked_${user.id}`;
      sessionStorage.setItem(userUnlockKey, 'true');
    }
    setIsLocked(false);
  };

  // Show content while checking or if user is not loaded (let auth handle it)
  if (isChecking || !user) {
    return <>{children}</>;
  }

  if (isLocked) {
    return (
      <PasscodeEntry
        onSuccess={handlePasscodeSuccess}
        title="Unlock App"
        subtitle="Enter your 6-digit passcode to continue"
        onVerify={verifyPasscode}
      />
    );
  }

  return <>{children}</>;
}
