import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { type TokenAccount } from '@/lib/realSolana';
import { getTokenIcon } from '@/components/TokenIcon';

export default function TokenSelection() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tokens, setTokens] = useState<TokenAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user's tokens
  useEffect(() => {
    if (user?.walletAddress) {
      loadTokens(user.walletAddress);
    }
  }, [user?.walletAddress]);

  const loadTokens = async (address: string) => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Loading tokens for selection:', address);
      
      // Fetch balance from our working backend API
      const response = await fetch(`/api/wallet/balance/${address}`);
      if (!response.ok) throw new Error('Failed to fetch balance');
      
      const balanceData = await response.json();
      console.log('💰 Token data loaded:', balanceData);
      
      // Convert API response to token format for UI
      const usvToken: TokenAccount = {
        mint: 'A9Vnuav6Wd4azfrzKwpK1Z62frmJb7G3Ydr3FkvGKH8W',
        symbol: 'USV',
        name: 'Ultra Smooth Vape',
        balance: balanceData.balanceUSV || 0,
        decimals: 6,
        isNative: false
      };

      const solToken: TokenAccount = {
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        balance: balanceData.balanceSOL || 0,
        decimals: 9,
        isNative: true
      };
      
      // Show both USV and SOL tokens
      const availableTokens = [usvToken, solToken];
      setTokens(availableTokens);
      
    } catch (error) {
      console.error('❌ Failed to load tokens:', error);
      toast({
        title: "❌ Failed to Load Tokens", 
        description: "Could not fetch your token balances",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSelect = (token: TokenAccount) => {
    console.log('🪙 Token selected for sending:', token.symbol);
    
    // Navigate to send form with selected token
    setLocation(`/send/${token.symbol.toLowerCase()}`);
  };


  const getTokenPrice = (symbol: string) => {
    if (symbol === 'SOL') return 230;
    if (symbol === 'USV') return 0; // No liquidity yet
    return 0;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black relative pb-20">
      <BottomNavigation />
      
      <div className="px-6 pt-12">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/wallet')}
            className="text-pink-500 hover:bg-pink-500/20 p-2 rounded-full w-10 h-10"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-black dark:text-white text-lg font-semibold">Select Token to Send</h1>
          <div></div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-4"
        >
          <p className="text-gray-400 text-center mb-6">
            Choose which token you want to send
          </p>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-gray-900/50 border-gray-700/50 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : tokens.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-700/50 p-8 text-center">
              <p className="text-gray-400 mb-4">No tokens available to send</p>
              <p className="text-gray-500 text-sm">
                You need to have tokens in your wallet to send them
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <Card 
                  key={token.mint}
                  className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-colors cursor-pointer"
                  onClick={() => handleTokenSelect(token)}
                  data-testid={`token-select-${token.symbol.toLowerCase()}`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {token.symbol === 'USV' ? (
                          <img src="/usv-logo.png" alt="USV" className="w-12 h-12 rounded-full object-contain" />
                        ) : token.symbol === 'SOL' ? (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-7 h-7" viewBox="0 0 397.7 311.7" fill="white">
                              <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"/>
                              <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"/>
                              <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"/>
                            </svg>
                          </div>
                        ) : (
                          getTokenIcon(token.symbol, "w-12 h-12")
                        )}
                        <div>
                          <h3 className="text-black dark:text-white font-medium text-base">{token.name}</h3>
                          <p className="text-gray-400 text-sm">
                            Balance: {token.balance.toFixed(token.symbol === 'SOL' ? 6 : 2)} {token.symbol}
                          </p>
                          <p className="text-gray-500 text-xs">
                            ≈ ${(token.balance * getTokenPrice(token.symbol)).toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTokenSelect(token);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-black dark:text-white"
                        data-testid={`button-send-${token.symbol.toLowerCase()}`}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Send {token.symbol}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && tokens.length > 0 && (
            <p className="text-gray-500 text-sm text-center mt-6">
              More tokens will appear here as you add them to your wallet
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}