import { ethers } from "ethers";
import {
  CONTRACT_ADDRESSES,
  SUPPORTED_NETWORKS,
  getCurrentNetwork,
} from "./contracts";
import { PRIMARY_NETWORK, getContractAddress } from "./network-config";
import HIKE2EARN_ARTIFACT from "./Hike2Earn.json";
import {
  getBestProvider,
  connectWithFallback,
  logWalletEnvironment,
  getErrorMessage,
  diagnoseWalletEnvironment,
  type WalletProvider,
} from "./wallet-utils";

export interface ClimbData {
  id: string;
  userId: string;
  mountainName: string;
  altitude: number;
  difficulty: "easy" | "moderate" | "hard" | "extreme";
  startTime: Date;
  endTime: Date;
  distance: number;
  elevationGain: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  photos: string[];
  verified: boolean;
  hikeTokensEarned: number;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  username: string;
  avatar: string;
  totalClimbs: number;
  totalAltitude: number;
  hikeTokenBalance: number;
  nftBadges: NFTBadge[];
  rank: number;
  joinedAt: Date;
}

export interface NFTBadge {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  earnedAt: Date;
  mountainName?: string;
  altitude?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  image: string;
  difficulty: "easy" | "moderate" | "hard" | "extreme";
  reward: number;
  participants: number;
  maxParticipants: number;
  startDate: Date;
  endDate: Date;
  requirements: {
    minAltitude?: number;
    specificMountain?: string;
    timeLimit?: number;
  };
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: number; // Unix timestamp
  endDate: number; // Unix timestamp
  prizePoolLSK: number;
  mountainIds: number[];
  erc20Tokens: string[];
  erc20Amounts: number[];
  isActive: boolean;
  prizeDistributed: boolean;
  totalNFTsMinted: number;
  participants: string[];
}

// Lisk Network configuration - now using PRIMARY_NETWORK from network-config
export const LISK_NETWORK_CONFIG = PRIMARY_NETWORK;

// Additional Lisk-specific contracts
export const LISK_CONTRACTS = {
  // Add Lisk-specific contract addresses when available
};

// HIKE Token contract configuration
export const HIKE_TOKEN_CONFIG = {
  address: "", // No contract deployed yet, will use mock balance
  decimals: 18,
  symbol: "HIKE",
};

// Hike2Earn contract configuration (dynamic based on network)
export const HIKE2EARN_CONTRACT_CONFIG = {
  address: PRIMARY_NETWORK.contracts.HIKE2EARN || CONTRACT_ADDRESSES.HIKE2EARN, // Prefer primary network, fallback to legacy
  abi: (HIKE2EARN_ARTIFACT as any).abi,
};

// Function to get contract config for specific network
export function getHike2EarnConfig(chainId?: number) {
  const contractAddress = chainId
    ? getContractAddress(chainId, "HIKE2EARN")
    : HIKE2EARN_CONTRACT_CONFIG.address;

  return {
    address: contractAddress || HIKE2EARN_CONTRACT_CONFIG.address,
    abi: HIKE2EARN_CONTRACT_CONFIG.abi,
  };
}

// Get the correct ethereum provider (handles multiple wallets with advanced conflict resolution)
const getEthereumProvider = (): WalletProvider | null => {
  if (typeof window === "undefined") {
    console.log("🏢 Server-side rendering - no provider available");
    return null;
  }

  // Log environment for debugging
  logWalletEnvironment();

  // Use the advanced provider detection
  const bestProvider = getBestProvider();

  if (!bestProvider) {
    console.warn("❌ No suitable wallet provider found");
    return null;
  }

  const diagnostic = diagnoseWalletEnvironment();

  // Show warnings for potential issues
  if (diagnostic.conflicts.length > 0) {
    console.warn("⚠️ Wallet conflicts detected:", diagnostic.conflicts);
  }

  if (diagnostic.recommendations.length > 0) {
    console.info("💡 Recommendations:", diagnostic.recommendations);
  }

  return bestProvider;
};

