import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-web3js-adapters';
import { fetchAllDigitalAssetByOwner } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey } from '@metaplex-foundation/umi';
import { connection, phantomWallet } from './solana';

// NFT Interface for standardized NFT data
export interface SolanaNFT {
  mint: string;
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  collection?: {
    name?: string;
    family?: string;
  };
  creators?: Array<{
    address: string;
    verified: boolean;
    share: number;
  }>;
  properties?: {
    files?: Array<{
      uri: string;
      type: string;
    }>;
  };
  sellerFeeBasisPoints?: number;
  uri?: string;
}

// Initialize UMI for Metaplex operations
const umi = createUmi(connection.rpcEndpoint);

export class NFTService {
  private connection: Connection;
  private umi: ReturnType<typeof createUmi>;

  constructor() {
    this.connection = connection;
    this.umi = umi;
  }

  /**
   * Fetch all NFTs owned by a wallet address using Metaplex UMI
   */
  async getNFTsForWallet(walletAddress: string): Promise<SolanaNFT[]> {
    try {
      console.log('🎨 Fetching NFTs for wallet:', walletAddress);
      
      // Use Metaplex UMI to fetch all digital assets
      const owner = publicKey(walletAddress);
      const digitalAssets = await fetchAllDigitalAssetByOwner(this.umi, owner);

      console.log(`📦 Found ${digitalAssets.length} digital assets`);

      // Convert to parallel processing with concurrency limit
      const CONCURRENCY_LIMIT = 5;
      const nfts: SolanaNFT[] = [];
      
      for (let i = 0; i < digitalAssets.length; i += CONCURRENCY_LIMIT) {
        const batch = digitalAssets.slice(i, i + CONCURRENCY_LIMIT);
        const batchResults = await Promise.allSettled(
          batch.map(asset => this.convertDigitalAssetToNFT(asset))
        );
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled' && result.value) {
            nfts.push(result.value);
          } else if (result.status === 'rejected') {
            console.warn('Failed to process NFT:', result.reason);
          }
        }
      }

