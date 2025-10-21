-- QR Code Import SQL Script
-- This script cleans old QR codes and inserts new ones
-- 
-- USAGE FOR PRODUCTION DATABASE:
--   psql YOUR_PRODUCTION_DATABASE_URL < scripts/import-qr-codes.sql
--
-- USAGE FOR DEVELOPMENT DATABASE (Replit):
--   Copy and paste this into the Replit database SQL console
--

-- Step 1: Delete all existing QR codes
DELETE FROM qr_codes;

-- Step 2: Insert new QR codes from CSV
INSERT INTO qr_codes (code, product_id, token_reward, claimed, is_active) VALUES
('USV-C3C0-7A2C-1C49', 'new-token-ca', 1, false, true),
('USV-7C2D-58E2-CEAB', 'new-token-ca', 1, false, true),
('USV-8A3C-AEDF-5349', 'new-token-ca', 1, false, true),
('USV-7E7C-9DD7-10DD', 'new-token-ca', 1, false, true),
('USV-13EA-FE51-EAC2', 'new-token-ca', 1, false, true),
('USV-85D2-4A77-9108', 'new-token-ca', 1, false, true),
('USV-BE1D-0F52-FA53', 'new-token-ca', 1, false, true),
('USV-5DA0-8759-952D', 'new-token-ca', 1, false, true),
('USV-3F46-8E02-734A', 'new-token-ca', 1, false, true),
('USV-42FD-190B-6BE3', 'new-token-ca', 1, false, true);

-- Step 3: Verify the import
SELECT COUNT(*) as total_qr_codes FROM qr_codes;
SELECT * FROM qr_codes ORDER BY created_at DESC LIMIT 10;