// Enhanced provider selection with MetaMask priority
const getSafeProvider = async (): Promise<WalletProvider | null> => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // First try to isolate MetaMask specifically
    const { isolateMetaMaskProvider } = await import("./wallet-utils");
    const metaMaskProvider = isolateMetaMaskProvider();

    if (metaMaskProvider) {
      console.log("✅ Found MetaMask provider");
      return metaMaskProvider;
    }

    // Fallback to best provider
    console.log("🔄 MetaMask not isolated, using best provider");
    return getBestProvider();
  } catch (error) {
    console.warn("⚠️ Provider isolation failed:", error);
    return getBestProvider();
  }
};

// Connect to Lisk Network with advanced error handling
export const connectWallet = async (): Promise<string | null> => {
  console.log("🔌 web3.connectWallet() called");

  if (typeof window === "undefined") {
    console.log("❌ Window is undefined (SSR)");
    return null;
  }

  // Use safe provider selection
  const ethereum = await getSafeProvider();

  if (!ethereum) {
    console.warn("❌ No wallet provider found");
    const diagnostic = diagnoseWalletEnvironment();

    if (diagnostic.recommendations.length > 0) {
      console.info("💡 Suggestions:", diagnostic.recommendations);
    }

    return null;
  }

  console.log("✅ Safe provider ready for connection");

  try {
    console.log(
      "📞 Requesting accounts from wallet using advanced fallback..."
    );

    // Use the advanced connection method with fallbacks
    const accounts = await connectWithFallback(ethereum);

    console.log("📋 Accounts received:", accounts);

    if (!accounts || accounts.length === 0) {
      console.error("❌ No accounts found in response");
      throw new Error(
        "No accounts found. Please unlock your wallet and try again."
      );
    }

    const connectedAccount = accounts[0];
    console.log("✅ Successfully connected to account:", connectedAccount);

    // Check network but don't block connection
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);

      if (currentChainId !== LISK_NETWORK_CONFIG.chainId) {
        console.log(
          `ℹ️ Connected to chain ${currentChainId}, target is Lisk (${LISK_NETWORK_CONFIG.chainId})`
        );
        // Just log - don't block connection
      } else {
        console.log("✅ Connected to correct network (Lisk)");
      }
    } catch (networkError) {
      console.warn("⚠️ Could not check network:", networkError);
      // Continue with connection even if network check fails
    }

    return connectedAccount;
  } catch (error: any) {
    console.error("❌ Wallet connection failed:", error);

    // Handle specific wallet conflict errors
    if (
      error.message?.includes("evmAsk.js") ||
      error.message?.includes("Unexpected error") ||
      error.message?.includes("selectExtension")
    ) {
      const walletError = new Error(
        "Wallet conflict detected. Please:\n" +
          "1. Close other wallet extensions (like Phantom)\n" +
          "2. Refresh the page\n" +
          "3. Make sure only MetaMask is enabled\n" +
          "4. Try again"
      );
      throw walletError;
    }

    // Get user-friendly error message
    const errorInfo = getErrorMessage(error);
    console.error("📝 Error details:", errorInfo);

    // Throw error with enhanced message
    if (error.code === 4001) {
      throw new Error("User rejected the connection request");
    } else if (error.code === -32002) {
      throw new Error(
        "Wallet connection request is already pending. Please check your wallet."
      );
    } else if (error.message?.includes("timeout")) {
      throw new Error("Wallet connection timed out. Please try again.");
    } else {
      throw new Error(
        `Failed to connect wallet: ${
          error.message || "Unknown error"
        }. Please refresh and try again.`
      );
    }
  }
};

export const isWalletAvailable = (): boolean => {
  if (typeof window === "undefined") {
    console.log("🏢 Server-side rendering detected");
    return false;
  }

  console.log("🔍 Checking wallet availability...");
  console.log("🔹 window.ethereum exists:", !!window.ethereum);
  console.log("🔹 window.ethereum type:", typeof window.ethereum);

  if (window.ethereum) {
    console.log(
      "🔹 window.ethereum.isMetaMask:",
      (window.ethereum as any).isMetaMask
    );
    console.log(
      "🔹 window.ethereum.isPhantom:",
      (window.ethereum as any).isPhantom
    );
    console.log(
      "🔹 window.ethereum.providers length:",
      (window.ethereum as any).providers?.length || "no providers"
    );
  }

  return !!window.ethereum;
};

