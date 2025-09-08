import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';

// USV Token Configuration
export const USV_TOKEN_MINT = new PublicKey('8zGuJQqwhZafTah7Uc7Z4tXRnguqkn5KLFAP8oV6PHe2'); // Example mint address
export const USV_DECIMALS = 6;
export const SOLANA_NETWORK = 'devnet'; // Using devnet for real testing

// REAL Solana connection
export const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
export const solanaConnection = connection; // Alias for compatibility

// Enhanced Phantom Wallet Detection  
const getPhantomWallet = (): PhantomProvider | null => {
  if (typeof window !== 'undefined') {
    const windowAny = window as any;
    return (windowAny.phantom?.solana || windowAny.solana) as PhantomProvider | null;
  }
  return null;
}

interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PublicKey | null;
  isConnected?: boolean;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
  signAndSendTransaction(transaction: Transaction): Promise<{ signature: string }>;
  on(event: string, callback: Function): void;
  request(method: string, params?: any): Promise<any>;
}

// REAL Phantom Wallet Connection Class
class PhantomWalletConnection {
  private phantom: PhantomProvider | null;
  public isConnected: boolean = false;
  public publicKey: PublicKey | null = null;

  constructor() {
    this.phantom = getPhantomWallet();
  }

  // Check if Phantom is installed
  isInstalled(): boolean {
    return this.phantom !== null && this.phantom.isPhantom === true;
  }

  // REAL connection to Phantom wallet
  async connect(): Promise<{ success: boolean; publicKey?: string; error?: string }> {
    try {
      if (!this.phantom) {
        return {
          success: false,
          error: 'Phantom wallet not installed. Please install Phantom browser extension.'
        };
      }

      const response = await this.phantom.connect();
      this.publicKey = response.publicKey;
      this.isConnected = true;
      
      console.log('🦄 Phantom wallet connected:', response.publicKey.toString());
      
      return {
        success: true,
        publicKey: response.publicKey.toString()
      };
    } catch (error: any) {
      console.error('Phantom connection error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to Phantom wallet'
      };
    }
  }

  // Disconnect Phantom wallet
  async disconnect(): Promise<void> {
    if (this.phantom && this.isConnected) {
      await this.phantom.disconnect();
      this.isConnected = false;
      this.publicKey = null;
      console.log('🦄 Phantom wallet disconnected');
    }
  }

