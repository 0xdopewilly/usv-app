import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Simple working app component
function SimpleUSVApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-md w-full">
          {/* Logo */}
          <div className="mb-8">
            <img src="/usv-logo.png" alt="USV" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">USV Token</h1>
            <p className="text-purple-300">Ultra Smooth Vape Ecosystem</p>
          </div>
          
          {/* Login Form */}
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
            <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
            
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email address"
                className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 py-3 px-4 rounded-xl"
              />
              <input 
                type="password" 
                placeholder="Password"
                className="w-full bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 py-3 px-4 rounded-xl"
              />
              <button className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 rounded-xl font-semibold">
                Sign In
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account? 
                <span className="text-purple-400 hover:text-purple-300 ml-1 cursor-pointer">
                  Sign up
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SimpleUSVApp />
  </StrictMode>
);