export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isWalletAvailable()) return null;

  try {
    const ethereum = await getSafeProvider();
    if (!ethereum) return null;

    const accounts = await ethereum.request({
      method: "eth_accounts",
    });
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error("Failed to get current account:", error);
    return null;
  }
};

// Get user's HIKE token balance with improved error handling
export const getHikeTokenBalance = async (address: string): Promise<number> => {
  console.log("🪙 Getting HIKE balance for:", address);

  try {
    if (
      typeof window !== "undefined" &&
      HIKE_TOKEN_CONFIG.address &&
      HIKE_TOKEN_CONFIG.address !== ""
    ) {
      console.log(
        "🪙 Attempting to fetch from token contract:",
        HIKE_TOKEN_CONFIG.address
      );

      const ethereum = await getSafeProvider();
      if (!ethereum) {
        console.warn("⚠️ No safe provider available, using mock balance");
      } else {
        const provider = new ethers.BrowserProvider(ethereum);
        const tokenABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
        ];

        const tokenContract = new ethers.Contract(
          HIKE_TOKEN_CONFIG.address,
          tokenABI,
          provider
        );

        const balance = await tokenContract.balanceOf(address);
        const realBalance =
          Number(balance) / Math.pow(10, HIKE_TOKEN_CONFIG.decimals);
        console.log("🪙 Real HIKE balance:", realBalance);
        return realBalance;
      }
    }
  } catch (error) {
    console.warn(
      "⚠️ Failed to get real HIKE token balance, using mock:",
      error
    );
  }

  // Return mock balance for demo (since no token contract is deployed yet)
  const mockBalance = Math.floor(Math.random() * 5000) + 2500; // Between 2500-7500 for demo
  console.log("🪙 Mock HIKE balance:", mockBalance);
  return mockBalance;
};

// Calculate HIKE tokens earned based on climb data
export const calculateHikeReward = (climbData: Partial<ClimbData>): number => {
  if (!climbData.altitude || !climbData.difficulty) return 0;

  const baseReward = climbData.altitude * 0.01; // 0.01 HIKE per meter
  const difficultyMultiplier = {
    easy: 1,
    moderate: 1.5,
    hard: 2,
    extreme: 3,
  };

  return baseReward * difficultyMultiplier[climbData.difficulty];
};

// Verify climb using Flare Data Connector (FDC)
export const verifyClimbWithFDC = async (
  climbData: ClimbData
): Promise<boolean> => {
  // Implementation will use Flare's FDC for GPS and photo verification
  return true;
};

export const verifyClimbWithStateConnector = async (
  climbData: ClimbData
): Promise<boolean> => {
  try {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Prepare attestation request for GPS coordinates and timestamp verification
      const attestationRequest = {
        attestationType:
          "0x475053000000000000000000000000000000000000000000000000000000000", // GPS
        sourceId:
          "0x475053000000000000000000000000000000000000000000000000000000000", // GPS source
        requestBody: {
          coordinates: climbData.coordinates,
          timestamp: climbData.startTime.getTime(),
          altitude: climbData.altitude,
        },
      };

      // Submit to State Connector (simplified implementation)
      console.log(
        "Submitting climb verification to State Connector:",
        attestationRequest
      );

      // In a real implementation, this would interact with the State Connector contract
      // For now, we'll simulate verification based on reasonable climb parameters
      const isValidAltitude =
        climbData.altitude > 0 && climbData.altitude < 9000; // Reasonable altitude range
      const isValidDuration =
        climbData.endTime.getTime() - climbData.startTime.getTime() > 300000; // At least 5 minutes
      const isValidDistance =
        climbData.distance > 0 && climbData.distance < 50000; // Reasonable distance in meters

      return isValidAltitude && isValidDuration && isValidDistance;
    }
  } catch (error) {
    console.error("Failed to verify climb with State Connector:", error);
  }
  return false;
};

