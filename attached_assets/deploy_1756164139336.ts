import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { createUSVTokenClient, USVTokenClient } from '../app/src/usv-token';
import fs from 'fs';
import path from 'path';

// Configuration
const NETWORK = 'devnet'; // Change to 'mainnet-beta' for production
const RPC_URL = 'https://api.devnet.solana.com';
const COMMITMENT = 'confirmed';

async function main() {
  console.log('🚀 Starting USV Token deployment...');
  console.log(`📡 Network: ${NETWORK}`);
  console.log(`🌐 RPC URL: ${RPC_URL}`);
  
  // Setup connection
  const connection = new Connection(RPC_URL, COMMITMENT);
  
  // Load wallet
  const walletPath = path.join(process.env.HOME || '', '.config/solana/main-wallet.json');
  
  if (!fs.existsSync(walletPath)) {
    throw new Error(`Wallet file not found at ${walletPath}. Please run: solana-keygen new --outfile ${walletPath}`);
  }
  
  const walletKeypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(walletPath, 'utf8')))
  );
  
  console.log(`💰 Wallet address: ${walletKeypair.publicKey.toString()}`);
  
  // Check wallet balance
  const balance = await connection.getBalance(walletKeypair.publicKey);
  console.log(`💵 Wallet balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
  
  if (balance < 0.1 * anchor.web3.LAMPORTS_PER_SOL) {
    throw new Error('Insufficient SOL balance. Please airdrop some SOL to your wallet.');
  }
  
  // Create wallet instance
  const wallet = new anchor.Wallet(walletKeypair);
  
  // Build and deploy program
  console.log('\n🔨 Building program...');
  const { spawn } = require('child_process');
  
  const buildProcess = spawn('anchor', ['build'], { stdio: 'inherit' });
  
  await new Promise<void>((resolve, reject) => {
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Build completed successfully!');
        resolve();
      } else {
        reject(new Error(`Build failed with code ${code}`));
      }
    });
  });
  
  console.log('\n🚀 Deploying program...');
  const deployProcess = spawn('anchor', ['deploy'], { stdio: 'inherit' });
  
  let programId: string = '';
  
  await new Promise<void>((resolve, reject) => {
    deployProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Deploy completed successfully!');
        // Read the program ID from the generated IDL file
        try {
          const idlPath = path.join(__dirname, '../target/idl/usv_token.json');
          if (fs.existsSync(idlPath)) {
            const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
            programId = idl.metadata?.address || '';
            console.log(`📋 Program ID: ${programId}`);
          }
        } catch (error) {
          console.log('⚠️  Could not read program ID from IDL');
        }
        resolve();
      } else {
        reject(new Error(`Deploy failed with code ${code}`));
      }
    });
  });
  
  // If we couldn't get program ID from IDL, try to get it from Anchor.toml
  if (!programId) {
    try {
      const anchorTomlPath = path.join(__dirname, '../Anchor.toml');
      const anchorToml = fs.readFileSync(anchorTomlPath, 'utf8');
      const match = anchorToml.match(/usv_token = "([^"]+)"/);
      if (match) {
        programId = match[1];
        console.log(`📋 Program ID from Anchor.toml: ${programId}`);
      }
    } catch (error) {
      console.log('⚠️  Could not read program ID from Anchor.toml');
    }
  }
  
  if (!programId) {
    throw new Error('Could not determine program ID. Please check deployment logs.');
  }
  
  // Create client instance
  const client = createUSVTokenClient(connection, wallet, new PublicKey(programId));
  
  console.log('\n🔧 Initializing USV Token program...');
  
  try {
    const initTx = await client.initialize();
    console.log('✅ USV Token program initialized successfully!');
    console.log(`📋 Initialization transaction: ${initTx}`);
    
    // Wait for confirmation
    await connection.confirmTransaction(initTx, 'confirmed');
    console.log('✅ Transaction confirmed!');
    
    // Get initial stats
    console.log('\n📊 Getting initial program stats...');
    const stats = await client.getStats();
    
    console.log('\n🎉 Deployment Summary:');
    console.log('==========================================');
    console.log(`📋 Program ID: ${programId}`);
    console.log(`💰 Admin Wallet: ${walletKeypair.publicKey.toString()}`);
    console.log(`🏦 Token Mint: ${stats.mint}`);
    console.log(`📊 Total Supply: ${parseInt(stats.totalSupply).toLocaleString()} tokens`);
    console.log(`💵 Token Price: ${parseInt(stats.tokenPriceCents) / 100}`);
    console.log(`⏸️  Is Paused: ${stats.isPaused}`);
    console.log(`🎫 QR Codes Generated: ${stats.totalQrCodes}`);
    console.log(`🎁 Tokens Claimed: ${stats.tokensClaimed}`);
    console.log('==========================================');
    
    // Generate some test QR codes
    console.log('\n🎫 Generating test QR codes...');
    const testQRCodes = await client.generateQRCodes(5, 'TEST_PARTNER', 'DEPLOYMENT_TEST_BATCH');
    
    console.log('\n🎫 Test QR Codes generated:');
    testQRCodes.forEach((code, index) => {
      console.log(`${index + 1}. ${code}`);
    });
    
    // Test QR code info
    console.log('\n🔍 Testing QR code info retrieval...');
    const qrInfo = await client.getQRCodeInfo(testQRCodes[0]);
    console.log('QR Code Info:', {
      code: qrInfo.code,
      isClaimed: qrInfo.isClaimed,
      partnerId: qrInfo.partnerId,
      batchInfo: qrInfo.batchInfo,
      createdAt: qrInfo.createdAt.toISOString()
    });
    
    // Save deployment info
    const deploymentInfo = {
      network: NETWORK,
      programId: programId,
      adminWallet: walletKeypair.publicKey.toString(),
      tokenMint: stats.mint,
      deployedAt: new Date().toISOString(),
      testQRCodes: testQRCodes,
      transactionSignatures: {
        deploy: 'Check deployment logs',
        initialize: initTx
      }
    };
    
    const deploymentInfoPath = path.join(__dirname, '../deployment-info.json');
    fs.writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📁 Deployment info saved to: ${deploymentInfoPath}`);
    
    // Create environment file for frontend
    const envContent = `
# USV Token Smart Contract Configuration
# Generated on ${new Date().toISOString()}

# Network Configuration
REACT_APP_NETWORK=${NETWORK}
REACT_APP_RPC_URL=${RPC_URL}

# Program Information
REACT_APP_PROGRAM_ID=${programId}
REACT_APP_TOKEN_MINT=${stats.mint}
REACT_APP_ADMIN_WALLET=${walletKeypair.publicKey.toString()}

# Token Information
REACT_APP_TOKEN_NAME=Ultra Smooth Vape
REACT_APP_TOKEN_SYMBOL=USV
REACT_APP_TOKEN_DECIMALS=6
REACT_APP_TOTAL_SUPPLY=1000000000
REACT_APP_INITIAL_PRICE_CENTS=20

# Backend Integration
REACT_APP_BACKEND_URL=https://backend-api-y0ke.onrender.com
REACT_APP_CLAIM_NOTIFICATION_ENDPOINT=/api/notify-claim
REACT_APP_PARTNER_NOTIFICATION_ENDPOINT=/api/notify-partner

# IPFS/Metadata
REACT_APP_TOKEN_IMAGE=https://indigo-big-buzzard-911.mypinata.cloud/ipfs/bafkreiaqxvhoekn67pghw56pcmtwfduvdblrdisftd66gf3pzzsjulogli
REACT_APP_METADATA_URI=https://indigo-big-buzzard-911.mypinata.cloud/ipfs/bafkreiaqxvhoekn67pghw56pcmtwfduvdblrdisftd66gf3pzzsjulogli
`;
    
    const envPath = path.join(__dirname, '../.env.deployed');
    fs.writeFileSync(envPath, envContent.trim());
    console.log(`\n🌐 Environment file created: ${envPath}`);
    console.log('   Copy this to your frontend project as .env.local');
    
    console.log('\n✅ Deployment completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Save the Program ID and other details for your frontend');
    console.log('2. Update your backend with the new contract addresses');
    console.log('3. Test QR code claiming functionality');
    console.log('4. Set up partner airdrops if needed');
    console.log('5. Configure your frontend with the generated .env file');
    
    console.log('\n🎯 Quick Test Commands:');
    console.log('// Test claiming a QR code:');
    console.log(`// await client.claimTokens("${testQRCodes[0]}", "test@example.com");`);
    console.log('');
    console.log('// Check token balance:');
    console.log(`// await client.getTokenBalance(new PublicKey("${walletKeypair.publicKey.toString()}"));`);
    console.log('');
    console.log('// Generate more QR codes:');
    console.log('// await client.generateQRCodes(100, "PARTNER_ID", "BATCH_001");');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    
    if (error.message.includes('already in use')) {
      console.log('\n💡 The program might already be initialized.');
      console.log('   Trying to get current stats...');
      
      try {
        const stats = await client.getStats();
        console.log('✅ Program is already initialized!');
        console.log('Current stats:', stats);
      } catch (statsError) {
        console.error('❌ Could not get stats:', statsError);
      }
    }
    
    throw error;
  }
}

// Error handling wrapper
async function deploy() {
  try {
    await main();
  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Make sure you have enough SOL in your wallet');
    console.error('2. Check that Anchor CLI is installed and updated');
    console.error('3. Verify your RPC connection is working');
    console.error('4. Ensure your wallet file exists and is readable');
    console.error('5. Try running "anchor clean" and rebuild');
    
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Deployment interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Deployment terminated');
  process.exit(0);
});

// Run deployment
if (require.main === module) {
  deploy();
}

export default deploy;