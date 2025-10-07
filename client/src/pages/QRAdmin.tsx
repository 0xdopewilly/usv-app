import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, QrCode, Package, Sparkles, FileDown } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function QRAdmin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('10');
  const [tokenReward, setTokenReward] = useState('1000');
  const [adminKey, setAdminKey] = useState('');
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [downloadHTML, setDownloadHTML] = useState('');

  // Get QR code statistics
  const { data: stats } = useQuery<{ stats: { total: number; claimed: number; unclaimed: number } }>({
    queryKey: ['/api/qr/stats'],
  });

  // Generate QR codes mutation
  const generateMutation = useMutation({
    mutationFn: async (data: { productId: string; quantity: number; tokenReward: number; adminKey: string }) => {
      const response = await apiRequest('POST', '/api/qr/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedCodes(data.codes);
        setDownloadHTML(data.downloadHTML);
        toast({
          title: '🎉 QR Codes Generated!',
          description: `Successfully created ${data.codes.length} QR codes for ${productId}`,
        });
      } else {
        toast({
          title: 'Generation Failed',
          description: data.error || 'Failed to generate QR codes',
          variant: 'destructive',
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate QR codes',
        variant: 'destructive',
      });
    },
  });

  const handleGenerate = () => {
    if (!productId || !adminKey) {
      toast({
        title: 'Missing Information',
        description: 'Please provide product ID and admin key',
        variant: 'destructive',
      });
      return;
    }

    generateMutation.mutate({
      productId,
      quantity: parseInt(quantity) || 10,
      tokenReward: parseInt(tokenReward) || 1000,
      adminKey,
    });
  };

  const handleDownload = () => {
    if (!downloadHTML) return;

    const blob = new Blob([downloadHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usv_qr_codes_${productId}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: 'QR codes HTML file is downloading...',
    });
  };

  const handleDownloadJSON = () => {
    if (generatedCodes.length === 0) return;

    const json = JSON.stringify(generatedCodes, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usv_qr_codes_${productId}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'JSON Downloaded',
      description: 'QR codes data exported as JSON',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black pb-24">
      <BottomNavigation />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/settings')}
            className="text-white"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-white flex items-center">
            <QrCode className="w-6 h-6 mr-2" />
            QR Admin
          </h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-white/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{stats?.stats.total || 0}</p>
                <p className="text-sm text-gray-400 mt-1">Total QR Codes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-white/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{stats?.stats.claimed || 0}</p>
                <p className="text-sm text-gray-400 mt-1">Claimed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-white/10">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{stats?.stats.unclaimed || 0}</p>
                <p className="text-sm text-gray-400 mt-1">Unclaimed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generate QR Codes Form */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
              Generate QR Code Batch
            </CardTitle>
            <CardDescription className="text-gray-400">
              Create a batch of QR codes for product authentication and token rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="productId" className="text-gray-300">
                Product ID
              </Label>
              <Input
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="e.g., ultra_smooth_blue, mango_ice"
                className="bg-white/5 border-white/10 text-white"
                data-testid="input-product-id"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity" className="text-gray-300">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="10"
                  className="bg-white/5 border-white/10 text-white"
                  data-testid="input-quantity"
                />
              </div>

              <div>
                <Label htmlFor="tokenReward" className="text-gray-300">
                  Token Reward
                </Label>
                <Input
                  id="tokenReward"
                  type="number"
                  value={tokenReward}
                  onChange={(e) => setTokenReward(e.target.value)}
                  placeholder="1000"
                  className="bg-white/5 border-white/10 text-white"
                  data-testid="input-token-reward"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="adminKey" className="text-gray-300">
                Admin Key
              </Label>
              <Input
                id="adminKey"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                className="bg-white/5 border-white/10 text-white"
                data-testid="input-admin-key"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default: usv_admin_2024_secret
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              data-testid="button-generate"
            >
              {generateMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Generate QR Codes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Codes Preview */}
        {generatedCodes.length > 0 && (
          <Card className="bg-black/40 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Generated QR Codes</CardTitle>
              <CardDescription className="text-gray-400">
                {generatedCodes.length} codes generated for {productId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  data-testid="button-download-html"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download HTML
                </Button>
                <Button
                  onClick={handleDownloadJSON}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  data-testid="button-download-json"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON
                </Button>
              </div>

              {/* Show first few QR codes as preview */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {generatedCodes.slice(0, 6).map((code, index) => (
                  <motion.div
                    key={code.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 p-3 rounded-lg text-center border border-white/10"
                  >
                    <img
                      src={code.qrImage}
                      alt={`QR ${code.code}`}
                      className="w-full aspect-square object-contain rounded mb-2"
                    />
                    <p className="text-xs text-gray-400 truncate">{code.code}</p>
                    <p className="text-xs text-green-400 font-semibold">{code.tokenReward} USV</p>
                  </motion.div>
                ))}
              </div>
              {generatedCodes.length > 6 && (
                <p className="text-center text-gray-500 text-sm mt-4">
                  + {generatedCodes.length - 6} more codes (download to view all)
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
