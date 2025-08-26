import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { loginSchema, signupSchema, verificationSchema, withdrawSchema } from '../shared/schema';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth routes
router.post('/auth/signup', async (req, res) => {
  try {
    const data = signupSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await storage.createUser({
      ...data,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName,
        balance: user.balance,
        stakedBalance: user.stakedBalance,
      } 
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid signup data' });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    
    // Find user
    const user = await storage.getUserByEmail(data.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(data.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName,
        balance: user.balance,
        stakedBalance: user.stakedBalance,
      } 
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid login data' });
  }
});

// User routes
router.get('/user/profile', authenticateToken, async (req: any, res) => {
  try {
    const user = await storage.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      balance: user.balance,
      stakedBalance: user.stakedBalance,
      walletAddress: user.walletAddress,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      faceIdEnabled: user.faceIdEnabled,
      pushNotifications: user.pushNotifications,
      emailNotifications: user.emailNotifications,
      preferredLanguage: user.preferredLanguage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.patch('/user/profile', authenticateToken, async (req: any, res) => {
  try {
    const user = await storage.updateUser(req.user.userId, req.body);
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      balance: user.balance,
      stakedBalance: user.stakedBalance,
      walletAddress: user.walletAddress,
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      faceIdEnabled: user.faceIdEnabled,
      pushNotifications: user.pushNotifications,
      emailNotifications: user.emailNotifications,
      preferredLanguage: user.preferredLanguage,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Transaction routes
router.get('/transactions', authenticateToken, async (req: any, res) => {
  try {
    const transactions = await storage.getTransactionsByUserId(req.user.userId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/transactions/withdraw', authenticateToken, async (req: any, res) => {
  try {
    const data = withdrawSchema.parse(req.body);
    
    // Get user to check balance
    const user = await storage.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.balance < data.amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal transaction
    const transaction = await storage.createTransaction({
      userId: req.user.userId,
      type: 'withdraw',
      amount: data.amount,
      toAddress: data.toAddress,
      status: 'pending',
    });

    // Update user balance
    await storage.updateUser(req.user.userId, {
      balance: user.balance - data.amount,
    });

    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: 'Invalid withdrawal data' });
  }
});

// QR Code routes
router.post('/qr/claim', authenticateToken, async (req: any, res) => {
  try {
    const { code } = req.body;
    
    // Find QR code
    const qrCode = await storage.getQRCodeByCode(code);
    if (!qrCode) {
      return res.status(404).json({ error: 'Invalid QR code' });
    }

    if (!qrCode.isActive || qrCode.claimedBy) {
      return res.status(400).json({ error: 'QR code already claimed or inactive' });
    }

    // Update QR code as claimed
    await storage.updateQRCode(qrCode.id, {
      claimedBy: req.user.userId,
      claimedAt: new Date().toISOString(),
      isActive: false,
    });

    // Create claim transaction
    const transaction = await storage.createTransaction({
      userId: req.user.userId,
      type: 'claim',
      amount: qrCode.tokenReward,
      status: 'completed',
    });

    // Update user balance
    const user = await storage.getUserById(req.user.userId);
    if (user) {
      await storage.updateUser(req.user.userId, {
        balance: user.balance + qrCode.tokenReward,
      });
    }

    res.json({ 
      message: 'QR code claimed successfully',
      reward: qrCode.tokenReward,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to claim QR code' });
  }
});

// NFT routes
router.get('/nfts', authenticateToken, async (req: any, res) => {
  try {
    const nfts = await storage.getNFTsByUserId(req.user.userId);
    res.json(nfts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch NFTs' });
  }
});

router.get('/nfts/:id', authenticateToken, async (req: any, res) => {
  try {
    const nft = await storage.getNFTById(req.params.id);
    if (!nft || nft.userId !== req.user.userId) {
      return res.status(404).json({ error: 'NFT not found' });
    }
    res.json(nft);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch NFT' });
  }
});

// Vape stores routes
router.get('/stores', async (req, res) => {
  try {
    const stores = await storage.getAllVapeStores();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

// Verification routes
router.post('/verify/captcha', async (req, res) => {
  // Simple captcha verification simulation
  const { token } = req.body;
  if (token) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Captcha verification failed' });
  }
});

router.post('/verify/2fa', authenticateToken, async (req: any, res) => {
  try {
    const data = verificationSchema.parse(req.body);
    
    // Simple 2FA verification simulation
    // In production, this would verify against TOTP or SMS code
    if (data.code === '123456') {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'Invalid verification code' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Invalid verification code format' });
  }
});

export function registerRoutes(app: any) {
  app.use('/api', router);
  return app;
}

export default router;
