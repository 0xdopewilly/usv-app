import { useState, useEffect } from 'react';
import { Route, Switch, Router, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import SimpleLoadingScreen from "@/components/SimpleLoadingScreen";
import { ThemeProvider } from "@/components/ThemeProvider";
import BottomNavigation from "@/components/BottomNavigation";
import AuthPage from "@/pages/AuthPage";
import { PasscodeLock } from "@/components/PasscodeLock";
import Home from "@/pages/Home";
import Wallet from "@/pages/Wallet";
import SimpleSend from "./pages/SimpleSend";
import TokenSelection from "./pages/TokenSelection";
import SendTokens from "./pages/Send";
import Settings from "./pages/Settings";
import SavedAddresses from "./pages/SavedAddresses";
import StoreLocator from "./pages/StoreLocator";
import TransactionDetail from "./pages/TransactionDetail";
import QRScan from "./pages/QRScan";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

// Optimized animation variants - GPU-accelerated properties
const pageVariants = {
  initial: {
    opacity: 0,
    x: -10
  },
  in: {
    opacity: 1,
    x: 0
  },
  out: {
    opacity: 0,
    x: 10
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
              <Wallet />
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
          <Route path="/stores">
            <PageTransition pageKey="stores">
              <StoreLocator />
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
          <Route path="/chat">
            <PageTransition pageKey="chat">
              <Chat />
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
  const [location, setLocation] = useLocation();
  
  return (
    <PasscodeLock>
      <AppRouter />
      {isAuthenticated && <BottomNavigation />}
      {isAuthenticated && location !== '/chat' && (
        <motion.button
          onClick={() => setLocation('/chat')}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg flex items-center justify-center"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(236, 72, 153, 0.5))' }}
          data-testid="button-chat-floating"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}
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