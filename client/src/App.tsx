import { useState, useEffect, useRef } from 'react';
import { Route, Switch, Router, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
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
          <Route>
            <PageTransition pageKey="not-found">
              <NotFound />
            </PageTransition>
          </Route>
        </Switch>
    </AnimatePresence>
  );
}

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm your PURE5 vape expert. What effects are you looking for?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();
      if (data.success && data.message) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message.content }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isMobile = window.innerWidth < 768;

  return (
    <>
      {isOpen && (
        <div 
          style={{ 
            position: 'fixed',
            bottom: '5rem',
            right: isMobile ? '0.5rem' : '1rem',
            zIndex: 9999,
            width: isMobile ? 'calc(100vw - 1rem)' : '384px',
            maxHeight: isMobile ? '65vh' : '600px'
          }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-lg">
            <div><h3 className="font-semibold text-white text-sm">PURE5 Expert</h3></div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-800">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`inline-block p-3 rounded-lg max-w-[85%] ${msg.role === 'user' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-white dark:bg-gray-700 text-black dark:text-white'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start"><div className="bg-white dark:bg-gray-700 rounded-lg p-3 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-pink-500" /><span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span></div></div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-lg">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about strains..." disabled={isLoading}
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50" />
              <button type="submit" disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed">
                <Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      )}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          position: 'fixed',
          bottom: '1.5rem',
          right: isMobile ? '0.5rem' : '1rem',
          zIndex: 9999
        }}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center">
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  );
}

function AuthenticatedLayout() {
  const { isAuthenticated } = useAuth();
  
  return (
    <PasscodeLock>
      <Router>
        <AppRouter />
      </Router>
      {isAuthenticated && <BottomNavigation />}
      {isAuthenticated && <ChatWidget />}
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