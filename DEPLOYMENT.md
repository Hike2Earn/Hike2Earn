# Hike2Earn Smart Contract Deployment Guide

## Prerequisites

1. **Node.js and npm** - Make sure you have Node.js 16+ installed
2. **Hardhat** - For smart contract deployment
3. **Wallet with funds** - For paying gas fees on the target network

## Environment Setup

1. **Navigate to the smart contract directory:**
   ```bash
   cd smartContract/hardhat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file** (copy from .env.example if available):
   ```env
   DEPLOYER_PRIVATE_KEY=your_private_key_here
   ALCHEMY_API_KEY=your_alchemy_key_here # optional
   ETHERSCAN_API_KEY=your_etherscan_key_here # for verification
   ```

## Available Networks

The contract can be deployed to the following networks:

### Flare Network (Mainnet)
- **Network:** flare
- **Chain ID:** 14
- **RPC:** https://flare-api.flare.network/ext/C/rpc
- **Explorer:** https://flare-explorer.flare.network

### Flare Testnet (Coston2)
- **Network:** flareTestnet
- **Chain ID:** 114
- **RPC:** https://coston2-api.flare.network/ext/C/rpc
- **Explorer:** https://coston2-explorer.flare.network

### Local Development
- **Network:** localhost
- **Chain ID:** 31337
- **RPC:** http://127.0.0.1:8545

## Deployment Commands

### 1. Local Development (Hardhat Network)
```bash
# Start local node
npx hardhat node

# In another terminal, deploy
npx hardhat deploy --network localhost
```

### 2. Flare Testnet (Recommended for testing)
```bash
npx hardhat deploy --network flareTestnet
```

### 3. Flare Mainnet (Production)
```bash
npx hardhat deploy --network flare
```

## What the Deployment Does

1. **Deploys Hike2Earn Contract** - The main NFT and campaign contract
2. **Creates Sample Campaign** - "Argentina Mountains Challenge 2025"
3. **Adds Sample Mountains:**
   - Aconcagua (6,961m) - Mendoza, Argentina
   - Cerro Torre (3,128m) - Patagonia, Argentina  
   - Cerro Catedral (2,388m) - Bariloche, Argentina
4. **Updates Frontend Configuration** - Automatically updates `front/lib/contracts.ts`

## After Deployment

The deployment script will automatically:

- ✅ Display the deployed contract address
- ✅ Update `front/lib/contracts.ts` with the new contract address
- ✅ Create a deployment record in `smartContract/hardhat/deployments/{chainId}.json`
- ✅ Set up sample data for immediate testing

## Testing the Integration

1. **Start the frontend:**
   ```bash
   cd front
   npm run dev
   ```

2. **Connect your wallet** to the same network where you deployed

3. **Test campaign creation:**
   - Go to `/campaigns`
   - Click "Create Campaign"
   - Fill out the form and submit
   - Check your wallet for the transaction

## Troubleshooting

### Common Issues:

1. **"Insufficient funds"** - Make sure your wallet has enough tokens for gas
2. **"Wrong network"** - Switch your wallet to the same network you deployed to
3. **"Contract not found"** - Check that `front/lib/contracts.ts` has the correct address

### Verify Deployment:

1. **Check contract on explorer:** Visit the network explorer and search for your contract address
2. **Test read functions:** Try calling view functions like `getCampaignInfo(0)`
3. **Check frontend logs:** Open browser developer tools to see any errors

## Network-Specific Notes

### Flare Network
- Native token: FLR
- Gas prices are typically low
- Supports EVM-compatible contracts
- Has FTSO price feeds for various tokens

### Gas Estimation
- Contract deployment: ~3-5M gas
- Campaign creation: ~200-300k gas  
- Mountain addition: ~100-150k gas each
- NFT minting: ~150-200k gas

## Contract Verification (Optional)

If you want to verify the contract on the block explorer:

```bash
npx hardhat verify --network flareTestnet DEPLOYED_CONTRACT_ADDRESS
```

Replace `DEPLOYED_CONTRACT_ADDRESS` with the actual deployed address.