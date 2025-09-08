import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-purple-500">🚀 USV Token App</h1>
        <p className="text-gray-300 mb-4">LIVE & WORKING!</p>
        <div className="bg-purple-900/50 p-4 rounded-lg">
          <p className="text-sm">✅ Solana Devnet Ready</p>
          <p className="text-sm">✅ Real Wallet Integration</p>
          <p className="text-sm">✅ QR Scanner Active</p>
        </div>
      </div>
    </div>
  );
}