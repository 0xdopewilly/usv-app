import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
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
    name: string;
    family: string;
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

// Metaplex Token Metadata Program ID
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

export class NFTService {
  private connection: Connection;

  constructor() {
    this.connection = connection;
  }

  /**
   * Fetch all NFTs owned by a wallet address
   */
  async getNFTsForWallet(walletAddress: string): Promise<SolanaNFT[]> {
    try {
      console.log('🎨 Fetching NFTs for wallet:', walletAddress);
      
      const publicKey = new PublicKey(walletAddress);
      
      // Get all token accounts owned by the wallet
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      const nfts: SolanaNFT[] = [];

      // Filter for NFTs (tokens with decimals = 0 and amount = 1)
      for (const tokenAccount of tokenAccounts.value) {
        const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;
        const mint = tokenAccount.account.data.parsed.info.mint;

        // Check if it's likely an NFT (decimals = 0, amount = 1)
        if (tokenAmount.decimals === 0 && tokenAmount.uiAmount === 1) {
          try {
            const nft = await this.getNFTMetadata(mint);
            if (nft) {
              nfts.push(nft);
            }
          } catch (error) {
            console.warn(`Failed to fetch metadata for NFT ${mint}:`, error);
          }
        }
      }

      console.log(`✅ Found ${nfts.length} NFTs for wallet`);
      return nfts;
    } catch (error) {
      console.error('Failed to fetch NFTs for wallet:', error);
      return [];
    }
  }

  /**
   * Get NFT metadata from mint address using direct RPC calls
   */
  async getNFTMetadata(mintAddress: string): Promise<SolanaNFT | null> {
    try {
      const mintKey = new PublicKey(mintAddress);
      
      // Find metadata PDA (Program Derived Address)
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          METADATA_PROGRAM_ID.toBuffer(),
          mintKey.toBuffer(),
        ],
        METADATA_PROGRAM_ID
      );
      
      // Get metadata account
      const metadataAccount = await this.connection.getAccountInfo(metadataPDA);
      if (!metadataAccount) {
        return null;
      }

      // Parse basic metadata from the account data
      const metadata = this.parseMetadataAccount(metadataAccount.data);
      
      // Fetch off-chain metadata if URI exists
      let offChainMetadata: any = {};
      if (metadata.uri) {
        try {
          const response = await fetch(metadata.uri.replace(/\0/g, ''));
          if (response.ok) {
            offChainMetadata = await response.json();
          }
        } catch (error) {
          console.warn(`Failed to fetch off-chain metadata for ${mintAddress}:`, error);
        }
      }

      return {
        mint: mintAddress,
        name: offChainMetadata.name || metadata.name || 'Unknown NFT',
        symbol: offChainMetadata.symbol || metadata.symbol || '',
        description: offChainMetadata.description || 'No description available',
        image: offChainMetadata.image || offChainMetadata.image_url,
        attributes: offChainMetadata.attributes || [],
        collection: offChainMetadata.collection || (metadata.collection ? {
          name: offChainMetadata.collection?.name || 'Unknown Collection',
          family: offChainMetadata.collection?.family || 'Unknown'
        } : undefined),
        creators: metadata.creators?.map((creator: any) => ({
          address: creator.address,
          verified: creator.verified,
          share: creator.share
        })),
        properties: offChainMetadata.properties,
        sellerFeeBasisPoints: metadata.sellerFeeBasisPoints,
        uri: metadata.uri?.replace(/\0/g, '')
      };
    } catch (error) {
      console.error(`Failed to get NFT metadata for ${mintAddress}:`, error);
      return null;
    }
  }

  /**
   * Parse metadata account data (simplified parser)
   */
  private parseMetadataAccount(data: Buffer): any {
    try {
      // This is a simplified parser - for production use a proper borsh deserializer
      let offset = 1; // Skip discriminator
      
      // Skip update authority (32 bytes)
      offset += 32;
      
      // Skip mint (32 bytes) 
      offset += 32;
      
      // Read name length (4 bytes)
      const nameLength = data.readUInt32LE(offset);
      offset += 4;
      
      // Read name
      const name = data.slice(offset, offset + nameLength).toString('utf8').replace(/\0/g, '');
      offset += nameLength;
      
      // Read symbol length (4 bytes)
      const symbolLength = data.readUInt32LE(offset);
      offset += 4;
      
      // Read symbol
      const symbol = data.slice(offset, offset + symbolLength).toString('utf8').replace(/\0/g, '');
      offset += symbolLength;
      
      // Read URI length (4 bytes)
      const uriLength = data.readUInt32LE(offset);
      offset += 4;
      
      // Read URI
      const uri = data.slice(offset, offset + uriLength).toString('utf8').replace(/\0/g, '');
      offset += uriLength;
      
      // Read seller fee basis points (2 bytes)
      const sellerFeeBasisPoints = data.readUInt16LE(offset);
      offset += 2;
      
      return {
        name,
        symbol,
        uri,
        sellerFeeBasisPoints,
        creators: [] // Simplified - would need more complex parsing for creators
      };
    } catch (error) {
      console.error('Failed to parse metadata account:', error);
      return {
        name: 'Unknown NFT',
        symbol: '',
        uri: '',
        sellerFeeBasisPoints: 0,
        creators: []
      };
    }
  }

  /**
   * Transfer NFT to another wallet
   */
  async transferNFT(nftMint: string, toAddress: string): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (!phantomWallet.isConnected || !phantomWallet.publicKey) {
        return { success: false, error: 'Phantom wallet not connected' };
      }

      const mintKey = new PublicKey(nftMint);
      const fromKey = phantomWallet.publicKey;
      const toKey = new PublicKey(toAddress);

      // Get associated token accounts
      const fromTokenAccount = await getAssociatedTokenAddress(mintKey, fromKey);
      const toTokenAccount = await getAssociatedTokenAddress(mintKey, toKey);

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
            mintKey // mint
          )
        );
      }

      // Add transfer instruction (NFTs have amount = 1)
      transaction.add(
        createTransferInstruction(
          fromTokenAccount, // source
          toTokenAccount, // destination
          fromKey, // owner
          1 // amount (always 1 for NFTs)
        )
      );

      // Set recent blockhash and fee payer
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromKey;

      // Sign and send transaction
      const signature = await phantomWallet.signAndSendTransaction(transaction);
      
      console.log(`✅ NFT transferred successfully! Signature: ${signature}`);
      
      return {
        success: true,
        signature
      };
    } catch (error: any) {
      console.error('NFT transfer failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to transfer NFT'
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