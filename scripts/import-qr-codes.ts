/**
 * QR Code Import Script
 * 
 * This script:
 * 1. Deletes all existing QR codes from the database
 * 2. Imports new QR codes from the CSV file
 * 
 * Usage:
 *   tsx scripts/import-qr-codes.ts
 */

import { Pool } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Parse CSV file
function parseCSV(filePath: string): Array<{
  code: string;
  product: string;
  tokens: number;
  claimed: boolean;
  claimedBy: string | null;
  txHash: string | null;
}> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data: Array<{
    code: string;
    product: string;
    tokens: number;
    claimed: boolean;
    claimedBy: string | null;
    txHash: string | null;
  }> = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    data.push({
      code: values[0].trim(),
      product: values[1].trim(),
      tokens: parseFloat(values[2].trim()),
      claimed: values[3].trim().toLowerCase() === 'yes',
      claimedBy: values[4]?.trim() || null,
      txHash: values[5]?.trim() || null,
    });
  }
  
  return data;
}

async function importQRCodes() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable not set');
    console.log('\nPlease set your production database URL:');
    console.log('export DATABASE_URL="postgresql://user:password@host:port/database"');
    process.exit(1);
  }
  
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    console.log('🔌 Connecting to database...');
    console.log(`📍 Database: ${databaseUrl.split('@')[1]?.split('/')[1] || 'unknown'}`);
    
    // Parse CSV
    const csvPath = path.join(__dirname, '../attached_assets/usv-qr-codes-2025-10-21T15_16_24.582Z_1761059965133.csv');
    console.log(`\n📄 Reading CSV file: ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ ERROR: CSV file not found at ${csvPath}`);
      process.exit(1);
    }
    
    const qrCodesData = parseCSV(csvPath);
    console.log(`✅ Found ${qrCodesData.length} QR codes in CSV`);
    
    // Step 1: Delete all existing QR codes
    console.log('\n🗑️  Deleting all existing QR codes...');
    const deleteResult = await pool.query('DELETE FROM qr_codes');
    console.log(`✅ Deleted ${deleteResult.rowCount || 0} old QR codes`);
    
    // Step 2: Insert new QR codes
    console.log('\n📥 Importing new QR codes...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const qr of qrCodesData) {
      try {
        await pool.query(
          `INSERT INTO qr_codes (code, product_id, token_reward, claimed, claimed_by, tx_hash, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            qr.code,
            qr.product,
            qr.tokens,
            qr.claimed,
            qr.claimedBy,
            qr.txHash,
            true
          ]
        );
        successCount++;
        console.log(`  ✓ ${qr.code} (${qr.tokens} tokens)`);
      } catch (error: any) {
        errorCount++;
        console.error(`  ✗ ${qr.code} - Error: ${error.message}`);
      }
    }
    
    console.log('\n📊 Import Summary:');
    console.log(`  ✅ Successfully imported: ${successCount}`);
    console.log(`  ❌ Failed: ${errorCount}`);
    console.log(`  📦 Total processed: ${qrCodesData.length}`);
    
    // Verify import
    console.log('\n🔍 Verifying import...');
    const verifyResult = await pool.query('SELECT COUNT(*) as count FROM qr_codes');
    const totalInDb = verifyResult.rows[0]?.count || 0;
    console.log(`✅ Total QR codes in database: ${totalInDb}`);
    
    if (parseInt(totalInDb) === successCount) {
      console.log('\n✅ Import completed successfully! 🎉');
    } else {
      console.log('\n⚠️  Warning: Database count does not match import count');
    }
    
  } catch (error: any) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the import
importQRCodes();
