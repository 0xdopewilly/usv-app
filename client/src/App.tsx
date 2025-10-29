import { useState, useEffect } from 'react';
import { Route, Switch, Router, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import SimpleLoadingScreen from "@/components/SimpleLoadingScreen";
import { ThemeProvider } from "@/components/ThemeProvider";
import BottomNavigation from "@/components/BottomNavigation";
import AuthPage from "@/pages/AuthPage";
import { PasscodeLock } from "@/components/PasscodeLock";
import Home from "@/pages/Home";
import SimpleWallet from "@/pages/SimpleWallet";
import SimpleSend from "./pages/SimpleSend";
import TokenSelection from "./pages/TokenSelection";
import SendTokens from "./pages/Send";
import Settings from "./pages/Settings";
import SavedAddresses from "./pages/SavedAddresses";
import TransactionHistory from "./pages/TransactionHistory";
import TransactionDetail from "./pages/TransactionDetail";
import QRScan from "./pages/QRScan";
import NotFound from "./pages/NotFound";

// Optimized animation variants - GPU-accelerated properties only
const pageVariants = {
  initial: {
    opacity: 0,
    transform: "translateX(-10px)"
  },
  in: {
    opacity: 1,
    transform: "translateX(0px)"
  },
  out: {
    opacity: 0,
    transform: "translateX(10px)"
  }
};

const pageTransition = {
  type: "tween",
  ease: [0.25, 0.1, 0.25, 1], // Optimized cubic-bezier
  duration: 0.25 // Faster, snappier transitions
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
          <Route path="/saved-addresses">
            <PageTransition pageKey="saved-addresses">
              <SavedAddresses />
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

function AuthenticatedLayout() {
  const { isAuthenticated } = useAuth();
  
  return (
    <PasscodeLock>
      <AppRouter />
      {isAuthenticated && <BottomNavigation />}
      <Toaster />
    </PasscodeLock>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
            <AuthenticatedLayout />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;