import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
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

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: !!token,
  });

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

  const logout = () => {
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

  // Update Authorization header when token changes
  useEffect(() => {
    if (token) {
      queryClient.setDefaultOptions({
        queries: {
          meta: {
            headers: { Authorization: `Bearer ${token}` }
          }
        }
      });
    }
  }, [token, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: user as User | null,
        token,
        login,
        signup,
        logout,
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
