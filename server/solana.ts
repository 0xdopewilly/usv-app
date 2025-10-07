import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import bs58 from 'bs58';

// Solana configuration from environment variables
const COMPANY_WALLET_PRIVATE_KEY = process.env.COMPANY_WALLET_PRIVATE_KEY;
const USV_TOKEN_MINT_ADDRESS = process.env.USV_TOKEN_MINT_ADDRESS;
const SOLANA_NETWORK = process.env.SOLANA_NETWORK || 'mainnet-beta';

if (!COMPANY_WALLET_PRIVATE_KEY) {
  throw new Error('COMPANY_WALLET_PRIVATE_KEY environment variable is required');
}

if (!USV_TOKEN_MINT_ADDRESS) {
  throw new Error('USV_TOKEN_MINT_ADDRESS environment variable is required');
}

// Initialize Solana connection
const SOLANA_RPC_URL = SOLANA_NETWORK === 'mainnet-beta' 
  ? 'https://api.mainnet-beta.solana.com'
  : 'https://api.devnet.solana.com';

const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Initialize company wallet keypair from private key
let companyWallet: Keypair;
try {
  let privateKeyBytes: Uint8Array;
  
  // Try to parse the private key in different formats
  try {
    // Format 1: Try base58 decode first
    privateKeyBytes = bs58.decode(COMPANY_WALLET_PRIVATE_KEY);
  } catch (base58Error) {
    try {
      // Format 2: Try JSON array format [1,2,3,...]
      const parsed = JSON.parse(COMPANY_WALLET_PRIVATE_KEY);
      if (Array.isArray(parsed)) {
        privateKeyBytes = new Uint8Array(parsed);
      } else {
        throw new Error('Not an array');
      }
    } catch (jsonError) {
      // Format 3: Try comma-separated values
      if (COMPANY_WALLET_PRIVATE_KEY.includes(',')) {
        const numbers = COMPANY_WALLET_PRIVATE_KEY.split(',').map(n => parseInt(n.trim()));
        privateKeyBytes = new Uint8Array(numbers);
      } else {
        throw new Error('Could not parse private key format');
      }
    }
  }
  
  companyWallet = Keypair.fromSecretKey(privateKeyBytes);
  console.log('✅ Company wallet initialized:', companyWallet.publicKey.toBase58());
} catch (error) {
  console.error('❌ Failed to initialize company wallet:', error);
  throw new Error('Invalid COMPANY_WALLET_PRIVATE_KEY format. Please provide as base58 string or JSON array');
}

// USV Token mint public key
const usvTokenMint = new PublicKey(USV_TOKEN_MINT_ADDRESS);

export interface TokenTransferResult {
  success: boolean;
  signature?: string;
  error?: string;
  explorerUrl?: string;
}

/**
 * Transfer USV tokens from company wallet to user wallet
 * @param recipientWalletAddress - User's Solana wallet address (base58)
 * @param amount - Amount of tokens to transfer (in token units, not lamports)
 * @returns Transfer result with transaction signature
 */
export async function transferUsvTokens(
  recipientWalletAddress: string,
  amount: number
): Promise<TokenTransferResult> {
  try {
    console.log(`🚀 Starting USV token transfer:`, {
      recipient: recipientWalletAddress,
      amount,
      network: SOLANA_NETWORK
    });

    // Validate recipient address
    let recipientPublicKey: PublicKey;
    try {
      recipientPublicKey = new PublicKey(recipientWalletAddress);
    } catch (error) {
      console.error('❌ Invalid recipient wallet address:', error);
      return {
        success: false,
        error: 'Invalid recipient wallet address'
      };
    }

    // Get or create token accounts for both company and recipient
    console.log('📦 Getting/creating token accounts...');
    
    // Use getOrCreateAssociatedTokenAccount which handles everything automatically
    const companyTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      companyWallet,
      usvTokenMint,
      companyWallet.publicKey,
      false, // Don't allow owner off curve
      'confirmed' // Use confirmed commitment for better reliability
    );
    
    console.log('✅ Company token account:', companyTokenAccount.address.toBase58());

    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      companyWallet, // Company pays for recipient's token account creation if needed
      usvTokenMint,
      recipientPublicKey
    );

    console.log('💰 Token accounts ready:', {
      companyAccount: companyTokenAccount.address.toBase58(),
      recipientAccount: recipientTokenAccount.address.toBase58()
    });

    // Get mint info to determine correct decimals
    const mintInfo = await connection.getParsedAccountInfo(usvTokenMint);
    const decimals = (mintInfo.value?.data as any)?.parsed?.info?.decimals || 6; // Default to 6 if unavailable
    
    console.log(`🔍 USV Token decimals: ${decimals}`);

    // Convert token amount to smallest units (multiply by decimals)
    const transferAmount = BigInt(Math.floor(amount * Math.pow(10, decimals)));

    console.log(`💸 Transferring ${amount} USV tokens (${transferAmount} base units with ${decimals} decimals)...`);

    // Execute the transfer
    const signature = await transfer(
      connection,
      companyWallet,
      companyTokenAccount.address,
      recipientTokenAccount.address,
      companyWallet.publicKey,
      transferAmount
    );

    console.log('✅ Transfer successful! Signature:', signature);

    // Generate explorer URL
    const explorerUrl = SOLANA_NETWORK === 'mainnet-beta'
      ? `https://solscan.io/tx/${signature}`
      : `https://solscan.io/tx/${signature}?cluster=devnet`;

    return {
      success: true,
      signature,
      explorerUrl
    };

  } catch (error: any) {
    console.error('❌ Token transfer failed:', error);
    
    let errorMessage = 'Token transfer failed';
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Get company wallet balance
 */
export async function getCompanyWalletBalance(): Promise<number> {
  try {
    const companyTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      companyWallet,
      usvTokenMint,
      companyWallet.publicKey
    );

    const balance = await connection.getTokenAccountBalance(companyTokenAccount.address);
    
    // Get actual decimals from mint
    const mintInfo = await connection.getParsedAccountInfo(usvTokenMint);
    const decimals = (mintInfo.value?.data as any)?.parsed?.info?.decimals || 6;
    
    return Number(balance.value.amount) / Math.pow(10, decimals);
  } catch (error) {
    console.error('Failed to get company wallet balance:', error);
    return 0;
  }
}

/**
 * Get network info
 */
export function getSolanaNetworkInfo() {
  return {
    network: SOLANA_NETWORK,
    rpcUrl: SOLANA_RPC_URL,
    companyWallet: companyWallet.publicKey.toBase58(),
    tokenMint: USV_TOKEN_MINT_ADDRESS
  };
}
