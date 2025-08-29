import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/BottomNavigation';

const vapeNFTs = [
  {
    id: 1,
    name: "VINDICATE GREEN",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=400&fit=crop",
    type: "Vape Pod",
    rarity: "A",
    bgColor: "from-green-800 via-green-700 to-green-600",
    smokeEffect: "green"
  },
  {
    id: 2,
    name: "CRYSTAL TEAL",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&h=400&fit=crop",
    type: "Vape Pod", 
    rarity: "A",
    bgColor: "from-teal-800 via-teal-700 to-cyan-600",
    smokeEffect: "teal"
  },
  {
    id: 3,
    name: "CRIMSON RED",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop",
    type: "Vape Pod",
    rarity: "A",
    bgColor: "from-red-800 via-red-700 to-red-600",
    smokeEffect: "red"
  },
  {
    id: 4,
    name: "PURPLE HAZE",
    image: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=300&h=400&fit=crop",
    type: "Vape Pod",
    rarity: "A",
    bgColor: "from-purple-800 via-purple-700 to-purple-600",
    smokeEffect: "purple"
  }
];

export default function NFTPortfolio() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNFTs = vapeNFTs.filter(nft => 
    nft.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black relative pb-20">
      <BottomNavigation />
      

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="px-6 pt-16 pb-6 flex items-center justify-between"
      >
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer" 
          onClick={() => setLocation('/')}
        />
        <h1 className="text-white text-xl font-semibold">NFTs</h1>
        <div className="w-6 h-6" />
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search Items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border-0 text-white pl-12 py-4 rounded-2xl focus:ring-2 focus:ring-pink-500 placeholder-gray-400"
          />
        </div>
      </motion.div>

      {/* NFT Grid */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6"
      >
        <div className="grid grid-cols-2 gap-4">
          {filteredNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setLocation(`/nft/${nft.id}`)}
              className="cursor-pointer"
            >
              <div className={`bg-gradient-to-b ${nft.bgColor} rounded-3xl p-4 relative overflow-hidden h-80 border border-gray-700/30`}>
                {/* Dark overlay for better contrast */}
                <div className="absolute inset-0 bg-black/40 rounded-3xl" />
                
                {/* Ambient smoke effects */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-6 h-6 bg-white/20 rounded-full blur-md animate-pulse"></div>
                  <div className="absolute top-8 right-6 w-4 h-4 bg-white/10 rounded-full blur-lg"></div>
                  <div className="absolute bottom-12 left-8 w-8 h-8 bg-white/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-6 right-4 w-3 h-3 bg-white/20 rounded-full blur-sm"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Top Row: Rarity Badge */}
                  <div className="flex justify-end mb-4">
                    <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-black text-xs font-bold">{nft.rarity}</span>
                    </div>
                  </div>
                  
                  {/* Vape Device - Centered */}
                  <div className="flex-1 flex items-center justify-center mb-6">
                    <div className="relative">
                      {/* Main vape body */}
                      <div className="w-14 h-28 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-500 rounded-xl relative shadow-2xl border border-gray-400/30">
                        {/* LED indicator */}
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full animate-pulse shadow-lg"></div>
                        
                        {/* Brand label */}
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                          <div className="text-black text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded shadow">
                            USV
                          </div>
                        </div>
                        
                        {/* Fire button */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-700 rounded-full border border-gray-500 shadow-inner"></div>
                        
                        {/* Mouthpiece */}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-gray-300 rounded-t-lg border-t border-gray-400"></div>
                      </div>
                      
                      {/* Vapor cloud */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                        <div className="w-1 h-4 bg-white/30 rounded-full blur-sm animate-pulse"></div>
                        <div className="w-2 h-2 bg-white/20 rounded-full blur-md animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Info */}
                  <div className="text-center">
                    <h3 className="text-white font-bold text-sm tracking-wide">{nft.name}</h3>
                    <div className="flex items-center justify-center mt-2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-black text-xs font-bold">{nft.rarity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredNFTs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 py-12 text-center"
        >
          <p className="text-gray-400 text-lg mb-2">No NFTs found</p>
          <p className="text-gray-500 text-sm">
            Try adjusting your search terms
          </p>
        </motion.div>
      )}
    </div>
  );
}