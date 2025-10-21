# Hetzner Cloud Deployment Guide for USV Token App

Complete guide to deploy your USV Token application (Node.js/Express backend + React frontend + PostgreSQL database) to Hetzner Cloud VPS.

---

## 💰 Recommended Plan

**CPX21** - €8.46/month (~$9 USD)
- 3 vCPUs (AMD EPYC)
- 4 GB RAM
- 80 GB SSD
- 20 TB traffic
- **Perfect for Node.js + React + PostgreSQL app**

Or start with:
**CPX11** - €4.51/month (~$5 USD)
- 2 vCPUs
- 2 GB RAM
- 40 GB SSD
- Great for testing, can upgrade later

---

## Step 1: Create Hetzner Server

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Create new project → "Add Server"
3. **Location:** Nuremberg, Germany (or Helsinki, Finland)
4. **Image:** Ubuntu 22.04 LTS
5. **Type:** CPX21 (or CPX11 to start)
6. **SSH Key:** Add your public key (or use password)
7. Click "Create & Buy"

You'll get an IP address - save it!

---

## Step 2: Initial Server Setup

```bash
# SSH into your server
ssh root@YOUR_HETZNER_IP

# Update system
apt update && apt upgrade -y

# Create a non-root user
adduser deploy
usermod -aG sudo deploy
su - deploy

# Setup firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Step 3: Install Node.js

```bash
# Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash
source ~/.bashrc

# Install Node.js 20 LTS
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x
npm --version
```

---

## Step 4: Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE usvtoken;
CREATE USER usvuser WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE usvtoken TO usvuser;
\q

# Test connection
psql -U usvuser -d usvtoken -h localhost
# Enter password when prompted
```

---

## Step 5: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
pm2 --version
```

---

## Step 6: Deploy Your Application

```bash
# Create app directory
sudo mkdir -p /var/www/usvtoken
sudo chown -R deploy:deploy /var/www/usvtoken
cd /var/www/usvtoken

# Clone your repository (or use SCP/FTP to upload)
git clone YOUR_GITHUB_REPO_URL .

# Install dependencies
npm install

# Build React frontend
npm run build
```

---

## Step 7: Setup Environment Variables

```bash
# Create .env file
nano .env
```

Add your production environment variables:

```env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://usvuser:your_secure_password@localhost:5432/usvtoken

# Solana Configuration
COMPANY_WALLET_PRIVATE_KEY=your_private_key_here
HELIUS_API_KEY=your_helius_key_here
SOLANA_NETWORK=mainnet-beta
USV_TOKEN_MINT_ADDRESS=8bLH2ZzpUxvYtssoXSKk5zJPm2Gj1rjMZuGmnMfkoRPh

# JWT Secret
JWT_SECRET=generate_a_strong_random_string_here
```

```bash
# Secure the .env file
chmod 600 .env
```

---

## Step 8: Database Migration

```bash
# Push database schema
npm run db:push

# If you need to migrate data from Replit:
# On Replit, export: pg_dump $DATABASE_URL > backup.sql
# Transfer backup.sql to Hetzner server
# On Hetzner: psql -U usvuser -d usvtoken < backup.sql
```

---

## Step 9: Start App with PM2

```bash
cd /var/www/usvtoken

