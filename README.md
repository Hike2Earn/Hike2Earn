# Hike2Earn 🏔️ - Web3 Mountain Climbing Platform

<img src="/Logo-Hike2Earn.png" alt="Hike2Earn Logo" width="300"/>

## 🌟 Project Overview

**Hike2Earn** is an innovative Web3 platform that revolutionizes mountaineering by rewarding climbers for exploring lesser-known peaks and participating in mountain cleanup campaigns. Built on Lisk blockchain technology, the application incentivizes responsible and sustainable exploration while building a community where protecting mountains is as valuable as conquering them.

### 🏔️ Problem We Solve

Mountaineering faces a growing sustainability crisis: iconic peaks like Everest and Kilimanjaro are overwhelmed by overcrowding, waste accumulation, and severe environmental degradation, while thousands of lesser-known mountains remain ignored. This concentration of tourism not only damages fragile ecosystems and endangers climbers' safety, but also highlights the lack of incentives for adventurers to practice responsible and sustainable exploration.

### 💡 Our Solution

Hike2Earn offers an innovative solution by rewarding climbers for exploring lesser-known peaks and participating in mountain cleanup campaigns. Through a system of tokens and challenges, the app decentralizes tourism pressure away from overcrowded destinations while directly incentivizing environmental responsibility.

## ⚡ Technologies Used

### 🎨 **Frontend**
- **Next.js 15.1.0** - React framework with App Router
- **React 18.3.1** - UI component library
- **TypeScript 5** - Static typing for JavaScript
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **Radix UI** - Accessible primitive components
- **Framer Motion** - Smooth animations
- **Lucide React** - Modern icon library

### 🔗 **Blockchain & Web3**
- **Lisk Network** - Primary blockchain platform
- **Ethers.js 6.13.4** - Ethereum interaction library
- **ERC-721 (NFT)** - Non-fungible token standard
- **OpenZeppelin Contracts** - Secure and audited contracts
- **Hardhat** - Smart contract development framework

### 🛠️ **Development Tools**
- **Hardhat** - Ethereum development environment
- **SWR** - Data fetching library
- **React Hook Form** - Form management
- **Neon Database** - Serverless database
- **Leaflet & React-Leaflet** - Interactive maps

### 🚀 **Deployment & Infrastructure**
- **Vercel** - Frontend hosting and deployment
- **Lisk Mainnet** - Smart contract deployment
- **IPFS** - Decentralized file storage for NFT metadata

## 🎮 Key Features

### 🏃‍♂️ **Campaign System**
- **Campaign Types**: Summit, Cleanup, Training, Expedition
- **Difficulty Levels**: Beginner, Intermediate, Advanced, Expert
- **HIKE Rewards**: Token rewards for completing campaigns
- **Participant Management**: Registration and tracking system

### 🎖️ **NFT System**
- **Climbing NFTs**: Unique tokens for each mountain climbed
- **Verification**: Proof system with photos and GPS data
- **Unique Metadata**: Mountain info, altitude, climbing date
- **Rarity System**: Classification based on difficulty

### 🗺️ **Interactive Exploration**
- **Leaflet Maps**: Interactive mountain visualization
- **Peak Details**: Complete information for each mountain
- **Climbing Routes**: Detailed plans and statistics
- **GPS Tracking**: Real-time climb tracking

### 💰 **Reward System**
- **HIKE Tokens**: Platform's main currency
- **Prize Pools**: Shared funds for campaigns
- **Sponsorships**: Sponsor system for campaigns
- **Automatic Distribution**: Smart contracts for payments

### 📊 **Complete Dashboard**
- **Personal Statistics**: Climbing metrics
- **NFT History**: Achievement gallery
- **Transactions**: Token and reward history
- **Leaderboards**: Climber rankings

## 🎯 Featured Mountains

The platform includes iconic mountains from the Andes:

- **Aconcagua** (6,962m) - Argentina
- **Cerro Mercedario** (6,770m) - Argentina  
- **Cerro Tupungato** (6,570m) - Argentina
- **Cerro el Plata** (6,100m) - Argentina
- **Cerro El Plomo** (5,424m) - Chile
- **Torres del Paine** - Chile
- **Volcán Villarrica** (2,847m) - Chile
- **Cerro Torre** (3,128m) - Patagonia
- **Fitz Roy** (3,375m) - Patagonia

## 🛠️ Installation & Setup

### 📋 Prerequisites

