// Phantom Wallet Integration for Solana
export interface PhantomWallet {
  isPhantom?: boolean;
  publicKey?: { toString(): string };
  isConnected?: boolean;
  connect(): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  signTransaction?(transaction: any): Promise<any>;
  signAllTransactions?(transactions: any[]): Promise<any[]>;
}

declare global {
  interface Window {
    solana?: PhantomWallet;
  }
}

export class PhantomWalletService {
  private wallet: PhantomWallet | null = null;

  constructor() {
    this.wallet = this.getPhantomWallet();
  }

  private getPhantomWallet(): PhantomWallet | null {
    if (typeof window !== 'undefined' && window.solana) {
      return window.solana;
    }
    return null;
  }

  public isPhantomInstalled(): boolean {
    return !!(this.wallet && this.wallet.isPhantom);
  }

  public async connectWallet(): Promise<string | null> {
    if (!this.isPhantomInstalled()) {
      // Redirect to Phantom app on mobile or show install prompt
      this.redirectToPhantom();
      return null;
    }

    try {
      const response = await this.wallet!.connect();
      return response.publicKey.toString();
    } catch (error) {
      console.error('Failed to connect to Phantom wallet:', error);
      throw new Error('Failed to connect wallet');
    }
  }

  public async disconnectWallet(): Promise<void> {
    if (this.wallet && this.wallet.isConnected) {
      await this.wallet.disconnect();
    }
  }

  public getConnectedAddress(): string | null {
    if (this.wallet && this.wallet.isConnected && this.wallet.publicKey) {
      return this.wallet.publicKey.toString();
    }
    return null;
  }

  public isConnected(): boolean {
    return !!(this.wallet && this.wallet.isConnected);
  }

  private redirectToPhantom(): void {
    // Detect if user is on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Deep link to Phantom mobile app
      const currentUrl = encodeURIComponent(window.location.href);
      window.location.href = `phantom://browse/${currentUrl}`;
      
      // Fallback to app store after a delay
      setTimeout(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const storeUrl = isIOS 
          ? 'https://apps.apple.com/app/phantom-solana-wallet/1598432977'
          : 'https://play.google.com/store/apps/details?id=app.phantom';
        window.open(storeUrl, '_blank');
      }, 2000);
    } else {
      // Desktop - redirect to Phantom website
      window.open('https://phantom.app/', '_blank');
    }
  }

  // Listen for account changes
  public onAccountChange(callback: (publicKey: string | null) => void): void {
    if (this.wallet) {
      // Phantom wallet doesn't have a standard event listener, so we poll
      setInterval(() => {
        const currentAddress = this.getConnectedAddress();
        callback(currentAddress);
      }, 1000);
    }
  }
}

export const phantomWallet = new PhantomWalletService();