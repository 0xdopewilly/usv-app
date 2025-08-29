import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNavigation from '@/components/BottomNavigation';
import { useToast } from '@/hooks/use-toast';

const marketData = {
  currentPrice: 0.20,
  priceChange: +0.012,
  priceChangePercent: +6.4,
  volume24h: 125420,
  marketCap: 2840000,
};

const orderBookData = {
  bids: [
    { price: 0.199, amount: 1500, total: 298.5 },
    { price: 0.198, amount: 2300, total: 455.4 },
    { price: 0.197, amount: 1800, total: 354.6 },
    { price: 0.196, amount: 2100, total: 411.6 },
    { price: 0.195, amount: 1200, total: 234.0 },
  ],
  asks: [
    { price: 0.201, amount: 1800, total: 361.8 },
    { price: 0.202, amount: 1500, total: 303.0 },
    { price: 0.203, amount: 2200, total: 446.6 },
    { price: 0.204, amount: 1900, total: 387.6 },
    { price: 0.205, amount: 1600, total: 328.0 },
  ]
};

export default function TradingInterface() {
  const [, setLocation] = useLocation();
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(marketData.currentPrice.toString());
  const { toast } = useToast();

  const handlePlaceOrder = () => {
    if (!amount || !price) {
      toast({
        title: "Invalid Order",
        description: "Please enter both amount and price",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `${orderType === 'buy' ? 'Buy' : 'Sell'} Order Placed`,
      description: `${amount} USV tokens at $${price} each`,
    });

    setAmount('');
    setPrice(marketData.currentPrice.toString());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900 relative pb-20">
      <BottomNavigation />
      
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 pt-12 pb-4 flex items-center justify-between"
      >
        <ArrowLeft 
          className="w-6 h-6 text-white cursor-pointer" 
          onClick={() => setLocation('/')}
        />
        <h1 className="text-white text-xl font-semibold">Trading</h1>
        <Activity className="w-6 h-6 text-green-400" />
      </motion.div>

      {/* Price Header */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="px-6 mb-6"
      >
        <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">USV/USD</h2>
              <p className="text-gray-400">Ultra Smooth Vape Token</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">${marketData.currentPrice.toFixed(3)}</p>
              <div className="flex items-center space-x-1">
                {marketData.priceChange > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  marketData.priceChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  +{marketData.priceChangePercent}% ({marketData.priceChange > 0 ? '+' : ''}{marketData.priceChange.toFixed(3)})
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">24h Volume</p>
              <p className="text-white font-semibold">{marketData.volume24h.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Market Cap</p>
              <p className="text-white font-semibold">${marketData.marketCap.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trading Interface */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="px-6"
      >
        <Tabs defaultValue="trade" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700/30">
            <TabsTrigger value="trade" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Trade</TabsTrigger>
            <TabsTrigger value="orderbook" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Order Book</TabsTrigger>
          </TabsList>

          <TabsContent value="trade" className="space-y-6">
            {/* Buy/Sell Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={orderType === 'buy' ? 'default' : 'outline'}
                onClick={() => setOrderType('buy')}
                className={`h-12 rounded-2xl ${
                  orderType === 'buy' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
                data-testid="button-buy"
              >
                Buy USV
              </Button>
              <Button
                variant={orderType === 'sell' ? 'default' : 'outline'}
                onClick={() => setOrderType('sell')}
                className={`h-12 rounded-2xl ${
                  orderType === 'sell' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'border-gray-600 text-gray-300 hover:bg-gray-800'
                }`}
                data-testid="button-sell"
              >
                Sell USV
              </Button>
            </div>

            {/* Order Form */}
            <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700/30 space-y-4">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Amount (USV)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white rounded-2xl h-12"
                  data-testid="input-amount"
                />
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Price (USD)</label>
                <Input
                  type="number"
                  step="0.001"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-gray-700/50 border-gray-600 text-white rounded-2xl h-12"
                  data-testid="input-price"
                />
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Total:</span>
                  <span>${(parseFloat(amount || '0') * parseFloat(price || '0')).toFixed(2)}</span>
                </div>
                
                <Button
                  onClick={handlePlaceOrder}
                  className={`w-full h-12 rounded-2xl font-semibold ${
                    orderType === 'buy'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  data-testid="button-place-order"
                >
                  Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orderbook" className="space-y-4">
            <div className="bg-gray-800/50 backdrop-blur rounded-3xl p-6 border border-gray-700/30">
              <h3 className="text-white font-semibold mb-4">Order Book</h3>
              
              {/* Asks (Sell Orders) */}
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-400 mb-2">
                  <span>Price (USD)</span>
                  <span className="text-right">Amount (USV)</span>
                  <span className="text-right">Total (USD)</span>
                </div>
                
                {orderBookData.asks.reverse().map((ask, index) => (
                  <div key={`ask-${index}`} className="grid grid-cols-3 gap-2 text-sm py-1">
                    <span className="text-red-400 font-mono">{ask.price.toFixed(3)}</span>
                    <span className="text-gray-300 text-right font-mono">{ask.amount.toLocaleString()}</span>
                    <span className="text-gray-300 text-right font-mono">{ask.total.toFixed(1)}</span>
                  </div>
                ))}
              </div>

              {/* Current Price */}
              <div className="flex items-center justify-center py-2 mb-4 border-t border-b border-gray-600">
                <DollarSign className="w-4 h-4 text-purple-400 mr-2" />
                <span className="text-purple-400 font-semibold">
                  {marketData.currentPrice.toFixed(3)}
                </span>
              </div>

              {/* Bids (Buy Orders) */}
              <div>
                {orderBookData.bids.map((bid, index) => (
                  <div key={`bid-${index}`} className="grid grid-cols-3 gap-2 text-sm py-1">
                    <span className="text-green-400 font-mono">{bid.price.toFixed(3)}</span>
                    <span className="text-gray-300 text-right font-mono">{bid.amount.toLocaleString()}</span>
                    <span className="text-gray-300 text-right font-mono">{bid.total.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}