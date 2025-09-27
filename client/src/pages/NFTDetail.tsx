import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Share, Send, ImageIcon, ExternalLink, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { nftService, type SolanaNFT, formatNFTImage, formatNFTName, shortenAddress } from '@/lib/nftService';

export default function NFTDetail() {
  const [, params] = useRoute('/nft/:mint');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sendAddress, setSendAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const mintAddress = params?.mint;

  // Fetch NFT data by mint address
  const { data: nft, isLoading, error } = useQuery({
    queryKey: ['nft-detail', mintAddress],
    queryFn: async () => {
      if (!mintAddress) throw new Error('No mint address provided');
      return await nftService.getNFTByMint(mintAddress);
    },
    enabled: !!mintAddress,
  });

  const handleShare = async () => {
    if (!nft) return;
    
    const shareData = {
      title: formatNFTName(nft.name),
      text: `Check out this NFT: ${formatNFTName(nft.name)}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "NFT link copied to clipboard",
      });
    }
  };

  const handleSendNFT = async () => {
    if (!nft || !sendAddress.trim()) return;

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
      const result = await nftService.transferNFT(nft.mint, sendAddress);
      
      if (result.success) {
        toast({
          title: "✅ NFT Sent Successfully!",
          description: `${formatNFTName(nft.name)} sent to ${shortenAddress(sendAddress)}`
        });
        setSendAddress('');
        // Navigate back to NFT portfolio
        setLocation('/nft-portfolio');
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

  const handleViewOnSolscan = () => {
    if (!nft) return;
    const url = `https://solscan.io/token/${nft.mint}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
          <p className="text-white text-lg mb-2">Loading NFT...</p>
          <p className="text-gray-400 text-sm">Fetching details from Solana</p>
        </div>
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-900/20 rounded-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-red-400 text-lg mb-2">NFT Not Found</p>
          <p className="text-gray-400 text-sm mb-6">
            This NFT could not be loaded or does not exist
          </p>
          <Button 
            onClick={() => setLocation('/nft-portfolio')}
            variant="outline"
            data-testid="button-back-to-portfolio"
          >
            Back to Portfolio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between p-6 border-b border-gray-800"
      >
        <Button
          onClick={() => setLocation('/nft-portfolio')}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-gray-800"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleShare}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800"
            data-testid="button-share"
          >
            <Share className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleViewOnSolscan}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800"
            data-testid="button-view-explorer"
          >
            <ExternalLink className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      <div className="max-w-md mx-auto p-6">
        {/* NFT Image */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="aspect-square bg-gray-800 rounded-2xl overflow-hidden mb-6 relative"
        >
          {nft.image ? (
            <img
              src={formatNFTImage(nft.image)}
              alt={formatNFTName(nft.name)}
              className="w-full h-full object-cover"
              data-testid="img-nft"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-blue-900/50">
              <ImageIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </motion.div>

        {/* NFT Info */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Basic Info */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2" data-testid="text-nft-name">
              {formatNFTName(nft.name)}
            </h1>
            {nft.collection?.name && (
              <p className="text-purple-400" data-testid="text-collection">
                {nft.collection.name}
              </p>
            )}
            {nft.symbol && (
              <p className="text-gray-400 text-sm">{nft.symbol}</p>
            )}
          </div>

          {/* Description */}
          {nft.description && (
            <Card className="bg-gray-900 border-gray-700 p-4">
              <h3 className="text-white font-medium mb-2">Description</h3>
              <p className="text-gray-300 text-sm" data-testid="text-description">
                {nft.description}
              </p>
            </Card>
          )}

          {/* Attributes */}
          {nft.attributes && nft.attributes.length > 0 && (
            <Card className="bg-gray-900 border-gray-700 p-4">
              <h3 className="text-white font-medium mb-3">Attributes</h3>
              <div className="grid grid-cols-2 gap-3">
                {nft.attributes.map((attr, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                      {attr.trait_type}
                    </p>
                    <p className="text-white text-sm font-medium">{attr.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Technical Details */}
          <Card className="bg-gray-900 border-gray-700 p-4">
            <h3 className="text-white font-medium mb-3">Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Mint Address</span>
                <span className="text-white text-sm font-mono" data-testid="text-mint">
                  {shortenAddress(nft.mint)}
                </span>
              </div>
              {nft.sellerFeeBasisPoints !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Royalty</span>
                  <span className="text-white text-sm">
                    {(nft.sellerFeeBasisPoints / 100).toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Send NFT Section */}
          <Card className="bg-gray-900 border-gray-700 p-4">
            <h3 className="text-white font-medium mb-4">Send NFT</h3>
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
          </Card>
        </motion.div>
      </div>
    </div>
  );
}