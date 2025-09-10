import { useState, useEffect } from 'react';
import { Route, Switch, Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import SimpleLoadingScreen from "@/components/SimpleLoadingScreen";
import AuthPage from "@/pages/AuthPage";
import Home from "@/pages/Home";
import SimpleWallet from "@/pages/SimpleWallet";
import SimpleSend from "@/pages/SimpleSend";
import Settings from "@/pages/Settings";
import SimpleNFT from "@/pages/SimpleNFT";
import QRScan from "@/pages/QRScan";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  // Simplified authentication logic to prevent blank page
  if (isLoading) {
    return <SimpleLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/wallet" component={SimpleWallet} />
        <Route path="/send" component={SimpleSend} />
        <Route path="/qr-scan" component={QRScan} />
        <Route path="/nft-portfolio" component={SimpleNFT} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-black text-white">
          <AppRouter />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;