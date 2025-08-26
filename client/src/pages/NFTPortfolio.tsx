import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import BottomNavigation from '@/components/BottomNavigation';

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  floorPrice: number;
  lastSalePrice?: number;
}

export default function NFTPortfolio() {
  const [, setLocation] = useLocation();
  
  const { data: nfts = [], isLoading } = useQuery({
    queryKey: ['/api/nfts'],
  });

  // Mock NFT data for demonstration since we don't have real NFT data
  const mockNFTs: NFT[] = [
    {
      id: '1',
      name: 'USV Genesis #001',
      collection: 'USV Genesis Collection',
      image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      floorPrice: 2.5,
    },
    {
      id: '2',
      name: 'Vape Culture #042',
      collection: 'Vape Culture',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      floorPrice: 1.8,
    },
    {
      id: '3',
      name: 'Token Legends #127',
      collection: 'Token Legends',
      image: 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      floorPrice: 4.2,
    },
    {
      id: '4',
      name: 'Cyber Vapes #089',
      collection: 'Cyber Vapes',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400',
      floorPrice: 3.1,
    },
  ];

  const displayNFTs = nfts.length > 0 ? nfts : mockNFTs;
  const totalValue = displayNFTs.reduce((sum: number, nft: NFT) => sum + nft.floorPrice, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-electric-blue to-crypto-gold rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xl font-bold text-white">USV</span>
          </div>
          <p className="text-gray-400">Loading NFTs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between p-6 pt-12 safe-top"
      >
        <h1 className="text-2xl font-bold text-white">NFT Portfolio</h1>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-dark-accent rounded-full text-gray-300 hover:text-white"
            data-testid="button-search"
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-dark-accent rounded-full text-gray-300 hover:text-white"
            data-testid="button-filter"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
      
      {/* Portfolio Stats */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 mb-6"
      >
        <Card className="bg-gradient-to-br from-dark-secondary to-dark-accent p-6 border-dark-accent">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white" data-testid="text-nft-total-value">
                ${(totalValue * 200).toFixed(0)} {/* Assuming SOL ~$200 */}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Total NFTs</p>
              <p className="text-2xl font-bold text-white" data-testid="text-nft-count">
                {displayNFTs.length}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {/* NFT Grid */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6"
      >
        {displayNFTs.length === 0 ? (
          <Card className="p-8 bg-dark-secondary border-dark-accent text-center">
            <h3 className="text-lg font-semibold text-white mb-2">No NFTs Yet</h3>
            <p className="text-gray-400 mb-4">
              Earn NFTs by participating in the USV ecosystem
            </p>
            <Button
              onClick={() => setLocation('/scan')}
              className="bg-gradient-to-r from-electric-blue to-crypto-gold text-white px-6 py-2 rounded-xl font-semibold"
            >
              Start Scanning
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {displayNFTs.map((nft: NFT, index: number) => (
              <motion.div
                key={nft.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="nft-item bg-dark-secondary rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setLocation(`/nfts/${nft.id}`)}
                data-testid={`card-nft-${nft.id}`}
              >
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-32 object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <h4 className="font-medium text-white text-sm mb-1" data-testid={`text-nft-name-${nft.id}`}>
                    {nft.name}
                  </h4>
                  <p className="text-gray-400 text-xs" data-testid={`text-nft-floor-${nft.id}`}>
                    Floor: {nft.floorPrice} SOL
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
