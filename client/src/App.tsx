import { useState, useEffect } from 'react';
import { Route, Switch, Router } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import LoadingScreen from "@/components/LoadingScreen";
import AuthPage from "@/pages/AuthPage";
import Home from "@/pages/Home";
import TradingInterface from "@/pages/TradingInterface";
import QRScan from "@/pages/QRScan";
import NFTPortfolio from "@/pages/NFTPortfolio";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  // Show loading screen for 3 seconds on app start
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen initially
  if (showLoading) {
    return <LoadingScreen />;
  }

  // Show auth page if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <AuthPage />;
  }

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Main authenticated app routes
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/trading" component={TradingInterface} />
        <Route path="/qr-scan" component={QRScan} />
        <Route path="/nft-portfolio" component={NFTPortfolio} />
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
        <div className="min-h-screen bg-dark-primary text-white">
          <AppRouter />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;