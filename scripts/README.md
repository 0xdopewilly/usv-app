# QR Code Import Scripts

This directory contains scripts to clean old QR codes and import new ones into your database.

## 📋 Files

- `import-qr-codes.ts` - TypeScript script for automated import
- `import-qr-codes.sql` - SQL script for manual import
- `README.md` - This file

---

## 🚀 Quick Start

### Method 1: Using TypeScript Script (Recommended)

**For Development Database (Current Replit Database):**
```bash
# Make sure DATABASE_URL is already set (it should be)
tsx scripts/import-qr-codes.ts
```

**For Production Database:**
```bash
# Set your production database URL
export DATABASE_URL="postgresql://user:password@your-hetzner-server:5432/usvtoken"

# Run the script
tsx scripts/import-qr-codes.ts
```

### Method 2: Using SQL Script

**For Development Database (Replit):**
1. Open the Replit Database tab
2. Click on "SQL Console" or use the execute SQL tool
3. Copy and paste the contents of `import-qr-codes.sql`
4. Execute

**For Production Database:**
```bash
# SSH into your production server
ssh deploy@YOUR_HETZNER_IP

# Run the SQL script
psql -U usvuser -d usvtoken < /path/to/import-qr-codes.sql
```

---

## ⚠️ Important Notes

### Before Running

1. **BACKUP YOUR DATABASE** (Production only)
   ```bash
   pg_dump -U usvuser usvtoken > backup-$(date +%Y%m%d).sql
   ```

2. **This script will DELETE ALL existing QR codes**
   - Make sure you have a backup if you need the old data
   - The script completely replaces all QR codes

3. **Test on Development First**
   - Always test the import on your development database
   - Verify the QR codes work correctly
   - Then run on production

### What the Script Does

1. ✅ Connects to your database
2. 🗑️ Deletes ALL existing QR codes
3. 📥 Imports 10 new QR codes from the CSV file:
   - Code: USV-C3C0-7A2C-1C49, etc.
   - Product: new-token-ca
   - Token Reward: 1 token each
   - Status: Unclaimed, Active
4. ✅ Verifies the import was successful

---

## 📊 Expected Output

```
🔌 Connecting to database...
📍 Database: usvtoken

📄 Reading CSV file: attached_assets/usv-qr-codes-2025-10-21T15_16_24.582Z_1761059965133.csv
✅ Found 10 QR codes in CSV

🗑️  Deleting all existing QR codes...
✅ Deleted 15 old QR codes

📥 Importing new QR codes...
  ✓ USV-C3C0-7A2C-1C49 (1 tokens)
  ✓ USV-7C2D-58E2-CEAB (1 tokens)
  ✓ USV-8A3C-AEDF-5349 (1 tokens)
  ...

📊 Import Summary:
  ✅ Successfully imported: 10
  ❌ Failed: 0
  📦 Total processed: 10

🔍 Verifying import...
✅ Total QR codes in database: 10

✅ Import completed successfully! 🎉
```

---

## 🔍 Verify Import

After running the script, verify the QR codes were imported correctly:

```sql
-- Check total count
SELECT COUNT(*) FROM qr_codes;

-- View all QR codes
SELECT code, product_id, token_reward, claimed, is_active 
FROM qr_codes 
ORDER BY created_at DESC;

-- Check for a specific code
SELECT * FROM qr_codes WHERE code = 'USV-C3C0-7A2C-1C49';
```

---

## 🛠️ Troubleshooting

### Error: "DATABASE_URL environment variable not set"
```bash
# Make sure DATABASE_URL is set
echo $DATABASE_URL

# Set it if needed (Replit auto-sets this)
export DATABASE_URL="your_database_url_here"
```

### Error: "CSV file not found"
```bash
# Check if the CSV file exists
ls -la attached_assets/usv-qr-codes-2025-10-21T15_16_24.582Z_1761059965133.csv

# If missing, make sure you've uploaded it to the attached_assets folder
```

### Error: "Permission denied"
```bash
# Make the script executable
chmod +x scripts/import-qr-codes.ts
```

### Database Connection Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check if PostgreSQL is running (production server)
sudo systemctl status postgresql
```

---

## 📝 Adding More QR Codes Later

If you need to add more QR codes in the future:

1. **Export new codes to CSV** with the same format:
   ```
   Code,Product,Tokens,Claimed,Claimed By,TX Hash
   USV-XXXX-XXXX-XXXX,product-name,1,No,,
   ```

2. **Update the CSV file path** in `import-qr-codes.ts`:
   ```typescript
   const csvPath = path.join(__dirname, '../attached_assets/YOUR_NEW_FILE.csv');
   ```

3. **Run the script again** (it will replace all QR codes)

---

## 🔐 Security Notes

- **Never commit database URLs** to version control
- **Always backup before running** on production
- **Test on development first** before production
- **Keep CSV files secure** - they contain valid QR codes

---

## 📞 Support

If you encounter issues:
1. Check the error message carefully
2. Verify your database connection
3. Ensure the CSV file format is correct
4. Test on development database first
