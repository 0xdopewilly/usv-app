import { useState, useEffect } from 'react';
import { Route, Switch, Router, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import SimpleLoadingScreen from "@/components/SimpleLoadingScreen";
import AuthPageSimple from "@/pages/AuthPageSimple";
import HomeSimple from "@/pages/HomeSimple";
import SimpleWallet from "@/pages/SimpleWallet";
import SimpleSend from "@/pages/SimpleSend";
import Settings from "@/pages/Settings";
import NFTPortfolio from "@/pages/NFTPortfolio";
import NFTDetail from "@/pages/NFTDetail";
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
  // Always show login for now since auth is complex
  return <AuthPageSimple />;
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