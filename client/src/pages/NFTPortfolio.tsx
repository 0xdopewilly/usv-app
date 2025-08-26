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
    rarity: "Epic",
    gradient: "from-green-600 to-green-800"
  },
  {
    id: 2,
    name: "CRYSTAL TEAL",
    image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=300&h=400&fit=crop",
    type: "Vape Pod", 
    rarity: "Rare",
    gradient: "from-teal-600 to-teal-800"
  },
  {
    id: 3,
    name: "CRIMSON RED",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop",
    type: "Vape Pod",
    rarity: "Legendary",
    gradient: "from-red-600 to-red-800"
  },
  {
    id: 4,
    name: "PURPLE HAZE",
    image: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=300&h=400&fit=crop",
    type: "Vape Pod",
    rarity: "Epic",
    gradient: "from-purple-600 to-purple-800"
  }
];

export default function NFTPortfolio() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNFTs = vapeNFTs.filter(nft => 
    nft.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 to-gray-900 relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-12 px-6 pb-4 flex items-center justify-between"
      >
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer" 
          onClick={() => setLocation('/home')}
        />
        <h1 className="text-white text-xl font-semibold">NFTs</h1>
        <div className="w-6 h-6" /> {/* Spacer */}
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
            className="w-full bg-gray-800/50 border-gray-700 text-white pl-12 py-3 rounded-xl focus:border-purple-500"
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
              <div className={`bg-gradient-to-b ${nft.gradient} rounded-2xl p-4 relative overflow-hidden`}>
                {/* Background pattern/smoke effect */}
                <div className="absolute inset-0 bg-black/20 rounded-2xl" />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Vape device illustration */}
                  <div className="h-32 flex items-center justify-center mb-4">
                    <div className="w-12 h-24 bg-gray-800 rounded-lg flex flex-col items-center justify-center relative">
                      {/* LED indicator */}
                      <div className="w-2 h-2 bg-orange-400 rounded-full mb-2" />
                      {/* Brand logo area */}
                      <div className="text-white text-xs font-bold">USV</div>
                      {/* Button area */}
                      <div className="w-8 h-8 bg-gray-700 rounded-full mt-2" />
                    </div>
                  </div>
                  
                  {/* NFT Name */}
                  <div className="text-center">
                    <h3 className="text-white font-bold text-sm mb-1">{nft.name}</h3>
                    <p className="text-gray-200 text-xs opacity-80">{nft.type}</p>
                  </div>
                  
                  {/* Rarity Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">A</span>
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