import { useState, useEffect } from 'react';
import { Route, Switch, Router, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import SimpleLoadingScreen from "@/components/SimpleLoadingScreen";
import AuthPage from "@/pages/AuthPage";
import Home from "@/pages/Home";
import SimpleWallet from "@/pages/SimpleWallet";
import SimpleSend from "./pages/SimpleSend";
import TokenSelection from "./pages/TokenSelection";
import SendTokens from "./pages/Send";
import Settings from "./pages/Settings";
import TransactionHistory from "./pages/TransactionHistory";
import TransactionDetail from "./pages/TransactionDetail";
import QRScan from "./pages/QRScan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

// Animation variants for smooth page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: 20,
    scale: 0.98
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

// PageTransition wrapper component
const PageTransition = ({ children, pageKey }: { children: React.ReactNode; pageKey: string }) => (
  <motion.div
    key={pageKey}
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Simplified authentication logic to prevent blank page
  if (isLoading) {
    return (
      <PageTransition pageKey="loading">
        <SimpleLoadingScreen />
      </PageTransition>
    );
  }

  if (!isAuthenticated) {
    return (
      <PageTransition pageKey="auth">
        <AuthPage />
      </PageTransition>
    );
  }

  return (
    <Router>
      <AnimatePresence mode="wait" initial={false}>
        <Switch location={location}>
          <Route path="/">
            <PageTransition pageKey="home">
              <Home />
            </PageTransition>
          </Route>
          <Route path="/wallet">
            <PageTransition pageKey="wallet">
              <SimpleWallet />
            </PageTransition>
          </Route>
          <Route path="/send">
            <PageTransition pageKey="token-selection">
              <TokenSelection />
            </PageTransition>
          </Route>
          <Route path="/send/:token">
            <PageTransition pageKey="send">
              <SendTokens />
            </PageTransition>
          </Route>
          <Route path="/qr-scan">
            <PageTransition pageKey="qr-scan">
              <QRScan />
            </PageTransition>
          </Route>
          <Route path="/transaction-history">
            <PageTransition pageKey="transaction-history">
              <TransactionHistory />
            </PageTransition>
          </Route>
          <Route path="/transaction/:id">
            <PageTransition pageKey="transaction-detail">
              <TransactionDetail />
            </PageTransition>
          </Route>
          <Route path="/settings">
            <PageTransition pageKey="settings">
              <Settings />
            </PageTransition>
          </Route>
          <Route>
            <PageTransition pageKey="not-found">
              <NotFound />
            </PageTransition>
          </Route>
        </Switch>
      </AnimatePresence>
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