import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  password: z.string().min(8),
  walletAddress: z.string().optional(),
  balance: z.number().default(0),
  stakedBalance: z.number().default(0),
  isVerified: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  faceIdEnabled: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  preferredLanguage: z.string().default("en"),
  createdAt: z.string().datetime(),
});

export const createInsertUserSchema = userSchema.omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof createInsertUserSchema>;
export type User = z.infer<typeof userSchema>;

// Transaction schema
export const transactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["deposit", "withdraw", "claim", "stake", "unstake", "transfer"]),
  amount: z.number(),
  token: z.string().default("USV"),
  status: z.enum(["pending", "completed", "failed"]),
  toAddress: z.string().optional(),
  fromAddress: z.string().optional(),
  txHash: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const createInsertTransactionSchema = transactionSchema.omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof createInsertTransactionSchema>;
export type Transaction = z.infer<typeof transactionSchema>;

// NFT schema
export const nftSchema = z.object({
  id: z.string(),
  userId: z.string(),
  tokenId: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  collection: z.string(),
  mintAddress: z.string(),
  floorPrice: z.number(),
  lastSalePrice: z.number().optional(),
  isStaked: z.boolean().default(false),
  attributes: z.array(z.object({
    trait_type: z.string(),
    value: z.string(),
  })).default([]),
  createdAt: z.string().datetime(),
});

export const createInsertNFTSchema = nftSchema.omit({ id: true, createdAt: true });
export type InsertNFT = z.infer<typeof createInsertNFTSchema>;
export type NFT = z.infer<typeof nftSchema>;

// QR Code schema for vape store verification
export const qrCodeSchema = z.object({
  id: z.string(),
  code: z.string(),
  storeId: z.string(),
  productId: z.string(),
  isActive: z.boolean().default(true),
  claimedBy: z.string().optional(),
  claimedAt: z.string().datetime().optional(),
  tokenReward: z.number().default(25),
  createdAt: z.string().datetime(),
});

export const createInsertQRCodeSchema = qrCodeSchema.omit({ id: true, createdAt: true });
export type InsertQRCode = z.infer<typeof createInsertQRCodeSchema>;
export type QRCode = z.infer<typeof qrCodeSchema>;

// Vape Store schema
export const vapeStoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  isPartner: z.boolean().default(false),
  qrCodes: z.array(z.string()).default([]),
  phone: z.string().optional(),
  hours: z.string().optional(),
  rating: z.number().min(0).max(5).default(4.5),
  createdAt: z.string().datetime(),
});

// Product Catalog schema
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.enum(["pods", "devices", "accessories", "ejuice"]),
  image: z.string(),
  inStock: z.boolean().default(true),
  tokenReward: z.number().default(25),
  createdAt: z.string().datetime(),
});

// Analytics schema
export const analyticsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.enum(["claim", "stake", "unstake", "scan", "trade"]),
  amount: z.number().optional(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
});

// Notification schema
export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["reward", "trade", "security", "general"]),
  isRead: z.boolean().default(false),
  actionUrl: z.string().optional(),
  createdAt: z.string().datetime(),
});

export const createInsertVapeStoreSchema = vapeStoreSchema.omit({ id: true, createdAt: true });
export type InsertVapeStore = z.infer<typeof createInsertVapeStoreSchema>;
export type VapeStore = z.infer<typeof vapeStoreSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  acceptTerms: z.boolean().refine(val => val === true, "Must accept terms"),
});

export const verificationSchema = z.object({
  code: z.string().length(6),
});

export const withdrawSchema = z.object({
  toAddress: z.string().min(32),
  amount: z.number().positive(),
});

// Trading schema
export const tradeOrderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum(["buy", "sell"]),
  amount: z.number().positive(),
  price: z.number().positive(),
  status: z.enum(["pending", "filled", "cancelled"]),
  createdAt: z.string().datetime(),
});

export const createInsertProductSchema = productSchema.omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof createInsertProductSchema>;
export type Product = z.infer<typeof productSchema>;

export const createInsertAnalyticsSchema = analyticsSchema.omit({ id: true });
export type InsertAnalytics = z.infer<typeof createInsertAnalyticsSchema>;
export type Analytics = z.infer<typeof analyticsSchema>;

export const createInsertNotificationSchema = notificationSchema.omit({ id: true, createdAt: true });
export type InsertNotification = z.infer<typeof createInsertNotificationSchema>;
export type Notification = z.infer<typeof notificationSchema>;

export const createInsertTradeOrderSchema = tradeOrderSchema.omit({ id: true, createdAt: true });
export type InsertTradeOrder = z.infer<typeof createInsertTradeOrderSchema>;
export type TradeOrder = z.infer<typeof tradeOrderSchema>;