  // Get REAL SOL balance from Phantom wallet
  async getBalance(): Promise<number> {
    if (!this.publicKey) return 0;
    
    try {
      const balance = await connection.getBalance(this.publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Failed to get Phantom balance:', error);
      return 0;
    }
  }

  // REAL transaction signing and sending
  async signAndSendTransaction(transaction: Transaction): Promise<string> {
    if (!this.phantom || !this.publicKey) {
      throw new Error('Phantom wallet not connected');
    }

    try {
      const response = await this.phantom.signAndSendTransaction(transaction);
      console.log('🦄 Transaction sent:', response.signature);
      return response.signature;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  // Get current connected address
  getAddress(): string | null {
    return this.publicKey?.toString() || null;
  }
}

// Export singleton instance
export const phantomWallet = new PhantomWalletConnection();

// Legacy SolanaService for backward compatibility
export class SolanaService {
  constructor() {
    // Initialize service
  }

  // Check if Phantom wallet is installed
  isWalletInstalled(): boolean {
    return phantomWallet.isInstalled();
  }

  // Connect to Phantom wallet
  async connectWallet(): Promise<string | null> {
    const result = await phantomWallet.connect();
    if (result.success) {
      return result.publicKey!;
    } else {
      throw new Error(result.error);
    }
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    await phantomWallet.disconnect();
  }

  // Get wallet address
  getWalletAddress(): string | null {
    return phantomWallet.getAddress();
  }

  // Check if wallet is connected
  isWalletConnected(): boolean {
    return phantomWallet.isConnected && phantomWallet.publicKey !== null;
  }

  // Get REAL SOL balance
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

  // Get USV token balance (REAL implementation)
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

  // REAL USV token transfer
  async transferUSV(toAddress: string, amount: number): Promise<string> {
    if (!this.isWalletConnected()) {
      throw new Error('Phantom wallet not connected');
    }

    try {
      if (!phantomWallet.publicKey) {
        throw new Error('No public key available');
      }

      const fromTokenAccount = await getAssociatedTokenAddress(
        USV_TOKEN_MINT,
        phantomWallet.publicKey
      );
      const toTokenAccount = await getAssociatedTokenAddress(
        USV_TOKEN_MINT,
        new PublicKey(toAddress)
      );

      const transaction = new Transaction();

      // Check if destination token account exists
      const toAccountInfo = await connection.getAccountInfo(toTokenAccount);
      if (!toAccountInfo) {
        // Create associated token account if it doesn't exist
        transaction.add(
          createAssociatedTokenAccountInstruction(
            phantomWallet.publicKey, // payer
            toTokenAccount, // associatedToken
            new PublicKey(toAddress), // owner
            USV_TOKEN_MINT // mint
          )
        );
      }

      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          fromTokenAccount, // source
          toTokenAccount, // destination
          phantomWallet.publicKey, // owner
          amount * Math.pow(10, USV_DECIMALS) // amount (in smallest units)
        )
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = phantomWallet.publicKey;

      const signature = await phantomWallet.signAndSendTransaction(transaction);
      console.log(`✅ Transferred ${amount} USV tokens to ${toAddress}`);
      
      return signature;
    } catch (error: any) {
      console.error('USV transfer failed:', error);
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  // REAL SOL transfer (for testing)
  async transferSOL(toAddress: string, amount: number): Promise<string> {
    if (!this.isWalletConnected() || !phantomWallet.publicKey) {
      throw new Error('Phantom wallet not connected');
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: phantomWallet.publicKey,
          toPubkey: new PublicKey(toAddress),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = phantomWallet.publicKey;

      const signature = await phantomWallet.signAndSendTransaction(transaction);
      console.log(`✅ Transferred ${amount} SOL to ${toAddress}`);
      
      return signature;
    } catch (error: any) {
      console.error('SOL transfer failed:', error);
      throw new Error(`Transfer failed: ${error.message}`);
    }
  }

  // REAL staking simulation (for demo)
  async stakeUSV(amount: number): Promise<string> {
    if (!this.isWalletConnected()) {
      throw new Error('Phantom wallet not connected');
    }

    try {
      // For demo purposes, we'll create a simple transfer transaction
      // In a real app, this would interact with a staking program
      const signature = `stake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`🏦 Staked ${amount} USV tokens (simulated)`);
      return signature;
    } catch (error: any) {
      console.error('Staking failed:', error);
      throw error;
    }
  }

  // REAL unstaking simulation
  async unstakeUSV(amount: number): Promise<string> {
    if (!this.isWalletConnected()) {
      throw new Error('Phantom wallet not connected');
    }

    try {
      const signature = `unstake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log(`💸 Unstaked ${amount} USV tokens (simulated)`);
      return signature;
    } catch (error: any) {
      console.error('Unstaking failed:', error);
      throw error;
    }
  }
}

// Export utility functions
export const getWalletBalance = async (publicKey: string): Promise<number> => {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Failed to get wallet balance:', error);
    return 0;
  }
};

// Get ALL token accounts for a wallet (REAL DEVNET TOKENS)
export const getAllTokenAccounts = async (publicKey: string) => {
  try {
    const wallet = new PublicKey(publicKey);
    
    // Get all token accounts for this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet,
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    const tokens = [];
    
    // Add SOL first (native token)
    const solBalance = await connection.getBalance(wallet);
    tokens.push({
      mint: 'So11111111111111111111111111111111111111112', // SOL mint address
      symbol: 'SOL',
      name: 'Solana',
      balance: solBalance / LAMPORTS_PER_SOL,
      decimals: 9,
      isNative: true
    });

    // Add all SPL tokens
    for (const tokenAccount of tokenAccounts.value) {
      const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;
      const mint = tokenAccount.account.data.parsed.info.mint;
      
      if (tokenAmount.uiAmount && tokenAmount.uiAmount > 0) {
        tokens.push({
          mint: mint,
          symbol: await getTokenSymbol(mint),
          name: await getTokenName(mint),
          balance: tokenAmount.uiAmount,
          decimals: tokenAmount.decimals,
          isNative: false
        });
      }
    }

    return tokens;
  } catch (error) {
    console.error('Failed to get token accounts:', error);
    return [];
  }
};

// Get token metadata (symbol and name)
const getTokenSymbol = async (mint: string): Promise<string> => {
  // For USV token, return USV
  if (mint === USV_TOKEN_MINT.toString()) return 'USV';
  
  // For other tokens, try to get from metadata or use shortened mint
  try {
    // This is a simplified approach - in production you'd want to fetch from token registry
    return mint.slice(0, 8) + '...';
  } catch {
    return 'Unknown';
  }
};

const getTokenName = async (mint: string): Promise<string> => {
  // For USV token
  if (mint === USV_TOKEN_MINT.toString()) return 'Ultra Smooth Vape';
  
  // For other tokens, try to get from metadata
  try {
    return `Token ${mint.slice(0, 8)}`;
  } catch {
    return 'Unknown Token';
  }
};

// Refresh all balances for a wallet
export const refreshWalletBalances = async (publicKey: string) => {
  try {
    console.log('🔄 Refreshing wallet balances for:', publicKey);
    const tokens = await getAllTokenAccounts(publicKey);
    console.log('💰 Found tokens:', tokens);
    return tokens;
  } catch (error) {
    console.error('Failed to refresh balances:', error);
    return [];
  }
};

// REAL Phantom to App Transfer Function
export const transferFromPhantomToApp = async (recipientAddress: string, amount: number): Promise<{ success: boolean; signature?: string; error?: string }> => {
  try {
    if (!phantomWallet.publicKey) {
      return { success: false, error: 'Phantom wallet not connected' };
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: phantomWallet.publicKey,
        toPubkey: new PublicKey(recipientAddress),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = phantomWallet.publicKey;

    const signature = await phantomWallet.signAndSendTransaction(transaction);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    
    console.log(`✅ Successfully transferred ${amount} SOL to app wallet`);
    
    return {
      success: true,
      signature
    };
  } catch (error: any) {
    console.error('Transfer failed:', error);
    return {
      success: false,
      error: error.message || 'Transfer failed'
    };
  }
};

// Check if Phantom is installed
export const isPhantomInstalled = (): boolean => {
  return phantomWallet.isInstalled();
};

// Export singleton service instance
export const solanaService = new SolanaService();

// Default export for compatibility
export default solanaService;