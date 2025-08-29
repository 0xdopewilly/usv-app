import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Apple, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import ConnectWallet from '@/components/ConnectWallet';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
      if (isLogin) {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to USV Token",
        });
      } else {
        await signup({ email, password, fullName });
        toast({
          title: "Account created!",
          description: "Welcome to the USV Token ecosystem",
        });
      }
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-6">
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      {/* Auth Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20 relative z-10"
      >
        
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-black">USV</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-white text-2xl font-bold mb-2">
            {isLogin ? 'Welcome back' : 'Join USV Token'}
          </h1>
          <p className="text-purple-300 text-sm">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </motion.div>

        {/* Auth Form */}
        <motion.form
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {!isLogin && (
            <div>
              <Input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 py-4 rounded-2xl focus:ring-2 focus:ring-purple-500"
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
              className="w-full bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 py-4 rounded-2xl focus:ring-2 focus:ring-purple-500"
              required
              data-testid="input-email"
            />
          </div>
          
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 py-4 rounded-2xl focus:ring-2 focus:ring-purple-500 pr-12"
              required
              data-testid="input-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              data-testid="button-toggle-password"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-purple-500/25"
            data-testid="button-submit-auth"
          >
            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </motion.form>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="flex items-center my-8"
        >
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="px-4 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </motion.div>

        {/* Alternative Auth Methods */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="space-y-4"
        >
          {/* Apple Sign In */}
          <Button
            variant="outline"
            className="w-full bg-black/40 border-gray-600 text-white py-4 rounded-2xl hover:bg-black/60 transition-all duration-300"
            data-testid="button-apple-signin"
          >
            <Apple className="w-5 h-5 mr-3" />
            Continue with Apple
          </Button>

          {/* Email Sign In */}
          <Button
            variant="outline"
            className="w-full bg-gray-800/40 border-gray-600 text-white py-4 rounded-2xl hover:bg-gray-800/60 transition-all duration-300"
            data-testid="button-email-signin"
          >
            <Mail className="w-5 h-5 mr-3" />
            Continue with Email
          </Button>

          {/* Wallet Connect */}
          <div className="pt-2">
            <ConnectWallet 
              onConnected={(publicKey) => {
                toast({
                  title: "Wallet Connected!",
                  description: `Connected to ${publicKey.slice(0, 8)}...`,
                });
              }}
              className="w-full"
            />
          </div>
        </motion.div>

        {/* Toggle Auth Mode */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="text-center mt-8"
        >
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
        </motion.div>
      </motion.div>
    </div>
  );
}