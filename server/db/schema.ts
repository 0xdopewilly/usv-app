import { pgTable, text, varchar, boolean, numeric, timestamp, serial, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  walletAddress: varchar('wallet_address', { length: 255 }),
  balance: numeric('balance', { precision: 18, scale: 6 }).default('0'),
  stakedBalance: numeric('staked_balance', { precision: 18, scale: 6 }).default('0'),
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
  amount: numeric('amount', { precision: 18, scale: 6 }).notNull(),
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
  floorPrice: numeric('floor_price', { precision: 18, scale: 6 }),
  lastSalePrice: numeric('last_sale_price', { precision: 18, scale: 6 }),
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
  claimedBy: varchar('claimed_by', { length: 255 }),
  claimedAt: timestamp('claimed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Vape Stores table
export const vapeStores = pgTable('vape_stores', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  address: varchar('address', { length: 500 }).notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: numeric('longitude', { precision: 11, scale: 8 }).notNull(),
  isPartner: boolean('is_partner').default(false),
  qrCodes: json('qr_codes').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow(),
});