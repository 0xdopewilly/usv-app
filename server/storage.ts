import { User, Transaction, NFT, QRCode, VapeStore, InsertUser, InsertTransaction, InsertNFT, InsertQRCode, InsertVapeStore } from '../shared/schema';

export interface IStorage {
  // User operations
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: string): Promise<Transaction[]>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>;
  
  // NFT operations
  createNFT(nft: InsertNFT): Promise<NFT>;
  getNFTsByUserId(userId: string): Promise<NFT[]>;
  getNFTById(id: string): Promise<NFT | null>;
  updateNFT(id: string, updates: Partial<NFT>): Promise<NFT>;
  
  // QR Code operations
  createQRCode(qrCode: InsertQRCode): Promise<QRCode>;
  getQRCodeByCode(code: string): Promise<QRCode | null>;
  updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode>;
  
  // Vape Store operations
  createVapeStore(store: InsertVapeStore): Promise<VapeStore>;
  getAllVapeStores(): Promise<VapeStore[]>;
  getVapeStoreById(id: string): Promise<VapeStore | null>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private nfts: Map<string, NFT> = new Map();
  private qrCodes: Map<string, QRCode> = new Map();
  private vapeStores: Map<string, VapeStore> = new Map();

  constructor() {
    // Initialize with sample vape stores
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    const sampleStores: InsertVapeStore[] = [
      {
        name: "Cloud Nine Vapes",
        address: "123 Main St, New York, NY 10001",
        latitude: 40.7128,
        longitude: -74.0060,
        isPartner: true,
        qrCodes: [],
      },
      {
        name: "Vapor Central",
        address: "456 Broadway, New York, NY 10013",
        latitude: 40.7209,
        longitude: -74.0007,
        isPartner: true,
        qrCodes: [],
      },
      {
        name: "Mist & Co",
        address: "789 5th Ave, New York, NY 10022",
        latitude: 40.7614,
        longitude: -73.9776,
        isPartner: false,
        qrCodes: [],
      }
    ];

    for (const store of sampleStores) {
      await this.createVapeStore(store);
    }

    // Create sample QR codes for the stores
    const storeIds = Array.from(this.vapeStores.keys());
    for (const storeId of storeIds) {
      for (let i = 1; i <= 5; i++) {
        await this.createQRCode({
          code: `STORE_${storeId}_PRODUCT_${i}`,
          storeId,
          productId: `PRODUCT_${i}`,
          isActive: true,
          tokenReward: 25,
        });
      }
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // User operations
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.generateId();
    const user: User = {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of Array.from(this.users.values())) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Transaction operations
  async createTransaction(transactionData: InsertTransaction): Promise<Transaction> {
    const id = this.generateId();
    const transaction: Transaction = {
      ...transactionData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionsByUserId(userId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) throw new Error('Transaction not found');
    
    const updatedTransaction = { ...transaction, ...updates };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // NFT operations
  async createNFT(nftData: InsertNFT): Promise<NFT> {
    const id = this.generateId();
    const nft: NFT = {
      ...nftData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.nfts.set(id, nft);
    return nft;
  }

  async getNFTsByUserId(userId: string): Promise<NFT[]> {
    return Array.from(this.nfts.values())
      .filter(nft => nft.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getNFTById(id: string): Promise<NFT | null> {
    return this.nfts.get(id) || null;
  }

  async updateNFT(id: string, updates: Partial<NFT>): Promise<NFT> {
    const nft = this.nfts.get(id);
    if (!nft) throw new Error('NFT not found');
    
    const updatedNFT = { ...nft, ...updates };
    this.nfts.set(id, updatedNFT);
    return updatedNFT;
  }

  // QR Code operations
  async createQRCode(qrCodeData: InsertQRCode): Promise<QRCode> {
    const id = this.generateId();
    const qrCode: QRCode = {
      ...qrCodeData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.qrCodes.set(id, qrCode);
    return qrCode;
  }

  async getQRCodeByCode(code: string): Promise<QRCode | null> {
    for (const qrCode of Array.from(this.qrCodes.values())) {
      if (qrCode.code === code) {
        return qrCode;
      }
    }
    return null;
  }

  async updateQRCode(id: string, updates: Partial<QRCode>): Promise<QRCode> {
    const qrCode = this.qrCodes.get(id);
    if (!qrCode) throw new Error('QR Code not found');
    
    const updatedQRCode = { ...qrCode, ...updates };
    this.qrCodes.set(id, updatedQRCode);
    return updatedQRCode;
  }

  // Vape Store operations
  async createVapeStore(storeData: InsertVapeStore): Promise<VapeStore> {
    const id = this.generateId();
    const store: VapeStore = {
      ...storeData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.vapeStores.set(id, store);
    return store;
  }

  async getAllVapeStores(): Promise<VapeStore[]> {
    return Array.from(this.vapeStores.values());
  }

  async getVapeStoreById(id: string): Promise<VapeStore | null> {
    return this.vapeStores.get(id) || null;
  }
}

export const storage = new MemStorage();
