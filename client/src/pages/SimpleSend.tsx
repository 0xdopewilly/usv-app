import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/BottomNavigation';

export default function SimpleSend() {
  const [, setLocation] = useLocation();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <div className="flex items-center mb-8 pt-12 px-6">
        <button
          onClick={() => setLocation('/wallet')}
          className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10 flex items-center justify-center mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white text-xl font-semibold">Send Tokens</h1>
      </div>

      {/* Send Form */}
      <div className="px-6 space-y-6">
        <div>
          <label className="text-white text-sm font-medium mb-2 block">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="text-white text-sm font-medium mb-2 block">To Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter wallet address"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-400"
          />
        </div>

        <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-semibold">
          Send
        </button>
      </div>
    </div>
  );
}