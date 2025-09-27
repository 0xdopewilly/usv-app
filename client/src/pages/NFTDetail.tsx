import { useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Share, Heart, ArrowRightLeft, Tag, Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  description?: string;
  floorPrice: number;
  lastSalePrice?: number;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

export default function NFTDetail() {
  const [, params] = useRoute('/nfts/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: nft, isLoading } = useQuery({
    queryKey: ['/api/nfts', params?.id],
  });

  // Mock NFT data since we don't have real data
  const mockNFT: NFT = {
    id: params?.id || '1',
    name: 'USV Genesis #001',
    collection: 'USV Genesis Collection',
    description: 'A rare genesis NFT from the USV Token ecosystem, representing early adoption and community membership.',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800',
    floorPrice: 2.5,
    lastSalePrice: 3.1,
    attributes: [
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Power Level', value: '9000' },
      { trait_type: 'Generation', value: 'Genesis' },
      { trait_type: 'Color Scheme', value: 'Electric Blue' },
    ],
  };

  const displayNFT = nft || mockNFT;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayNFT.name,
          text: `Check out this NFT: ${displayNFT.name}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      toast({
        title: "Link Copied",
        description: "NFT link copied to clipboard",
      });
    }
  };

  const handleFavorite = () => {
    toast({
      title: "Added to Favorites",
      description: "NFT has been added to your favorites",
    });
  };

  const handleTransfer = () => {
    toast({
      title: "Transfer NFT",
      description: "NFT transfer feature would be implemented here",
    });
  };

  const handleListForSale = () => {
    toast({
      title: "List for Sale",
      description: "Listing feature would be implemented here",
    });
  };

  const handleStake = () => {
    toast({
      title: "Stake NFT",
      description: "NFT staking feature would be implemented here",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-electric-blue to-crypto-gold rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xl font-bold text-white">USV</span>
          </div>
          <p className="text-gray-400">Loading NFT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary relative pb-20">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between p-6 pt-12 safe-top"
      >
        <Button
          onClick={() => setLocation('/nfts')}
          variant="ghost"
          size="icon"
          className="w-10 h-10 bg-dark-accent rounded-full text-gray-300 hover:text-white"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex space-x-2">
          <Button
            onClick={handleShare}
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-dark-accent rounded-full text-gray-300 hover:text-white"
            data-testid="button-share"
          >
            <Share className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleFavorite}
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-dark-accent rounded-full text-gray-300 hover:text-white"
            data-testid="button-favorite"
          >
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
      
      {/* NFT Image */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 mb-6"
      >
        <img
          src={displayNFT.image}
          alt={displayNFT.name}
          className="w-full rounded-xl"
          data-testid="img-nft"
        />
      </motion.div>
      
      {/* NFT Info */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6 mb-6"
      >
        <h1 className="text-2xl font-bold mb-2 text-white" data-testid="text-nft-name">
          {displayNFT.name}
        </h1>
        <p className="text-gray-400 mb-4" data-testid="text-nft-collection">
          {displayNFT.collection}
        </p>
        
        {displayNFT.description && (
          <p className="text-gray-300 mb-4 text-sm" data-testid="text-nft-description">
            {displayNFT.description}
          </p>
        )}
        
        <Card className="bg-dark-secondary p-4 border-dark-accent mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Floor Price</p>
              <p className="text-white font-medium" data-testid="text-floor-price">
                {displayNFT.floorPrice} SOL
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Last Sale</p>
              <p className="text-white font-medium" data-testid="text-last-sale">
                {displayNFT.lastSalePrice || 'N/A'} {displayNFT.lastSalePrice ? 'SOL' : ''}
              </p>
            </div>
          </div>
        </Card>

        {/* Attributes */}
        {displayNFT.attributes && displayNFT.attributes.length > 0 && (
          <Card className="bg-dark-secondary p-4 border-dark-accent mb-4">
            <h3 className="text-white font-semibold mb-3">Attributes</h3>
            <div className="grid grid-cols-2 gap-3">
              {displayNFT.attributes.map((attribute, index) => (
                <div
                  key={index}
                  className="bg-dark-accent p-3 rounded-lg text-center"
                  data-testid={`attribute-${index}`}
                >
                  <p className="text-gray-400 text-xs mb-1">{attribute.trait_type}</p>
                  <p className="text-white font-medium text-sm">{attribute.value}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </motion.div>
      
      {/* Action Buttons */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="px-6 space-y-3"
      >
        <Button
          onClick={handleTransfer}
          className="w-full bg-gradient-to-r from-electric-blue to-crypto-gold text-white py-4 h-auto text-lg font-semibold glow-button flex items-center justify-center space-x-2"
          data-testid="button-transfer"
        >
          <ArrowRightLeft className="w-5 h-5" />
          <span>Transfer NFT</span>
        </Button>
        
        <Button
          onClick={handleListForSale}
          variant="outline"
          className="w-full bg-dark-accent hover:bg-gray-600 text-white py-4 h-auto text-lg font-semibold border border-gray-600 flex items-center justify-center space-x-2"
          data-testid="button-list-sale"
        >
          <Tag className="w-5 h-5" />
          <span>List for Sale</span>
        </Button>
        
        <Button
          onClick={handleStake}
          className="w-full bg-crypto-gold hover:bg-yellow-600 text-white py-4 h-auto text-lg font-semibold flex items-center justify-center space-x-2"
          data-testid="button-stake"
        >
          <Coins className="w-5 h-5" />
          <span>Stake NFT</span>
        </Button>
      </motion.div>
    </div>
  );
}
