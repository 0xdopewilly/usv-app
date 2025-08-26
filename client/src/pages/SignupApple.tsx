import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Apple } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function SignupApple() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    appleId: '',
    password: '',
    fullName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate Apple ID authentication with our backend
      await signup({
        fullName: formData.fullName,
        email: formData.appleId, // Use Apple ID as email
        password: formData.password,
        acceptTerms: true, // Apple ID users implicitly accept terms
      });

      toast({
        title: "Welcome to USV Token!",
        description: "Your Apple ID account has been created successfully.",
      });

      setLocation('/home');
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account with Apple ID",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-black">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLocation('/signup')}
        className="absolute top-12 left-6 w-10 h-10 bg-gray-800 rounded-full text-gray-300 hover:text-white z-10"
        data-testid="button-back"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Apple className="w-12 h-12 text-black mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-black mb-2">Sign Up with Apple ID</h1>
          <p className="text-gray-600 text-sm">Use your Apple ID to create your USV Token account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-black font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
              data-testid="input-fullname"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appleId" className="text-black font-medium">
              Apple ID
            </Label>
            <Input
              id="appleId"
              name="appleId"
              type="email"
              placeholder="your@icloud.com"
              value={formData.appleId}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
              data-testid="input-apple-id"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-black font-medium">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
              data-testid="input-password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            data-testid="button-submit-apple-signup"
          >
            {isLoading ? "Creating Account..." : "Continue"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to USV Token's Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}