# Create PM2 ecosystem file
nano ecosystem.config.js
```

Add this configuration:

```javascript
module.exports = {
  apps: [{
    name: 'usvtoken',
    script: 'server/index.js',
    instances: 2,  // Use 2 instances for 2 CPU cores
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
};
```

```bash
# Create logs directory
mkdir -p logs

# Start the app
pm2 start ecosystem.config.js --env production

# Check status
pm2 status
pm2 logs usvtoken

# Setup PM2 to start on boot
pm2 startup
# Run the command PM2 shows you
pm2 save
```

---

## Step 10: Install and Configure Nginx

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/usvtoken
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Increase body size for file uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support (if needed)
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/usvtoken /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## Step 11: Setup SSL with Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (choose yes)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## Step 12: Setup Your Domain

In your domain registrar (GoDaddy, Namecheap, etc.), add these DNS records:

```
Type    Name    Value               TTL
A       @       YOUR_HETZNER_IP     3600
A       www     YOUR_HETZNER_IP     3600
```

Wait 5-60 minutes for DNS propagation.

---

## 🔄 Deploying Updates

```bash
# SSH into your server
ssh deploy@YOUR_HETZNER_IP
cd /var/www/usvtoken

# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Rebuild frontend
npm run build

# Push database changes (if schema changed)
npm run db:push

# Reload app with zero downtime
pm2 reload usvtoken
```

---

## 📊 Monitoring Commands

```bash
# View app logs
pm2 logs usvtoken

# Monitor in real-time
pm2 monit

# Check app status
pm2 status

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check database
psql -U usvuser -d usvtoken

# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top
```

---

## 💰 Total Cost Breakdown

- **Hetzner CPX21:** €8.46/month (~$9 USD)
- **Domain:** ~$12/year (~$1/month)
- **SSL Certificate:** Free (Let's Encrypt)
- **Total:** ~$10/month

**vs. Render:** ~$21/month  
**Savings:** ~$11/month or $132/year

---

## 🛡️ Security Best Practices

```bash
# Enable automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Setup fail2ban (prevents brute force attacks)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban

# Regular backups
# Setup automated PostgreSQL backups
crontab -e
# Add this line to backup daily at 2 AM:
# 0 2 * * * pg_dump -U usvuser usvtoken > /home/deploy/backups/usvtoken-$(date +\%Y\%m\%d).sql

# Create backup directory
mkdir -p /home/deploy/backups
```

---

## 🚨 Common Issues & Solutions

### Can't connect to server:
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if PM2 app is running
pm2 status

# Restart Nginx
sudo systemctl restart nginx

# Restart app
pm2 restart usvtoken
```

### Database connection errors:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U usvuser -d usvtoken -h localhost

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### App crashes:
```bash
# Check PM2 logs
pm2 logs usvtoken --err

# Restart app
pm2 restart usvtoken

# Check error logs
cat /var/www/usvtoken/logs/error.log
```

### Port already in use:
```bash
# Find what's using port 5000
sudo netstat -tlnp | grep :5000

# Kill the process if needed
sudo kill -9 PROCESS_ID
```

### Permission issues:
```bash
# Fix ownership
sudo chown -R deploy:deploy /var/www/usvtoken

# Fix .env permissions
chmod 600 /var/www/usvtoken/.env
```

---

## 📋 Production Checklist

Before going live, ensure:

- ✅ Set `NODE_ENV=production`
- ✅ Use environment variables for all secrets (.env)
- ✅ Enable PM2 clustering
- ✅ Setup PM2 auto-restart (`pm2 startup`)
- ✅ Configure Nginx reverse proxy
- ✅ Enable SSL with Let's Encrypt
- ✅ Setup firewall (UFW)
- ✅ Setup automated database backups
- ✅ Configure log rotation
- ✅ Enable security updates
- ✅ Setup monitoring (pm2 monit)
- ✅ Test all app features in production
- ✅ Setup domain DNS records
- ✅ Verify SSL certificate works

---

## 🔐 Environment Variables Reference

Your `.env` file should contain:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://usvuser:PASSWORD@localhost:5432/usvtoken

# Solana (Official USV Token Contract)
COMPANY_WALLET_PRIVATE_KEY=your_private_key
HELIUS_API_KEY=your_helius_key
SOLANA_NETWORK=mainnet-beta
USV_TOKEN_MINT_ADDRESS=8bLH2ZzpUxvYtssoXSKk5zJPm2Gj1rjMZuGmnMfkoRPh

# Authentication
JWT_SECRET=generate_strong_random_string
```

---

## 📚 Useful PM2 Commands

```bash
pm2 list                    # List all processes
pm2 restart usvtoken        # Restart app
pm2 reload usvtoken         # Zero-downtime reload
pm2 stop usvtoken           # Stop app
pm2 delete usvtoken         # Remove from PM2
pm2 logs usvtoken           # View logs
pm2 logs usvtoken --err     # View error logs only
pm2 monit                   # Live monitoring
pm2 save                    # Save current process list
pm2 resurrect               # Restore saved processes
pm2 flush                   # Clear logs
```

---

## 📞 Support Resources

- **Hetzner Docs:** https://docs.hetzner.com/
- **PM2 Documentation:** https://pm2.keymetrics.io/
- **Nginx Documentation:** https://nginx.org/en/docs/
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **Let's Encrypt:** https://letsencrypt.org/

---

## 🎯 Next Steps After Deployment

1. Monitor app performance with `pm2 monit`
2. Setup automated backups (daily)
3. Configure monitoring alerts
4. Setup staging environment (optional)
5. Document your deployment process
6. Create deployment scripts for faster updates
7. Consider setting up CI/CD pipeline

---

**Good luck with your deployment! 🚀**