- **Node.js** (version 18 or higher)
- **npm**, **yarn**, **pnpm** or **bun**
- **Git**
- **Web3 Wallet** (MetaMask recommended)

### ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-username/hike2earn.git
cd hike2earn

# 2. Install frontend dependencies
cd front
npm install
# or
yarn install
# or
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configurations

# 4. Run the development server
npm run dev
# or
yarn dev
# or
pnpm dev

# 5. Open in browser
# http://localhost:3000
```

### 🔧 Smart Contract Setup

```bash
# 1. Navigate to contracts directory
cd smartContract/hardhat

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Add private keys and network URLs

# 4. Compile contracts
npx hardhat compile

# 5. Run tests
npx hardhat test

# 6. Deploy to local network
npx hardhat node
# In another terminal:
npx hardhat run scripts/deployHike2Earn.js --network localhost

# 7. Deploy to Lisk Mainnet
npx hardhat run scripts/deployHike2Earn.js --network lisk
```

### 🌐 Environment Variables

Create `.env.local` file in the `front/` directory:

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=1135
NEXT_PUBLIC_RPC_URL=https://rpc.api.lisk.com
NEXT_PUBLIC_HIKE2EARN_CONTRACT_ADDRESS=0x...

# Database (optional)
DATABASE_URL=postgresql://...

# IPFS (optional)
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/

# Analytics (optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
```

## 🚀 Available Scripts

### Frontend (`front/`)
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Production server
npm run lint         # Check code with ESLint
npm run type-check   # Check TypeScript types
```

### Smart Contracts (`smartContract/hardhat/`)
```bash
npx hardhat compile       # Compile contracts
npx hardhat test         # Run tests
npx hardhat node         # Local development network
npx hardhat deploy       # Deploy contracts
npx hardhat verify       # Verify contracts
```


## 🏗️ Project Structure

```
Hike2Earn/
├── front/                          # Next.js Frontend
│   ├── app/                       # Next.js 13+ App Router
│   │   ├── campaigns/            # Campaigns page
│   │   ├── climb/               # Climb tracking
│   │   ├── dashboard/           # Main dashboard
│   │   ├── social/              # Social network
│   │   └── wallet/              # Wallet management
│   ├── components/              # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── wallet-provider.tsx # Web3 provider
│   │   ├── climb-tracker.tsx   # Climb tracking
│   │   └── nft-gallery.tsx     # NFT gallery
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utilities and configuration
│   └── public/                  # Static assets
├── smartContract/               # Smart contracts
│   └── hardhat/                # Hardhat configuration
│       ├── contracts/          # Solidity contracts
│       │   └── Hike2Earn.sol  # Main contract
│       ├── scripts/            # Deployment scripts
│       ├── test/              # Contract tests
│       └── hardhat.config.js  # Hardhat config
└── README.md                    # This documentation
```

## 📱 Detailed Features

### 🎯 **Climbing Campaigns**
- **Creation**: Users can create custom campaigns
- **Participation**: Registration and tracking system
- **Types**: Summit, Cleanup, Training, Expedition
- **Rewards**: Prize pools automatically distributed

### 🏆 **Climbing NFTs**
- **Auto Mint**: Upon completing a verified climb
- **Unique Metadata**: Specific information for each climb
- **Proof of Climb**: Verification system with photos/GPS
- **Collection**: Personal gallery of achievements

### 💎 **HIKE Tokens**
- **Earning**: Complete campaigns and climbs
- **Utility**: Create campaigns, stake, governance
- **Exchange**: Integrated swap system
- **Staking**: Rewards for holding tokens

### 🗺️ **Interactive Maps**
- **Exploration**: Discover new mountains
- **Filters**: By difficulty, type, rewards
- **Details**: Complete information for each peak
- **Planning**: Route planning tools

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🌐 Links & Resources

- **Website**: [hike2earn.com](hike2-earn-cmgb.vercel.app) (Deployed on Vercel)
- **GitHub**: [Official repository](https://github.com/hike2earn/hike2earn)
- **Lisk Network**: [Official documentation](https://docs.lisk.com/)
- **Vercel**: [Deployment platform](https://vercel.com)

## 🙏 Acknowledgments

- **Lisk Network** for providing the blockchain infrastructure
- **Vercel** for hosting and deployment platform
- **Mountaineering community** for inspiration and feedback

---

**Join the Web3 mountaineering revolution with Hike2Earn! 🏔️⛰️🚀**