      console.log(`✅ Successfully processed ${nfts.length} NFTs for wallet`);
      return nfts;
    } catch (error) {
      console.error('Failed to fetch NFTs for wallet:', error);
      return [];
    }
  }

  /**
   * Convert Metaplex UMI DigitalAsset to our NFT interface
   */
  private async convertDigitalAssetToNFT(asset: any): Promise<SolanaNFT | null> {
    try {
      // Get off-chain metadata if available
      let offChainMetadata: any = {};
      if (asset.metadata?.uri) {
        try {
          const response = await fetch(asset.metadata.uri);
          if (response.ok) {
            offChainMetadata = await response.json();
          }
        } catch (error) {
          console.warn(`Failed to fetch off-chain metadata for ${asset.publicKey}:`, error);
        }
      }

      return {
        mint: asset.publicKey.toString(),
        name: offChainMetadata.name || asset.metadata?.name || 'Unknown NFT',
        symbol: offChainMetadata.symbol || asset.metadata?.symbol || '',
        description: offChainMetadata.description || 'No description available',
        image: offChainMetadata.image || offChainMetadata.image_url,
        attributes: offChainMetadata.attributes || [],
        collection: asset.metadata?.collection ? {
          name: offChainMetadata.collection?.name || 'Unknown Collection',
          family: offChainMetadata.collection?.family
        } : undefined,
        creators: asset.metadata?.creators?.map((creator: any) => ({
          address: creator.address.toString(),
          verified: creator.verified,
          share: creator.share
        })),
        properties: offChainMetadata.properties,
        sellerFeeBasisPoints: asset.metadata?.sellerFeeBasisPoints,
        uri: asset.metadata?.uri
      };
    } catch (error) {
      console.error(`Failed to convert digital asset ${asset.publicKey}:`, error);
      return null;
    }
  }

  /**
   * Get NFT metadata by mint address using UMI
   */
  async getNFTMetadata(mintAddress: string): Promise<SolanaNFT | null> {
    try {
      const mint = publicKey(mintAddress);
      const digitalAssets = await fetchAllDigitalAssetByOwner(this.umi, mint);
      
      if (digitalAssets.length === 0) {
        return null;
      }

      return await this.convertDigitalAssetToNFT(digitalAssets[0]);
    } catch (error) {
      console.error(`Failed to get NFT metadata for ${mintAddress}:`, error);
      return null;
    }
  }

  /**
   * Transfer NFT to another wallet with modern token program support
   */
  async transferNFT(nftMint: string, toAddress: string): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (!phantomWallet.isConnected || !phantomWallet.publicKey) {
        return { success: false, error: 'Phantom wallet not connected' };
      }

      const mintKey = new PublicKey(nftMint);
      const fromKey = phantomWallet.publicKey;
      const toKey = new PublicKey(toAddress);

      // Get mint info to determine token program
      const mintInfo = await this.connection.getAccountInfo(mintKey);
      if (!mintInfo) {
        return { success: false, error: 'NFT mint not found' };
      }

      // Detect token program (legacy vs Token-2022)
      const tokenProgram = mintInfo.owner.equals(TOKEN_PROGRAM_ID) ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID;
      
      // Get associated token accounts with correct program
      const fromTokenAccount = await getAssociatedTokenAddress(mintKey, fromKey, false, tokenProgram);
      const toTokenAccount = await getAssociatedTokenAddress(mintKey, toKey, false, tokenProgram);

      const transaction = new Transaction();

      // Check if destination token account exists
      const toAccountInfo = await this.connection.getAccountInfo(toTokenAccount);
      if (!toAccountInfo) {
        // Create associated token account for recipient
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromKey, // payer
            toTokenAccount, // associatedToken
            toKey, // owner
            mintKey, // mint
            tokenProgram // token program
          )
        );
      }

      // For modern NFTs, we should use createTransferCheckedInstruction when possible
      try {
        // Import createTransferCheckedInstruction
        const { createTransferCheckedInstruction } = await import('@solana/spl-token');
        
        // Add transfer instruction (NFTs have amount = 1, decimals = 0)
        transaction.add(
          createTransferCheckedInstruction(
            fromTokenAccount, // source
            mintKey, // mint
            toTokenAccount, // destination
            fromKey, // owner
            1, // amount (always 1 for NFTs)
            0, // decimals (always 0 for NFTs)
            [], // multiSigners
            tokenProgram // token program
          )
        );
      } catch (importError) {
        // Fallback to regular transfer if createTransferCheckedInstruction is not available
        transaction.add(
          createTransferInstruction(
            fromTokenAccount, // source
            toTokenAccount, // destination
            fromKey, // owner
            1, // amount (always 1 for NFTs)
            [], // multiSigners
            tokenProgram // token program
          )
        );
      }

      // Set recent blockhash and fee payer
      const { blockhash } = await this.connection.getLatestBlockhash('finalized');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromKey;

      // Sign and send transaction with retry logic
      let signature: string;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          signature = await phantomWallet.signAndSendTransaction(transaction);
          break;
        } catch (txError: any) {
          attempts++;
          if (attempts >= maxAttempts) {
            throw txError;
          }
          
          // Refresh blockhash for retry
          const { blockhash: newBlockhash } = await this.connection.getLatestBlockhash('finalized');
          transaction.recentBlockhash = newBlockhash;
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }

      console.log(`✅ NFT transferred successfully! Signature: ${signature!}`);
      
      return {
        success: true,
        signature: signature!
      };
    } catch (error: any) {
      console.error('NFT transfer failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to transfer NFT';
      if (error.message?.includes('0x1')) {
        errorMessage = 'Insufficient balance or NFT not owned';
      } else if (error.message?.includes('blockhash')) {
        errorMessage = 'Transaction expired, please try again';
      } else if (error.message?.includes('simulation failed')) {
        errorMessage = 'Transaction would fail - please check NFT ownership';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get NFT by mint address (for detailed view)
   */
  async getNFTByMint(mintAddress: string): Promise<SolanaNFT | null> {
    return await this.getNFTMetadata(mintAddress);
  }

  /**
   * Validate if a string is a valid Solana address
   */
  isValidSolanaAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get floor price for NFT (mock implementation - would need to integrate with marketplace APIs)
   */
  async getFloorPrice(collectionName: string): Promise<number> {
    // Mock implementation - in real app you'd call marketplace APIs like Magic Eden
    return Math.random() * 10; // Random floor price between 0-10 SOL
  }
}

// Export singleton instance
export const nftService = new NFTService();

// Helper functions
export const formatNFTImage = (imageUrl?: string): string => {
  if (!imageUrl) return '/placeholder-nft.png';
  
  // Handle IPFS URLs
  if (imageUrl.startsWith('ipfs://')) {
    return imageUrl.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  
  return imageUrl;
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const formatNFTName = (name: string): string => {
  if (!name || name === 'Unknown NFT') {
    return 'Untitled NFT';
  }
  return name;
};

export default nftService;