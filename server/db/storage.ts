import { eq } from 'drizzle-orm';
import { db } from './connection';
import { users, transactions, nfts, qrCodes, vapeStores } from './schema';
import { User, Transaction, NFT, QRCode, VapeStore, InsertUser, InsertTransaction, InsertNFT, InsertQRCode, InsertVapeStore } from '../../shared/schema';
import { IStorage } from '../storage';

export class DatabaseStorage implements IStorage {
  // User operations
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      email: userData.email,
      fullName: userData.fullName,
      password: userData.password,
      walletAddress: userData.walletAddress,
      balance: userData.balance?.toString() || '0',
      stakedBalance: userData.stakedBalance?.toString() || '0',
      isVerified: userData.isVerified,
      twoFactorEnabled: userData.twoFactorEnabled,
      faceIdEnabled: userData.faceIdEnabled,
      pushNotifications: userData.pushNotifications,
      emailNotifications: userData.emailNotifications,
      preferredLanguage: userData.preferredLanguage,
    }).returning();

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      password: user.password,
      walletAddress: user.walletAddress || undefined,
      balance: parseFloat(user.balance || '0'),
      stakedBalance: parseFloat(user.stakedBalance || '0'),
      isVerified: user.isVerified || false,
      twoFactorEnabled: user.twoFactorEnabled || false,
      faceIdEnabled: user.faceIdEnabled || false,
      pushNotifications: user.pushNotifications ?? true,
      emailNotifications: user.emailNotifications ?? true,
      preferredLanguage: user.preferredLanguage || 'en',
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      password: user.password,
      walletAddress: user.walletAddress || undefined,
      balance: parseFloat(user.balance || '0'),
      stakedBalance: parseFloat(user.stakedBalance || '0'),
      isVerified: user.isVerified || false,
      twoFactorEnabled: user.twoFactorEnabled || false,
      faceIdEnabled: user.faceIdEnabled || false,
      pushNotifications: user.pushNotifications ?? true,
      emailNotifications: user.emailNotifications ?? true,
      preferredLanguage: user.preferredLanguage || 'en',
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      password: user.password,
      walletAddress: user.walletAddress || undefined,
      balance: parseFloat(user.balance || '0'),
      stakedBalance: parseFloat(user.stakedBalance || '0'),
      isVerified: user.isVerified || false,
      twoFactorEnabled: user.twoFactorEnabled || false,
      faceIdEnabled: user.faceIdEnabled || false,
      pushNotifications: user.pushNotifications ?? true,
      emailNotifications: user.emailNotifications ?? true,
      preferredLanguage: user.preferredLanguage || 'en',
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  async getUserByWallet(walletAddress: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      password: user.password,
      walletAddress: user.walletAddress || undefined,
      balance: parseFloat(user.balance || '0'),
      stakedBalance: parseFloat(user.stakedBalance || '0'),
      isVerified: user.isVerified || false,
      twoFactorEnabled: user.twoFactorEnabled || false,
      faceIdEnabled: user.faceIdEnabled || false,
      pushNotifications: user.pushNotifications ?? true,
      emailNotifications: user.emailNotifications ?? true,
      preferredLanguage: user.preferredLanguage || 'en',
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const updateData: any = {};
    
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.fullName !== undefined) updateData.fullName = updates.fullName;
    if (updates.password !== undefined) updateData.password = updates.password;
    if (updates.walletAddress !== undefined) updateData.walletAddress = updates.walletAddress;
    if (updates.balance !== undefined) updateData.balance = updates.balance.toString();
    if (updates.stakedBalance !== undefined) updateData.stakedBalance = updates.stakedBalance.toString();
    if (updates.isVerified !== undefined) updateData.isVerified = updates.isVerified;
    if (updates.twoFactorEnabled !== undefined) updateData.twoFactorEnabled = updates.twoFactorEnabled;
    if (updates.faceIdEnabled !== undefined) updateData.faceIdEnabled = updates.faceIdEnabled;
    if (updates.pushNotifications !== undefined) updateData.pushNotifications = updates.pushNotifications;
    if (updates.emailNotifications !== undefined) updateData.emailNotifications = updates.emailNotifications;
    if (updates.preferredLanguage !== undefined) updateData.preferredLanguage = updates.preferredLanguage;

    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      password: user.password,
      walletAddress: user.walletAddress || undefined,
      balance: parseFloat(user.balance || '0'),
      stakedBalance: parseFloat(user.stakedBalance || '0'),
      isVerified: user.isVerified || false,
      twoFactorEnabled: user.twoFactorEnabled || false,
      faceIdEnabled: user.faceIdEnabled || false,
      pushNotifications: user.pushNotifications ?? true,
      emailNotifications: user.emailNotifications ?? true,
      preferredLanguage: user.preferredLanguage || 'en',
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    };
  }

  // Simplified stub implementations for other methods
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    throw new Error('Method not implemented yet');
  }
  
  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return [];
  }
  
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    throw new Error('Method not implemented yet');
  }
  
  async createNFT(nft: InsertNFT): Promise<NFT> {
    throw new Error('Method not implemented yet');
  }
  
  async getNFTsByUserId(userId: string): Promise<NFT[]> {
    return [];
  }
  
  async getNFTById(id: string): Promise<NFT | null> {
    return null;
  }
  
  async updateNFT(id: string, updates: Partial<NFT>): Promise<NFT> {
    throw new Error('Method not implemented yet');
  }
  
  async createQRCode(qrCode: InsertQRCode): Promise<QRCode> {
    throw new Error('Method not implemented yet');
  }
  
  async getQRCode(code: string): Promise<QRCode | null> {
    return null;
  }
  
  async getQRCodeByCode(code: string): Promise<QRCode | null> {
    return null;
  }
  
  async updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode> {
    throw new Error('Method not implemented yet');
  }
  
  async createVapeStore(store: InsertVapeStore): Promise<VapeStore> {
    throw new Error('Method not implemented yet');
  }
  
  async getAllVapeStores(): Promise<VapeStore[]> {
    return [];
  }
  
  async getVapeStoreById(id: string): Promise<VapeStore | null> {
    return null;
  }
}