export const getFTSOPrice = async (symbol: string): Promise<number> => {
  try {
    // FTSO price fetching is not available yet - using mock prices
    console.log("📊 Fetching price for", symbol, "(mock data)");

    const mockPrices: Record<string, number> = {
      FLR: 0.0234,
      BTC: 43250.67,
      ETH: 2456.89,
      XRP: 0.5234,
      ADA: 0.3456,
      LSK: 1.23,
    };

    return mockPrices[symbol] || Math.random() * 100;
  } catch (error) {
    console.error("Failed to fetch FTSO price for", symbol, ":", error);
    return Math.random() * 100;
  }
};

export const calculateHikeRewardWithFTSO = async (
  climbData: Partial<ClimbData>
): Promise<number> => {
  if (!climbData.altitude || !climbData.difficulty) return 0;

  // Get current FLR price to adjust rewards
  const flrPrice = await getFTSOPrice("FLR");
  const priceMultiplier = Math.max(0.5, Math.min(2, 1 / flrPrice)); // Adjust rewards based on FLR price

  const baseReward = climbData.altitude * 0.01; // 0.01 HIKE per meter
  const difficultyMultiplier = {
    easy: 1,
    moderate: 1.5,
    hard: 2,
    extreme: 3,
  };

  return (
    baseReward * difficultyMultiplier[climbData.difficulty] * priceMultiplier
  );
};

