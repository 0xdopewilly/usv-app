// REAL Solana Web3 integration for browser
interface PhantomWalletType {
  isPhantom?: boolean;
  publicKey?: any;
  isConnected?: boolean;
  connect(): Promise<{ publicKey: any }>;
  disconnect(): Promise<void>;
  request(method: string, params?: any): Promise<any>;
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomWalletType;
    };
  }
}

export interface TokenAccount {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  isNative: boolean;
}

// REAL Solana mainnet connection
const MAINNET_RPC = 'https://api.mainnet-beta.solana.com';

// Real Phantom wallet service
export class RealPhantomWallet {
  public isConnected = false;
  public publicKey: string | null = null;

  // Check if Phantom is installed
  isInstalled(): boolean {
    return typeof window !== 'undefined' && window.phantom?.solana?.isPhantom === true;
  }

  // Connect to REAL Phantom wallet
  async connect(): Promise<{ success: boolean; publicKey?: string; error?: string }> {
    try {
      if (!this.isInstalled()) {
        return {
          success: false,
          error: 'Phantom wallet not installed. Please install Phantom browser extension.'
        };
      }

      const phantom = window.phantom?.solana;
      if (!phantom) {
        throw new Error('Phantom not available');
      }

      const response = await phantom.connect();
      this.publicKey = response.publicKey.toString();
      this.isConnected = true;
      
      console.log('🦄 REAL Phantom wallet connected (MAINNET):', this.publicKey);
      
      return {
        success: true,
        publicKey: this.publicKey
      };
    } catch (error: any) {
      console.error('Phantom connection error:', error);
      return {
        success: false,
        error: error.message || 'Failed to connect to Phantom wallet'
      };
    }
  }

  // Disconnect wallet
  async disconnect(): Promise<void> {
    const phantom = window.phantom?.solana;
    if (phantom && this.isConnected) {
      await phantom.disconnect();
      this.isConnected = false;
      this.publicKey = null;
      console.log('🦄 Phantom wallet disconnected');
    }
  }

  // Get current address
  getAddress(): string | null {
    return this.publicKey;
  }
}

// REAL balance fetching using Solana RPC
export async function getRealSolBalance(publicKey: string): Promise<number> {
  try {
    console.log('🔍 Fetching REAL SOL balance (MAINNET) for:', publicKey);
    
    const response = await fetch(MAINNET_RPC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [publicKey]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('SOL balance error:', data.error);
      return 0;
    }

    const lamports = data.result.value;
    const solBalance = lamports / 1000000000; // Convert lamports to SOL
    
    console.log('💰 REAL SOL balance (MAINNET):', solBalance);
    return solBalance;
  } catch (error) {
    console.error('Failed to fetch SOL balance:', error);
    return 0;
  }
}

// Get ALL real token accounts
export async function getRealTokenAccounts(publicKey: string): Promise<TokenAccount[]> {
  try {
    console.log('🔍 Fetching REAL token accounts (MAINNET) for:', publicKey);
    
    const tokens: TokenAccount[] = [];
    
    // First, get SOL balance (native token)
    const solBalance = await getRealSolBalance(publicKey);
    tokens.push({
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      balance: solBalance,
      decimals: 9,
      isNative: true
    });

    // Get SPL token accounts
    try {
      const response = await fetch(MAINNET_RPC, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            publicKey,
            {
              programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
            },
            {
              encoding: 'jsonParsed'
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.result?.value) {
        for (const account of data.result.value) {
          const tokenInfo = account.account.data.parsed.info;
          const tokenAmount = tokenInfo.tokenAmount;
          
          if (tokenAmount.uiAmount && tokenAmount.uiAmount > 0) {
            const mint = tokenInfo.mint;
            
            // Get token metadata (simplified)
            let symbol = 'Unknown';
            let name = 'Unknown Token';
            
            // Special case for USV token
            if (mint === '8zGuJQqwhZafTah7Uc7Z4tXRnguqkn5KLFAP8oV6PHe2') {
              symbol = 'USV';
              name = 'Ultra Smooth Vape';
            } else {
              symbol = mint.slice(0, 8) + '...';
              name = `Token ${mint.slice(0, 8)}`;
            }
            
            tokens.push({
              mint: mint,
              symbol: symbol,
              name: name,
              balance: tokenAmount.uiAmount,
              decimals: tokenAmount.decimals,
              isNative: false
            });
          }
        }
      }
    } catch (tokenError) {
      console.error('Failed to fetch token accounts:', tokenError);
    }

    console.log('💰 REAL tokens found (MAINNET):', tokens);
    return tokens;
  } catch (error) {
    console.error('Failed to fetch token accounts:', error);
    return [];
  }
}

// Export singleton
export const realPhantomWallet = new RealPhantomWallet();

// Real wallet refresh function
export async function refreshRealWalletBalances(publicKey: string): Promise<TokenAccount[]> {
  console.log('🔄 Refreshing REAL wallet balances (MAINNET) for:', publicKey);
  return await getRealTokenAccounts(publicKey);
}