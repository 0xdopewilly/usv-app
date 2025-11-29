# USV Token - Ultra Smooth Vape Ecosystem 🍃

A comprehensive Progressive Web Application (PWA) for the USV Token ecosystem, featuring blockchain-based rewards, NFT authentication, QR code claiming, and vape store partnerships.

## Features

### 🔐 Blockchain Integration
- **Solana Wallet Support** - Connect Phantom and other Solana wallets
- **USV Token Contract** - `8bLH2ZzpUxvYtssoXSKk5zJPm2Gj1rMZuGmnMfkoRPh`
- **Real-time Price Charts** - Live Solana/USV pricing from CoinGecko API
- **Secure Transactions** - JWT-based authentication with bcrypt hashing

### 📱 Mobile-First PWA
- **Offline Support** - Service worker for offline functionality
- **Installable** - Works like a native app on iOS and Android
- **Responsive Design** - Optimized for phones, tablets, and desktops
- **Dark/Light Mode** - Full theme switching with localStorage persistence

### 🎫 QR Code System
- **Claim Tokens** - Scan QR codes to earn USV tokens instantly
- **Real Blockchain Transfers** - Direct SPL token transfers to wallet
- **Webhook Integration** - Real-time notifications to external systems
- **Product Verification** - Authenticate PURE5 vape products

### 🗺️ Store Locator
- **Interactive Map** - Leaflet-based mapping with OpenStreetMap
- **Partner Directory** - Find nearby USV partner vape stores
- **Distance Calculation** - Real-time distance from user location
- **Contact Integration** - Call, email, or get directions to stores

### 🤖 AI Chatbot
- **OpenAI Integration** - Powered by GPT-4
- **Product Knowledge** - Trained on PURE5 Hash Resin 25-strain catalog
- **Floating Widget** - Mobile-responsive chat interface
- **Smart Responses** - Context-aware product recommendations

### 🌍 Full Internationalization
- **Multi-Language Support** - English, Spanish, and French
- **Automatic Detection** - Browser language preference detection
- **Complete UI Translation** - All app pages and components translated

### 📊 User Dashboard
- **Wallet Management** - View USV token balance and transaction history
- **Portfolio Tracking** - Monitor NFT collections
- **Earnings History** - See all earned tokens and rewards
- **Settings & Security** - Passcode protection and preferences

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** + **shadcn/ui** - Beautiful, accessible components
- **Framer Motion** - Smooth animations
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **Leaflet** - Interactive maps

### Backend
- **Express.js** - RESTful API server
- **PostgreSQL** - Database with Neon
- **Drizzle ORM** - Type-safe database toolkit
- **JWT** - Secure authentication
- **bcrypt** - Password hashing
- **OpenAI API** - AI chatbot

### Blockchain
- **Solana Web3.js** - Blockchain interactions
- **SPL Token** - Token operations
- **Anchor Framework** - Smart contracts
- **Metaplex** - NFT utilities

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL database
- API keys for:
  - OpenAI (chatbot)
  - Helius (Solana RPC)
  - Replit Secrets (credentials)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/usv-app.git
cd usv-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Visit `http://localhost:5000` in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## Deployment

### Replit (Quick Start)
The app is configured to run on Replit with automatic deployments.

### Hetzner Server
See `HETZNER_DEPLOYMENT.md` for complete deployment guide to self-hosted server.

### Docker (Coming Soon)
Dockerfile configuration for containerized deployment.

## Project Structure

```
usv-app/
├── client/
│   ├── src/
│   │   ├── pages/          # React pages
│   │   ├── components/     # Reusable components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   └── App.tsx         # Main app component
│   ├── public/             # Static assets
│   └── index.html          # HTML entry point
├── server/
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Database interface
│   ├── vite.ts             # Vite integration
│   └── index.ts            # Express server
├── shared/
│   └── schema.ts           # Database schemas
├── package.json            # Dependencies
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create account
- `POST /api/auth/logout` - Sign out

### QR Code Claiming
- `POST /api/qr/claim` - Claim tokens via QR code

### Stores
- `GET /api/stores` - List all partner stores
- `GET /api/stores/:id` - Get store details

### Wallet
- `GET /api/wallet/balance` - User's USV balance
- `GET /api/wallet/transactions` - Transaction history

### Webhooks
- `POST /api/webhooks` - Register webhook
- `GET /api/webhooks` - List webhooks
- `DELETE /api/webhooks/:id` - Remove webhook

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host/dbname

# Blockchain
SOLANA_NETWORK=mainnet-beta
USV_TOKEN_MINT_ADDRESS=8bLH2ZzpUxvYtssoXSKk5zJPm2Gj1rMZuGmnMfkoRPh
COMPANY_WALLET_PRIVATE_KEY=your_private_key

# APIs
OPENAI_API_KEY=sk-...
HELIUS_API_KEY=your_helius_key
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## Security

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Environment variables for secrets (never hardcoded)
- ✅ CORS protection
- ✅ Input validation with Zod
- ✅ Secure session management

## Roadmap

- [ ] Enhanced analytics dashboard
- [ ] Additional vape store partnerships
- [ ] Mobile app versions (iOS/Android)
- [ ] Advanced NFT features
- [ ] Referral program system
- [ ] Multi-chain support

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@usvtoken.com

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Solana ecosystem for blockchain infrastructure
- OpenAI for AI capabilities
- PURE5 for vape product partnerships
- Replit for development platform
