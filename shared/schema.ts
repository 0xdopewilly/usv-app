import { z } from "zod";
import { pgTable, varchar, boolean, numeric, timestamp, text, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

// Main Drizzle table definitions (database schema)
// Users table
export const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  walletAddress: varchar('wallet_address', { length: 255 }),
  walletPrivateKey: text('wallet_private_key'), // Encrypted private key for custodial wallet
  profilePicture: text('profile_picture'),
  balance: real('balance').default(0),
  stakedBalance: real('staked_balance').default(0),
  isVerified: boolean('is_verified').default(false),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  faceIdEnabled: boolean('face_id_enabled').default(false),
  pushNotifications: boolean('push_notifications').default(true),
  emailNotifications: boolean('email_notifications').default(true),
  preferredLanguage: varchar('preferred_language', { length: 10 }).default('en'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Transactions table
export const transactions = pgTable('transactions', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  amount: real('amount').notNull(),
  token: varchar('token', { length: 50 }).default('USV'),
  status: varchar('status', { length: 50 }).notNull(),
  toAddress: varchar('to_address', { length: 255 }),
  fromAddress: varchar('from_address', { length: 255 }),
  txHash: varchar('tx_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// NFTs table
export const nfts = pgTable('nfts', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull(),
  tokenId: varchar('token_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  image: varchar('image', { length: 500 }),
  collection: varchar('collection', { length: 255 }),
  mintAddress: varchar('mint_address', { length: 255 }),
  floorPrice: real('floor_price'),
  lastSalePrice: real('last_sale_price'),
  isStaked: boolean('is_staked').default(false),
  attributes: json('attributes').$type<Array<{trait_type: string, value: string}>>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});

// QR Codes table
export const qrCodes = pgTable('qr_codes', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  code: varchar('code', { length: 255 }).notNull().unique(),
  storeId: varchar('store_id', { length: 255 }).notNull(),
  productId: varchar('product_id', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true),
  scannedBy: varchar('scanned_by', { length: 255 }),
  scannedAt: timestamp('scanned_at'),
  claimedBy: varchar('claimed_by', { length: 255 }),
  claimedAt: timestamp('claimed_at'),
  tokenReward: real('token_reward').default(25),
  createdAt: timestamp('created_at').defaultNow(),
});

// Vape Stores table
export const vapeStores = pgTable('vape_stores', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 500 }).notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  isPartner: boolean('is_partner').default(false),
  qrCodes: json('qr_codes').$type<string[]>().default([]),
  phone: varchar('phone', { length: 50 }),
  hours: varchar('hours', { length: 255 }),
  rating: real('rating').default(4.5),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table (for product catalog)
export const products = pgTable('products', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: real('price').notNull(),
  category: varchar('category', { length: 50 }).notNull(), // pods, devices, accessories, ejuice
  image: varchar('image', { length: 500 }),
  inStock: boolean('in_stock').default(true),
  tokenReward: real('token_reward').default(25),
  createdAt: timestamp('created_at').defaultNow(),
});

// Analytics table
export const analytics = pgTable('analytics', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull(),
  action: varchar('action', { length: 50 }).notNull(), // claim, stake, unstake, scan, trade
  amount: real('amount'),
  metadata: json('metadata').$type<Record<string, any>>(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // reward, trade, security, general
  isRead: boolean('is_read').default(false),
  actionUrl: varchar('action_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Trade Orders table
export const tradeOrders = pgTable('trade_orders', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 10 }).notNull(), // buy, sell
  amount: real('amount').notNull(),
  price: real('price').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // pending, filled, cancelled
  createdAt: timestamp('created_at').defaultNow(),
});

// Generate Drizzle Zod schemas for type-safe validation
export const insertUserSchema = createInsertSchema(users);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertNFTSchema = createInsertSchema(nfts);
export const insertQRCodeSchema = createInsertSchema(qrCodes);
export const insertVapeStoreSchema = createInsertSchema(vapeStores);
export const insertProductSchema = createInsertSchema(products);
export const insertAnalyticsSchema = createInsertSchema(analytics);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertTradeOrderSchema = createInsertSchema(tradeOrders);

// TypeScript types from Drizzle
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
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type TradeOrder = typeof tradeOrders.$inferSelect;
export type InsertTradeOrder = typeof tradeOrders.$inferInsert;

// Auth schemas (pure Zod - not database tables)
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