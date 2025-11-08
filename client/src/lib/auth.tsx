import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { clearPasscodeUnlock } from '@/lib/passcode';
import i18n from '@/lib/i18n';

interface User {
  id: string;
  email: string;
  fullName: string;
  balance: number;
  stakedBalance: number;
  walletAddress?: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
  faceIdEnabled: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  preferredLanguage: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  setAuthState: (token: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('token') : null
  );
  const queryClient = useQueryClient();

  // Debug logging for auth state
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('🔍 Auth Debug:', { storedToken, currentToken: token });
  }, [token]);

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    enabled: !!token,
    retry: false,
  });

  // Debug logging for user query
  useEffect(() => {
    console.log('🔍 User Query Debug:', { user, isLoading, error, hasToken: !!token });
  }, [user, isLoading, error, token]);

  // Sync language with user preference on login/load
  useEffect(() => {
    if (user?.preferredLanguage) {
      const currentLang = i18n.language;
      if (currentLang !== user.preferredLanguage) {
        i18n.changeLanguage(user.preferredLanguage);
        localStorage.setItem('i18nextLng', user.preferredLanguage);
        console.log(`🌐 Language synced to user preference: ${user.preferredLanguage}`);
      }
    }
  }, [user?.preferredLanguage]);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', { email, password });
      return await response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['/api/user/profile'], data.user);
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await apiRequest('POST', '/api/auth/signup', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setToken(data.token);
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['/api/user/profile'], data.user);
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const signup = async (data: SignupData) => {
    await signupMutation.mutateAsync(data);
  };

  const setAuthState = (newToken: string, newUser: User) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    queryClient.setQueryData(['/api/user/profile'], newUser);
  };

  const logout = () => {
    // Clear passcode unlock state for this user
    if (user?.id) {
      clearPasscodeUnlock(user.id);
    }
    
    // Clear token and storage first
    setToken(null);
    localStorage.removeItem('token');
    localStorage.clear(); // Clear all localStorage
    
    // Clear query cache
    queryClient.clear();
    queryClient.resetQueries();
    
    // Clear any wallet connections
    if (window.solana && window.solana.disconnect) {
      try {
        window.solana.disconnect();
      } catch (error) {
        console.log('Wallet already disconnected');
      }
    }
    
    // Force reload to ensure clean state
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  // Helper function to refresh token when expired
  const refreshToken = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await apiRequest('POST', '/api/auth/refresh-token', {
        userId: user.id,
        email: user.email
      });
      const data = await response.json();
      
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
    return false;
  };

  // No longer needed since we define queryFn directly in useQuery

  return (
    <AuthContext.Provider
      value={{
        user: user as User | null,
        token,
        login,
        signup,
        setAuthState,
        logout,
        refreshToken,
        isAuthenticated: !!token && !!user,
        isLoading: isLoading || loginMutation.isPending || signupMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
