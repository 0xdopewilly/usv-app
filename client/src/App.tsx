import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import LoadingScreen from "@/components/LoadingScreen";
// import AuthPage from "@/pages/AuthPage";
// import Home from "@/pages/Home";
// import TradingInterface from "@/pages/TradingInterface";
// import QRScan from "@/pages/QRScan";
// import Send from "@/pages/Send";
// import NFTPortfolio from "@/pages/NFTPortfolio";
// import Settings from "@/pages/Settings";
// import Wallet from "@/pages/Wallet";
// import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppRouter() {
  // Simple test - just show loading screen first
  return <LoadingScreen />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-black text-white">
          <AppRouter />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;