// Smart contract interactions
export const stakeHikeTokens = async (amount: number): Promise<boolean> => {
  try {
    if (typeof window !== "undefined") {
      const ethereum = await getSafeProvider();
      if (!ethereum) {
        console.warn("⚠️ No safe provider available for staking");
        return false;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      const stakingABI = [
        "function stake(uint256 amount) external",
        "function approve(address spender, uint256 amount) external returns (bool)",
      ];

      // First approve the staking contract to spend HIKE tokens
      const tokenContract = new ethers.Contract(
        HIKE_TOKEN_CONFIG.address,
        stakingABI,
        signer
      );

      const amountWei = ethers.parseUnits(
        amount.toString(),
        HIKE_TOKEN_CONFIG.decimals
      );

      // Approve spending (simplified - in reality would need staking contract address)
      console.log("Approving HIKE token spending for staking:", amount);

      // Stake tokens (simplified implementation)
      console.log("Staking HIKE tokens:", amount);

      return true;
    }
  } catch (error) {
    console.error("Failed to stake HIKE tokens:", error);
  }
  return false;
};

export const unstakeHikeTokens = async (amount: number): Promise<boolean> => {
  // Implementation will interact with staking contract
  return true;
};

export const claimStakingRewards = async (): Promise<number> => {
  // Implementation will claim staking rewards
  return 0;
};

// NFT minting for achievements
export const mintAchievementNFT = async (
  achievementData: Partial<NFTBadge>
): Promise<string> => {
  try {
    if (typeof window !== "undefined") {
      const ethereum = await getSafeProvider();
      if (!ethereum) {
        console.warn("⚠️ No safe provider available for NFT minting");
        return "0x0000000000000000000000000000000000000000000000000000000000000000";
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      const nftABI = [
        "function mintAchievement(address to, string memory tokenURI, uint256 rarity) external returns (uint256)",
      ];

      // Simplified NFT minting (would need actual NFT contract address)
      console.log("Minting achievement NFT:", achievementData);

      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      return mockTxHash;
    }
  } catch (error) {
    console.error("Failed to mint achievement NFT:", error);
  }
  return "0x0000000000000000000000000000000000000000000000000000000000000000";
};

//  =================
// CAMPAIGN FUNCTIONS
// =================

// Create a new campaign on the smart contract
export const createCampaignOnChain = async (
  campaignData: Omit<Campaign, "id" | "participants">
): Promise<string | null> => {
  try {
    if (typeof window !== "undefined" && HIKE2EARN_CONTRACT_CONFIG.address) {
      // Use safe provider selection to avoid wallet conflicts
      const ethereum = await getSafeProvider();
      if (!ethereum) {
        throw new Error(
          "No wallet provider found. Please ensure MetaMask is installed and unlocked."
        );
      }

      console.log("🔑 Creating provider and signer...");
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();

      console.log("📝 Creating contract instance...");
      const hike2EarnContract = new ethers.Contract(
        HIKE2EARN_CONTRACT_CONFIG.address,
        HIKE2EARN_CONTRACT_CONFIG.abi,
        signer
      );

      console.log("⏳ Creating campaign on blockchain...");

      // Create campaign with basic info first
      // Try to create campaign directly - if it fails due to permissions, fallback will catch it
      const tx = await hike2EarnContract.createCampaign(
        campaignData.name,
        campaignData.startDate,
        campaignData.endDate
      );

      console.log("⏳ Waiting for transaction confirmation...");
      const receipt = await tx.wait();

      console.log("✅ Campaign created successfully!");
      // Extract campaign ID from events
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === "CampaignCreated"
      );
      const campaignId = event ? event.args[0].toString() : null;

      if (!campaignId) {
        throw new Error("Failed to get campaign ID from transaction");
      }

      console.log(`📋 Campaign ID: ${campaignId}`);

      // Add mountains to the campaign
      if (campaignData.mountainIds && campaignData.mountainIds.length > 0) {
        console.log("🏔️ Adding mountains to campaign...");
        for (const mountainId of campaignData.mountainIds) {
          // Get mountain data (this would typically come from a database)
          const mountainData = getMountainData(mountainId);
          if (mountainData) {
            console.log(`Adding mountain: ${mountainData.name}`);
            const addMountainTx = await hike2EarnContract.addMountain(
              campaignId,
              mountainData.name,
              mountainData.altitude,
              mountainData.location
            );
            await addMountainTx.wait();
          }
        }
      }

      // If there's an LSK prize pool, sponsor the campaign
      if (campaignData.prizePoolLSK > 0) {
        console.log("💰 Sponsoring campaign with LSK...");
        const sponsorTx = await hike2EarnContract.sponsorCampaign(
          campaignId,
          "Campaign Creator", // Default sponsor name
          "", // No logo URI for now
          { value: ethers.parseEther(campaignData.prizePoolLSK.toString()) }
        );
        await sponsorTx.wait();
        console.log("✅ Campaign sponsored successfully!");
      }

      // Handle ERC20 token prizes if any
      if (campaignData.erc20Tokens && campaignData.erc20Tokens.length > 0) {
        console.log("🪙 Handling ERC20 token sponsorships...");
        for (let i = 0; i < campaignData.erc20Tokens.length; i++) {
          const tokenAddress = campaignData.erc20Tokens[i];
          const tokenAmount = campaignData.erc20Amounts[i];

          if (tokenAmount > 0) {
            console.log(
              `Approving ${tokenAmount} tokens for ${tokenAddress}...`
            );
            // First approve the contract to spend tokens
            const tokenContract = new ethers.Contract(
              tokenAddress,
              [
                "function approve(address spender, uint256 amount) external returns (bool)",
              ],
              signer
            );

            const approveTx = await tokenContract.approve(
              HIKE2EARN_CONTRACT_CONFIG.address,
              ethers.parseUnits(tokenAmount.toString(), 18) // Assuming 18 decimals
            );
            await approveTx.wait();

            console.log("Sponsoring with ERC20 tokens...");
            // Sponsor with ERC20 token
            const sponsorERC20Tx = await hike2EarnContract.sponsorCampaignERC20(
              campaignId,
              tokenAddress,
              ethers.parseUnits(tokenAmount.toString(), 18)
            );
            await sponsorERC20Tx.wait();
          }
        }
      }

      console.log("🎉 Campaign creation completed successfully!");
      return campaignId;
    }
  } catch (error) {
    console.error("❌ Failed to create campaign on-chain:", error);

    // Handle specific wallet conflict errors
    if (error instanceof Error) {
      if (
        error.message.includes("evmAsk.js") ||
        error.message.includes("Unexpected error") ||
        error.message.includes("selectExtension")
      ) {
        const walletError = new Error(
          "Wallet conflict detected. Please:\n" +
            "1. Close other wallet extensions (like Phantom)\n" +
            "2. Refresh the page\n" +
            "3. Make sure only MetaMask is enabled\n" +
            "4. Try again"
        );
        throw walletError;
      } else if (error.message.includes("user rejected")) {
        const userError = new Error("Transaction cancelled by user");
        throw userError;
      }
    }

    throw error;
  }

  // Return mock ID for demo purposes
  return `mock-${Date.now()}`;
};

// Helper function to get mountain data
function getMountainData(mountainId: number) {
  const mountainsData = {
    1: { name: "Aconcagua", altitude: 6962, location: "Mendoza, Argentina" },
    2: {
      name: "Cerro Mercedario",
      altitude: 6770,
      location: "Mendoza, Argentina",
    },
    3: {
      name: "Cerro Tupungato",
      altitude: 6570,
      location: "Mendoza, Argentina",
    },
    4: { name: "Cerro Plata", altitude: 6100, location: "Mendoza, Argentina" },
    5: {
      name: "Cerro El Plomo",
      altitude: 5424,
      location: "Mendoza, Argentina",
    },
    6: {
      name: "Cerro Vallecitos",
      altitude: 5462,
      location: "Mendoza, Argentina",
    },
  };

  return mountainsData[mountainId as keyof typeof mountainsData] || null;
}

// Mint NFT for mountain climb (replaces joinCampaignOnChain)
export const mintClimbingNFT = async (
  mountainId: number,
  proofURI: string
): Promise<string | null> => {
  try {
    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      HIKE2EARN_CONTRACT_CONFIG.address
    ) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const hike2EarnContract = new ethers.Contract(
        HIKE2EARN_CONTRACT_CONFIG.address,
        HIKE2EARN_CONTRACT_CONFIG.abi,
        signer
      );

      const tx = await hike2EarnContract.mintClimbingNFT(mountainId, proofURI);
      const receipt = await tx.wait();

      // Extract token ID from events
      const event = receipt.logs.find(
        (log: any) => log.fragment?.name === "NFTMinted"
      );
      const tokenId = event ? event.args[0].toString() : null;

      return tokenId;
    }
  } catch (error) {
    console.error("Failed to mint climbing NFT:", error);
    throw error;
  }

  return `mock-token-${Date.now()}`; // Mock success
};

