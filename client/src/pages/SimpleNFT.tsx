import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SimpleNFT() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="flex items-center mb-8 pt-6">
        <button
          onClick={() => setLocation('/')}
          className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10 flex items-center justify-center mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-white text-xl font-semibold">NFT Portfolio</h1>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 rounded-lg p-4">
            <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-white font-bold">NFT #{i}</span>
            </div>
            <p className="text-white text-sm font-medium">USV Collection #{i}</p>
            <p className="text-gray-400 text-xs">Value: 0.5 SOL</p>
          </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
        <div className="flex justify-around py-3">
          <button onClick={() => setLocation('/')} className="text-gray-400 hover:text-white p-2">
            🏠
          </button>
          <button onClick={() => setLocation('/wallet')} className="text-gray-400 hover:text-white p-2">
            💳
          </button>
          <button onClick={() => setLocation('/nft-portfolio')} className="text-pink-500 p-2">
            🖼️
          </button>
          <button onClick={() => setLocation('/settings')} className="text-gray-400 hover:text-white p-2">
            ⚙️
          </button>
        </div>
      </div>
    </div>
  );
}