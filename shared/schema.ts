import { z } from "zod";
import { pgTable, varchar, boolean, numeric, timestamp, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Drizzle table definitions (database schema)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  fullName: varchar("full_name").notNull(),
  password: varchar("password").notNull(),
  walletAddress: varchar("wallet_address"),
  balance: numeric("balance").default('0'),
  stakedBalance: numeric("staked_balance").default('0'),
  isVerified: boolean("is_verified").default(false),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  faceIdEnabled: boolean("face_id_enabled").default(false),
  pushNotifications: boolean("push_notifications").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  preferredLanguage: varchar("preferred_language").default('en'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(),
  amount: numeric("amount").notNull(),
  token: varchar("token").default('USV'),
  status: varchar("status").notNull(),
  toAddress: varchar("to_address"),
  fromAddress: varchar("from_address"),
  txHash: varchar("tx_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nfts = pgTable("nfts", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  tokenId: varchar("token_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  image: varchar("image").notNull(),
  collection: varchar("collection").notNull(),
  mintAddress: varchar("mint_address").notNull(),
  floorPrice: numeric("floor_price").notNull(),
  lastSalePrice: numeric("last_sale_price"),
  isStaked: boolean("is_staked").default(false),
  attributes: jsonb("attributes").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey(),
  code: varchar("code").notNull().unique(),
  storeId: varchar("store_id").notNull(),
  productId: varchar("product_id").notNull(),
  isActive: boolean("is_active").default(true),
  scannedBy: varchar("scanned_by"),
  scannedAt: timestamp("scanned_at"),
  claimedAt: timestamp("claimed_at"),
  tokenReward: numeric("token_reward").default('25'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vapeStores = pgTable("vape_stores", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  isPartner: boolean("is_partner").default(false),
  qrCodes: jsonb("qr_codes").default([]),
  phone: varchar("phone"),
  hours: varchar("hours"),
  rating: numeric("rating").default('4.5'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Generate Drizzle Zod schemas for type-safe validation
export const insertUserSchema = createInsertSchema(users);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertNFTSchema = createInsertSchema(nfts);
export const insertQRCodeSchema = createInsertSchema(qrCodes);
export const insertVapeStoreSchema = createInsertSchema(vapeStores);

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type NFT = typeof nfts.$inferSelect;
export type InsertNFT = typeof nfts.$inferInsert;
export type QRCode = typeof qrCodes.$inferSelect;
export type InsertQRCode = typeof qrCodes.$inferInsert;
export type VapeStore = typeof vapeStores.$inferSelect;
export type InsertVapeStore = typeof vapeStores.$inferInsert;

// Legacy Zod schemas (keeping for backward compatibility)
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
