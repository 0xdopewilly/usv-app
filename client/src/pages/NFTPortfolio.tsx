import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Send, RefreshCw, ImageIcon, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import BottomNavigation from '@/components/BottomNavigation';
import { nftService, type SolanaNFT, formatNFTImage, formatNFTName } from '@/lib/nftService';
import { phantomWallet } from '@/lib/solana';

export default function NFTPortfolio() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNFT, setSelectedNFT] = useState<SolanaNFT | null>(null);
  const [sendAddress, setSendAddress] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Get user's wallet address (Phantom or auto-generated)
  const walletAddress = phantomWallet.publicKey?.toString() || user?.walletAddress;

  // Fetch NFTs from user's wallet
  const { data: nfts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['wallet-nfts', walletAddress],
    queryFn: async () => {
      if (!walletAddress) return [];
      console.log('🎨 Fetching NFTs for:', walletAddress);
      return await nftService.getNFTsForWallet(walletAddress);
    },
    enabled: !!walletAddress,
    refetchOnMount: true,
  });

  // Filter NFTs based on search
  const filteredNFTs = nfts.filter(nft => 
    nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nft.collection?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = async () => {
    toast({
      title: "🔄 Refreshing NFTs",
      description: "Fetching latest NFTs from Solana..."
    });
    await refetch();
  };

  const handleNFTClick = (nft: SolanaNFT) => {
    setSelectedNFT(nft);
  };

  const handleSendNFT = async () => {
    if (!selectedNFT || !sendAddress.trim()) return;

    if (!nftService.isValidSolanaAddress(sendAddress)) {
      toast({
        title: "❌ Invalid Address",
        description: "Please enter a valid Solana wallet address",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await nftService.transferNFT(selectedNFT.mint, sendAddress);
      
      if (result.success) {
        toast({
          title: "✅ NFT Sent Successfully!",
          description: `${formatNFTName(selectedNFT.name)} sent to ${sendAddress.slice(0, 6)}...${sendAddress.slice(-4)}`
        });
        setSelectedNFT(null);
        setSendAddress('');
        // Refresh NFTs after successful transfer
        setTimeout(() => refetch(), 2000);
      } else {
        toast({
          title: "❌ Transfer Failed",
          description: result.error || "Failed to send NFT",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "❌ Transfer Failed", 
        description: "An error occurred while sending the NFT",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedNFT(null);
    setSendAddress('');
  };

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
          data-testid="button-back"
        />
        <h1 className="text-white text-xl font-semibold">My NFTs</h1>
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-800"
          disabled={isLoading}
          data-testid="button-refresh"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
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
            placeholder="Search NFTs by name, symbol, or collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border-0 text-white pl-12 py-4 rounded-2xl focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
            data-testid="input-search"
          />
        </div>
      </motion.div>

      {/* Connection Status */}
      {!walletAddress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 mb-6"
        >
          <Card className="bg-yellow-900/20 border-yellow-500/30 p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-200 text-sm">
                Connect your Phantom wallet or create an account to view your NFTs
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && walletAddress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 py-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
          <p className="text-white text-lg mb-2">Loading NFTs...</p>
          <p className="text-gray-400 text-sm">Fetching from Solana mainnet</p>
        </motion.div>
      )}

      {/* NFT Grid */}
      {!isLoading && walletAddress && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="px-6"
        >
          <div className="grid grid-cols-2 gap-4">
            {filteredNFTs.map((nft, index) => (
              <motion.div
                key={nft.mint}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleNFTClick(nft)}
                className="cursor-pointer"
                data-testid={`nft-card-${nft.mint}`}
              >
                <Card className="bg-gray-900 border-gray-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                  {/* NFT Image */}
                  <div className="aspect-square bg-gray-800 relative overflow-hidden">
                    {nft.image ? (
                      <img
                        src={formatNFTImage(nft.image)}
                        alt={formatNFTName(nft.name)}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.setAttribute('style', 'display: flex');
                        }}
                      />
                    ) : null}
                    {/* Fallback when no image or image fails to load */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50" style={{ display: nft.image ? 'none' : 'flex' }}>
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                    
                    {/* Collection Badge */}
                    {nft.collection?.name && (
                      <div className="absolute top-2 left-2">
                        <div className="bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1">
                          <span className="text-white text-xs font-medium">{nft.collection.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* NFT Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-1 truncate" data-testid={`text-nft-name-${nft.mint}`}>
                      {formatNFTName(nft.name)}
                    </h3>
                    {nft.symbol && (
                      <p className="text-gray-400 text-xs truncate">{nft.symbol}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-500 text-xs">NFT</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-400 text-xs">Owned</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && walletAddress && filteredNFTs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 py-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-white text-lg mb-2">
            {searchQuery ? 'No NFTs found' : 'No NFTs in your wallet'}
          </p>
          <p className="text-gray-400 text-sm">
            {searchQuery 
              ? 'Try adjusting your search terms' 
              : 'NFTs you receive will appear here'
            }
          </p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 py-12 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-900/20 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 text-lg mb-2">Failed to load NFTs</p>
          <p className="text-gray-400 text-sm mb-4">There was an error fetching your NFTs</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Try Again
          </Button>
        </motion.div>
      )}

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="relative w-full max-w-md bg-gray-900 rounded-t-3xl sm:rounded-3xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-white text-lg font-semibold">NFT Details</h2>
              <Button
                onClick={handleCloseModal}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
                data-testid="button-close-modal"
              >
                ✕
              </Button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* NFT Image */}
              <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden mb-6 relative">
                {selectedNFT.image ? (
                  <img
                    src={formatNFTImage(selectedNFT.image)}
                    alt={formatNFTName(selectedNFT.name)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* NFT Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-white text-xl font-bold mb-2" data-testid="text-modal-nft-name">
                    {formatNFTName(selectedNFT.name)}
                  </h3>
                  {selectedNFT.collection?.name && (
                    <p className="text-purple-400 text-sm">{selectedNFT.collection.name}</p>
                  )}
                </div>
                
                {selectedNFT.description && (
                  <div>
                    <h4 className="text-gray-300 text-sm font-medium mb-2">Description</h4>
                    <p className="text-gray-400 text-sm">{selectedNFT.description}</p>
                  </div>
                )}
                
                {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                  <div>
                    <h4 className="text-gray-300 text-sm font-medium mb-3">Attributes</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedNFT.attributes.map((attr, index) => (
                        <div key={index} className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-400 text-xs uppercase tracking-wide">
                            {attr.trait_type}
                          </p>
                          <p className="text-white text-sm font-medium">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-gray-300 text-sm font-medium mb-2">Mint Address</h4>
                  <p className="text-gray-400 text-xs font-mono bg-gray-800 rounded-lg p-3 break-all">
                    {selectedNFT.mint}
                  </p>
                </div>
              </div>
              
              {/* Send Section */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="text-white text-sm font-medium mb-4">Send NFT</h4>
                <div className="space-y-3">
                  <Input
                    placeholder="Recipient wallet address"
                    value={sendAddress}
                    onChange={(e) => setSendAddress(e.target.value)}
                    className="w-full bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-purple-500"
                    data-testid="input-send-address"
                  />
                  <Button
                    onClick={handleSendNFT}
                    disabled={!sendAddress.trim() || isSending}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    data-testid="button-send-nft"
                  >
                    {isSending ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Send NFT</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}