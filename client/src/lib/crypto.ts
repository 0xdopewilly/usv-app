import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri?: string;
}

export interface WalletBalance {
  token: string;
  balance: number;
  usdValue: number;
}

export class SolanaService {
  private connection: Connection;
  
  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  async getTokenBalance(publicKey: PublicKey, mintAddress: string): Promise<number> {
    try {
      const mint = new PublicKey(mintAddress);
      const tokenAccount = await getAssociatedTokenAddress(mint, publicKey);
      
      const balance = await this.connection.getTokenAccountBalance(tokenAccount);
      return balance.value.uiAmount || 0;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  }

  async sendTransaction(transaction: Transaction, signers: any[]): Promise<string> {
    try {
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = signers[0].publicKey;

      // Sign the transaction
      transaction.sign(...signers);

      // Send the transaction
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize()
      );

      // Confirm the transaction
      await this.connection.confirmTransaction(signature);
      
      return signature;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  async createTransferTransaction(
    from: PublicKey,
    to: PublicKey,
    amount: number
  ): Promise<Transaction> {
    const transaction = new Transaction();
    
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    return transaction;
  }

  async createTokenTransferTransaction(
    from: PublicKey,
    to: PublicKey,
    mintAddress: string,
    amount: number,
    decimals: number
  ): Promise<Transaction> {
    const mint = new PublicKey(mintAddress);
    const fromTokenAccount = await getAssociatedTokenAddress(mint, from);
    const toTokenAccount = await getAssociatedTokenAddress(mint, to);

    const transaction = new Transaction();
    
    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        from,
        amount * Math.pow(10, decimals)
      )
    );

    return transaction;
  }

  async airdropSol(publicKey: PublicKey, amount: number): Promise<string> {
    try {
      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      throw error;
    }
  }

  // USV Token specific functions
  static readonly USV_MINT = 'USV_TOKEN_MINT_ADDRESS'; // Replace with actual mint address
  
  async getUSVBalance(publicKey: PublicKey): Promise<number> {
    return this.getTokenBalance(publicKey, SolanaService.USV_MINT);
  }

  async transferUSV(
    from: PublicKey,
    to: PublicKey,
    amount: number
  ): Promise<Transaction> {
    return this.createTokenTransferTransaction(
      from,
      to,
      SolanaService.USV_MINT,
      amount,
      9 // USV token decimals
    );
  }
}

// Price fetching service
export class PriceService {
  private static readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  
  static async getTokenPrice(tokenId: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.COINGECKO_API}/simple/price?ids=${tokenId}&vs_currencies=usd`
      );
      const data = await response.json();
      return data[tokenId]?.usd || 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }

  static async getSolanaPrice(): Promise<number> {
    return this.getTokenPrice('solana');
  }

  static async getUSVPrice(): Promise<number> {
    // Since USV is a custom token, we'll use a fixed price or fetch from your API
    // For demo purposes, using a fixed price
    return 2.0; // $2.00 per USV token
  }
}

export const solanaService = new SolanaService();
