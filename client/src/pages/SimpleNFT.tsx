import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/BottomNavigation';

export default function SimpleNFT() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <div className="flex items-center mb-8 pt-12 px-6">
        <button
          onClick={() => setLocation('/')}
          className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10 flex items-center justify-center mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white text-xl font-semibold">NFT Portfolio</h1>
      </div>

      {/* NFT Grid */}
      <div className="px-6">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-4 cursor-pointer hover:bg-gray-800 transition-colors">
              <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-white font-bold">NFT #{i}</span>
              </div>
              <p className="text-white text-sm font-medium">USV Collection #{i}</p>
              <p className="text-gray-400 text-xs">Value: 0.5 SOL</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}