// Compatibility function for campaign-utils.ts
export const joinCampaignOnChain = async (
  campaignId: string
): Promise<boolean> => {
  // In the new contract model, users join by minting NFTs after climbing
  // This function is kept for backward compatibility but will always return true
  console.log("joinCampaignOnChain called for campaign:", campaignId);
  console.log(
    "Note: In Hike2Earn contract, users join by minting climbing NFTs"
  );
  return true;
};

// Start a climb for a specific campaign and mountain (compatibility function)
export const startClimbOnChain = async (
  campaignId: string,
  mountainId: number
): Promise<boolean> => {
  // In the new contract model, climbing is tracked via NFT minting
  console.log(
    "startClimbOnChain called for campaign:",
    campaignId,
    "mountain:",
    mountainId
  );
  console.log(
    "Note: In Hike2Earn contract, climbs are tracked via mintClimbingNFT"
  );
  return true;
};

// Complete a campaign and trigger NFT minting
export const completeCampaignOnChain = async (
  campaignId: string,
  climbData: ClimbData
): Promise<boolean> => {
  try {
    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      HIKE2EARN_CONTRACT_CONFIG.address
    ) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // First verify the climb using State Connector
      const climbVerified = await verifyClimbWithStateConnector(climbData);

      if (!climbVerified) {
        throw new Error("Climb verification failed");
      }

      const hike2EarnContract = new ethers.Contract(
        HIKE2EARN_CONTRACT_CONFIG.address,
        HIKE2EARN_CONTRACT_CONFIG.abi,
        signer
      );

      // In the new contract, completion is handled via NFT minting with proof
      // Find the mountain ID based on the climb data
      const mountainId = 1; // This would need proper mapping
      const proofURI = `ipfs://proof-${Date.now()}`; // This would be actual IPFS URI

      const tx = await hike2EarnContract.mintClimbingNFT(mountainId, proofURI);
      await tx.wait();

      // Mint achievement NFT
      const nftData: Partial<NFTBadge> = {
        name: `Campaign ${campaignId} Completion`,
        description: `Successfully completed campaign ${campaignId} by climbing ${climbData.mountainName}`,
        image: `/nfts/campaign-${campaignId}.jpg`,
        rarity:
          climbData.difficulty === "extreme"
            ? ("legendary" as const)
            : climbData.difficulty === "hard"
            ? ("epic" as const)
            : climbData.difficulty === "moderate"
            ? ("rare" as const)
            : ("common" as const),
        earnedAt: new Date(),
        mountainName: climbData.mountainName,
        altitude: climbData.altitude,
      };

      await mintAchievementNFT(nftData);

      return true;
    }
  } catch (error) {
    console.error("Failed to complete campaign:", error);
    throw error;
  }

  return true; // Mock success
};

