import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function AuthPageSimple() {
  // Clear any invalid tokens on mount to ensure clean state
  useEffect(() => {
    console.log('🔍 AuthPageSimple mounted - clearing invalid tokens');
    localStorage.removeItem('token');
  }, []);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (!isLogin && (!fullName || fullName.length < 2)) {
        throw new Error('Full name must be at least 2 characters long');
      }

      if (isLogin) {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to USV Token",
        });
      } else {
        await signup({ email, password, fullName, acceptTerms: true });
        toast({
          title: "Account created!",
          description: "Welcome to the USV Token ecosystem",
        });
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 rounded-3xl p-8 border border-gray-700">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold mb-2">
            {isLogin ? 'Welcome back' : 'Join USV Token'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <Input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 py-4 rounded-2xl focus:ring-2 focus:ring-purple-500"
                required={!isLogin}
                data-testid="input-fullname"
              />
            </div>
          )}
          
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 py-4 rounded-2xl focus:ring-2 focus:ring-purple-500"
              required
              data-testid="input-email"
            />
          </div>
          
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 border-gray-600 text-white placeholder-gray-400 py-4 rounded-2xl focus:ring-2 focus:ring-purple-500"
              required
              data-testid="input-password"
            />
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg"
            data-testid="button-submit-auth"
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        {/* Toggle Auth Mode */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              data-testid="button-toggle-auth-mode"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}