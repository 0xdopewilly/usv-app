# Deploying USV App to Hetzner Server

## Server Details
- IP: 5.78.94.61
- User: root
- Port: 5000 (app) / 80,443 (web)

## Step 1: Connect to Your Server

```bash
ssh root@5.78.94.61
# Enter password: rMcPjdUvWXJm
```

## Step 2: Install Required Software

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs npm

# Install Git
apt install -y git

# Install Nginx (web server)
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

## Step 3: Clone Your Repository

```bash
cd /var/www
git clone <YOUR_GITHUB_REPO_URL> usv-app
cd usv-app
npm install
```

*Note: Replace `<YOUR_GITHUB_REPO_URL>` with your actual repository URL*

## Step 4: Set Up Environment Variables

```bash
cat > /var/www/usv-app/.env << 'ENVFILE'
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/dbname
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
SOLANA_NETWORK=mainnet-beta
USV_TOKEN_MINT_ADDRESS=8bLH2ZzpUxvYtssoXSKk5zJPm2Gj1rMZuGmnMfkoRPh
COMPANY_WALLET_PRIVATE_KEY=your_private_key_here
HELIUS_API_KEY=your_helius_api_key
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
ENVFILE
```

**Important**: Fill in actual values for:
- DATABASE_URL
- OPENAI_API_KEY
- COMPANY_WALLET_PRIVATE_KEY
- HELIUS_API_KEY

## Step 5: Build for Production

```bash
cd /var/www/usv-app
npm run build
```

This creates an optimized production build.

## Step 6: Start App with PM2

```bash
pm2 start "npm run start" --name "usv-app"
pm2 startup
pm2 save
```

Check if running:
```bash
pm2 status
pm2 logs usv-app
```

## Step 7: Configure Nginx Reverse Proxy

```bash
# Remove default config
rm /etc/nginx/sites-enabled/default

# Create new config
cat > /etc/nginx/sites-available/usv-app << 'NGINX'
server {
    listen 80;
    server_name 5.78.94.61;
    client_max_body_size 100M;

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
        proxy_redirect off;
    }
}
NGINX

# Enable site
ln -s /etc/nginx/sites-available/usv-app /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx
```

## Step 8: Verify Everything Works

```bash
# Check if Node app is running
pm2 status

# Check if Nginx is running
systemctl status nginx

# Test the endpoint
curl http://localhost:5000
curl http://5.78.94.61

# View app logs
pm2 logs usv-app
```

Your app is now live at: **http://5.78.94.61**

---

## Step 9: Setup SSL Certificate (HTTPS) - Optional but Recommended

```bash
apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain if you have one)
certbot --nginx -d yourdomain.com
```

---

## Useful Commands for Management

```bash
# View logs
pm2 logs usv-app

# Restart app
pm2 restart usv-app

# Stop app
pm2 stop usv-app

# Monitor resources
pm2 monit

# Update app (pull latest code)
cd /var/www/usv-app
git pull
npm install
npm run build
pm2 restart usv-app
```

---

## CRITICAL SECURITY NOTES ⚠️

1. **Change Root Password Immediately**
   ```bash
   passwd
   ```

2. **Add Firewall Rules**
   ```bash
   apt install -y ufw
   ufw allow 22/tcp    # SSH
   ufw allow 80/tcp    # HTTP
   ufw allow 443/tcp   # HTTPS
   ufw enable
   ```

3. **Never commit `.env` file to Git** - keep secrets secure

4. **Set up regular backups** of your database

5. **Monitor server resources**
   ```bash
   top
   df -h
   ```

---

## Troubleshooting

**App not loading?**
```bash
pm2 logs usv-app
pm2 status
curl http://localhost:5000
```

**Port 5000 already in use?**
```bash
lsof -i :5000
kill -9 <PID>
```

**Nginx config error?**
```bash
nginx -t
systemctl restart nginx
```

---

Good luck! Your USV app will be live on Hetzner! 🚀
