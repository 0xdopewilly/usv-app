import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Simple working login page
function USVLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl font-bold">USV</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">USV Token</h1>
          <p className="text-purple-300">Ultra Smooth Vape Ecosystem</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
          
          {/* Email Input */}
          <div className="mb-4">
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {/* Password Input */}
          <div className="mb-6">
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {/* Sign In Button */}
          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 rounded-xl font-semibold mb-4 transition-all">
            Sign In
          </button>
          
          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">or continue with</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>
          
          {/* Google Button */}
          <button className="w-full bg-white text-gray-800 py-3 rounded-xl font-semibold mb-3 hover:bg-gray-100 transition-all flex items-center justify-center">
            <span className="mr-2">🇬</span>
            Continue with Google
          </button>
          
          {/* Apple Button */}
          <button className="w-full bg-black text-white py-3 rounded-xl font-semibold mb-6 hover:bg-gray-800 transition-all flex items-center justify-center">
            <span className="mr-2">🍎</span>
            Continue with Apple
          </button>
          
          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account? 
              <span className="text-purple-400 hover:text-purple-300 ml-1 cursor-pointer font-semibold">
                Sign up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <USVLoginPage />
  </StrictMode>
);