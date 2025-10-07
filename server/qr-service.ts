import QRCode from 'qrcode';
import crypto from 'crypto';
import type { QRCode as QRCodeType } from '@shared/schema';

export class QRCodeService {
  generateUniqueCode(prefix: string = 'USV'): string {
    const random = crypto.randomBytes(8).toString('hex').toUpperCase();
    return `${prefix}-${random.substring(0, 4)}-${random.substring(4, 8)}-${random.substring(8, 12)}`;
  }

  async generateQRImage(code: string): Promise<string> {
    const claimUrl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/scanner?claim=${code}`;
    const qrImageDataUrl = await QRCode.toDataURL(claimUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrImageDataUrl;
  }

  async generateBatch(productId: string, quantity: number, tokenReward: number = 1000): Promise<Array<{
    code: string;
    productId: string;
    tokenReward: number;
    qrImage: string;
  }>> {
    const batch = [];
    
    for (let i = 0; i < quantity; i++) {
      const code = this.generateUniqueCode();
      const qrImage = await this.generateQRImage(code);
      
      batch.push({
        code,
        productId,
        tokenReward,
        qrImage,
      });
    }
    
    return batch;
  }

  async validateClaim(qrCode: QRCodeType, userWalletAddress: string): Promise<{ isValid: boolean; error?: string }> {
    // Check if already claimed
    if (qrCode.claimed || qrCode.claimedBy) {
      return {
        isValid: false,
        error: 'This QR code has already been claimed'
      };
    }

    // Check if QR code is still active
    if (!qrCode.isActive) {
      return {
        isValid: false,
        error: 'This QR code is no longer active'
      };
    }

    return { isValid: true };
  }

  generateDownloadHTML(codes: Array<{ code: string; qrImage: string; productId: string; tokenReward: number }>): string {
    const qrCards = codes.map((item, index) => `
      <div class="qr-card" style="page-break-inside: avoid; margin-bottom: 20px; padding: 20px; border: 2px solid #333; border-radius: 10px; text-align: center; width: 300px; display: inline-block; margin: 10px;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">USV Token QR #${index + 1}</h3>
        <img src="${item.qrImage}" alt="QR Code" style="width: 250px; height: 250px; border: 1px solid #ddd; border-radius: 8px;"/>
        <p style="margin: 10px 0 5px 0; font-weight: bold; font-size: 14px;">Code: ${item.code}</p>
        <p style="margin: 5px 0; font-size: 12px; color: #666;">Product: ${item.productId}</p>
        <p style="margin: 5px 0; font-size: 14px; color: #0066cc; font-weight: bold;">${item.tokenReward} USV Tokens</p>
      </div>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>USV Token QR Codes</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 10px;
    }
    .container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
    }
    @media print {
      body { background: white; }
      .qr-card { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔥 USV Token QR Codes</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p>Total Codes: ${codes.length} | Product: ${codes[0]?.productId || 'N/A'}</p>
  </div>
  <div class="container">
    ${qrCards}
  </div>
  <script>
    // Auto-print option
    // window.print();
  </script>
</body>
</html>
    `.trim();
  }
}

export const qrCodeService = new QRCodeService();
