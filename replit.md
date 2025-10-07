# Overview

This is a full-stack Progressive Web Application (PWA) for the USV Token ecosystem - an Ultra Smooth Vape token platform that combines blockchain rewards, NFT authentication, and vape store partnerships. The application provides a comprehensive tokenomics system with QR code scanning, wallet integration, and mobile-first design for iOS and Android users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the client application
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** with shadcn/ui components for consistent styling
- **Progressive Web App (PWA)** configuration with service worker for offline functionality
- **Mobile-first responsive design** with bottom navigation and touch-optimized UI
- **Framer Motion** for smooth animations and transitions
- **Wouter** for lightweight client-side routing

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** structure with authentication middleware
- **JWT-based authentication** with bcrypt password hashing
- **Memory storage** implementation with interface for database abstraction
- **Request logging and error handling** middleware
- **Development/production environment** separation with Vite integration

### State Management
- **TanStack Query (React Query)** for server state management and caching
- **React Context** for authentication state
- **Custom hooks** for mobile detection and toast notifications
- **Wallet provider** for Solana blockchain integration

### Solana Blockchain Integration
- **Solana Web3.js** for blockchain interactions
- **SPL Token** support for USV token operations
- **Anchor framework** for smart contract interactions
- **Wallet adapter** for connecting to Solana wallets (Phantom, etc.)
- **Token minting, transferring, and staking** capabilities

### Database Design
- **Drizzle ORM** configured for PostgreSQL with Neon Database
- **Zod schemas** for type-safe data validation
- **User management** with profile, balance, and preferences
- **Transaction tracking** for all token operations
- **NFT portfolio** management for authenticated products
- **QR code system** for product verification with real blockchain transfers
- **Webhook system** for real-time QR claim notifications to external systems
- **Vape store** directory with geolocation

### UI/UX Architecture
- **Dark theme** with USV brand colors (electric blue, crypto gold)
- **Mobile app-like interface** with native feel
- **Smooth animations** and micro-interactions
- **QR scanner** integration with camera access
- **Bottom navigation** for main app sections
- **Toast notifications** for user feedback

### Webhook System
- **Real-time notifications** for QR code claims sent to external systems
- **RESTful webhook management** API with CRUD operations
- **Event-based triggers** supporting multiple webhook subscriptions
- **Secure webhook delivery** with secret key verification
- **QR Generator integration** - Separate QR generator system receives instant notifications when codes are claimed
- **Payload includes**: QR code details, user information, blockchain transaction data, and timestamp
- **Reliable delivery** with 10-second timeout and error handling

## External Dependencies

### Blockchain & Crypto
- **Solana Web3.js** - Solana blockchain interactions
- **@coral-xyz/anchor** - Solana smart contract framework
- **@solana/spl-token** - SPL token operations
- **@metaplex-foundation/umi** - Metaplex NFT utilities

### Database & Storage
- **@neondatabase/serverless** - Neon PostgreSQL database
- **Drizzle ORM** - Type-safe database toolkit
- **Zod** - Schema validation and TypeScript integration

### Frontend Libraries
- **React 18** - Core UI framework
- **Vite** - Build tool and development server
- **TanStack Query** - Server state management
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

### Authentication & Security
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** - Password hashing
- **@hookform/resolvers** - Form validation

### Development Tools
- **TypeScript** - Type safety and developer experience
- **ESBuild** - Fast JavaScript bundler
- **PostCSS & Autoprefixer** - CSS processing