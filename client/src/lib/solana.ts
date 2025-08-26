import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

// USV Token Configuration
export const USV_TOKEN_MINT = new PublicKey('8zGuJQqwhZafTah7Uc7Z4tXRnguqkn5KLFAP8oV6PHe2'); // Example mint address
export const USV_DECIMALS = 6;
export const SOLANA_NETWORK = 'devnet'; // Change to 'mainnet-beta' for production

// Connection setup
export const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), 'confirmed');

// Simplified Solana service for USV Token
declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      isConnected: boolean;
      publicKey: { toString: () => string } | null;
    };
  }
}

export class SolanaService {
  constructor() {
    // Initialize service
  }

  // Check if Phantom wallet is installed
  isWalletInstalled(): boolean {
    return !!(window.solana && window.solana.isPhantom);
  }

  // Connect to Phantom wallet
  async connectWallet(): Promise<string | null> {
    if (!this.isWalletInstalled()) {
      throw new Error('Phantom wallet not installed');
    }

    try {
      const response = await window.solana!.connect();
      return response.publicKey.toString();
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    if (window.solana && window.solana.isConnected) {
      await window.solana.disconnect();
    }
  }

  // Get wallet address
  getWalletAddress(): string | null {
    return window.solana?.publicKey?.toString() || null;
  }

  // Check if wallet is connected
  isWalletConnected(): boolean {
    return !!(window.solana && window.solana.isConnected && window.solana.publicKey);
  }

  // Get SOL balance
  async getSolBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting SOL balance:', error);
      return 0;
    }
  }

  // Get USV token balance
  async getUSVBalance(address: string): Promise<number> {
    try {
      const publicKey = new PublicKey(address);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: USV_TOKEN_MINT }
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance || 0;
    } catch (error) {
      console.error('Error getting USV balance:', error);
      return 0;
    }
  }

  // Transfer USV tokens (simplified simulation)
  async transferUSV(toAddress: string, amount: number): Promise<string> {
    if (!this.isWalletConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate transaction for demo purposes
      const signature = 'simulated_' + Date.now().toString();
      console.log(`Simulated transfer of ${amount} USV to ${toAddress}`);
      return signature;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }

  // Stake USV tokens (simplified simulation)
  async stakeUSV(amount: number): Promise<string> {
    if (!this.isWalletConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate staking transaction
      const signature = 'stake_' + Date.now().toString();
      console.log(`Simulated staking of ${amount} USV tokens`);
      return signature;
    } catch (error) {
      console.error('Staking failed:', error);
      throw error;
    }
  }

  // Claim rewards (simplified simulation)
  async claimRewards(amount: number, reason: string = 'QR Scan Reward'): Promise<string> {
    if (!this.isWalletConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate reward claim
      const signature = 'claim_' + Date.now().toString();
      console.log(`Simulated claim of ${amount} USV tokens for: ${reason}`);
      return signature;
    } catch (error) {
      console.error('Claim failed:', error);
      throw error;
    }
  }

  // Create NFT (simplified simulation)
  async createNFT(metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  }): Promise<string> {
    if (!this.isWalletConnected()) {
      throw new Error('Wallet not connected');
    }

    try {
      // Simulate NFT creation
      const signature = 'nft_' + Date.now().toString();
      console.log(`Simulated NFT creation: ${metadata.name}`);
      return signature;
    } catch (error) {
      console.error('NFT creation failed:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(address: string, limit: number = 10): Promise<any[]> {
    try {
      const publicKey = new PublicKey(address);
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
      
      const transactions = [];
      for (const sig of signatures) {
        const tx = await connection.getTransaction(sig.signature);
        if (tx) {
          transactions.push({
            signature: sig.signature,
            blockTime: tx.blockTime,
            slot: tx.slot,
            fee: tx.meta?.fee,
            status: tx.meta?.err ? 'failed' : 'success'
          });
        }
      }
      
      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }
}

export const solanaService = new SolanaService();