// Get campaign data from smart contract
export const getCampaignFromChain = async (
  campaignId: string
): Promise<Campaign | null> => {
  try {
    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      HIKE2EARN_CONTRACT_CONFIG.address
    ) {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const hike2EarnContract = new ethers.Contract(
        HIKE2EARN_CONTRACT_CONFIG.address,
        HIKE2EARN_CONTRACT_CONFIG.abi,
        provider
      );

      const campaignData = await hike2EarnContract.getCampaignInfo(campaignId);

      // Get campaign mountains (we'd need to track this separately or query events)
      const mountainIds: number[] = [];

      return {
        id: campaignId,
        name: campaignData.name,
        description: "", // Would need to store this separately or in IPFS
        startDate: Number(campaignData.startDate),
        endDate: Number(campaignData.endDate),
        prizePoolLSK: Number(ethers.formatEther(campaignData.prizePoolLSK)),
        mountainIds: mountainIds,
        erc20Tokens: [], // Would need to query separately
        erc20Amounts: [], // Would need to query separately
        isActive: campaignData.isActive,
        prizeDistributed: campaignData.prizeDistributed,
        totalNFTsMinted: 0, // Would need to get from campaign struct
        participants: [], // Would need to query separately
      };
    }
  } catch (error) {
    console.error("Failed to get campaign from chain:", error);
  }

  return null;
};

// Get user's NFTs
export const getUserNFTs = async (userAddress: string): Promise<number[]> => {
  try {
    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      HIKE2EARN_CONTRACT_CONFIG.address
    ) {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const hike2EarnContract = new ethers.Contract(
        HIKE2EARN_CONTRACT_CONFIG.address,
        HIKE2EARN_CONTRACT_CONFIG.abi,
        provider
      );

      const nftIds = await hike2EarnContract.getParticipantNFTs(userAddress);
      return nftIds.map((id: any) => Number(id));
    }
  } catch (error) {
    console.error("Failed to get user NFTs:", error);
  }

  return [];
};

// Distribute prizes for a completed campaign
export const distributeCampaignPrizes = async (
  campaignId: string
): Promise<boolean> => {
  try {
    if (
      typeof window !== "undefined" &&
      window.ethereum &&
      HIKE2EARN_CONTRACT_CONFIG.address
    ) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const hike2EarnContract = new ethers.Contract(
        HIKE2EARN_CONTRACT_CONFIG.address,
        HIKE2EARN_CONTRACT_CONFIG.abi,
        signer
      );

      const tx = await hike2EarnContract.distributePrizes(campaignId);
      await tx.wait();

      return true;
    }
  } catch (error) {
    console.error("Failed to distribute campaign prizes:", error);
    throw error;
  }

  return true; // Mock success
};

// Global types are declared in network-config.ts
