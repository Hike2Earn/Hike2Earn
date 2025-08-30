import { ethers } from "ethers"

export interface ClimbData {
  id: string
  userId: string
  mountainName: string
  altitude: number
  difficulty: "easy" | "moderate" | "hard" | "extreme"
  startTime: Date
  endTime: Date
  distance: number
  elevationGain: number
  coordinates: {
    lat: number
    lng: number
  }
  photos: string[]
  verified: boolean
  hikeTokensEarned: number
}

export interface UserProfile {
  id: string
  walletAddress: string
  username: string
  avatar: string
  totalClimbs: number
  totalAltitude: number
  hikeTokenBalance: number
  nftBadges: NFTBadge[]
  rank: number
  joinedAt: Date
}

export interface NFTBadge {
  id: string
  name: string
  description: string
  image: string
  rarity: "common" | "rare" | "epic" | "legendary"
  earnedAt: Date
  mountainName?: string
  altitude?: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  image: string
  difficulty: "easy" | "moderate" | "hard" | "extreme"
  reward: number
  participants: number
  maxParticipants: number
  startDate: Date
  endDate: Date
  requirements: {
    minAltitude?: number
    specificMountain?: string
    timeLimit?: number
  }
}

// Flare Network configuration
export const FLARE_NETWORK_CONFIG = {
  chainId: 14, // Flare Mainnet
  name: "Flare Network",
  currency: "FLR",
  rpcUrl: "https://flare-api.flare.network/ext/C/rpc",
  blockExplorer: "https://flare-explorer.flare.network",
  ftsoRegistry: "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019",
  stateConnector: "0x1000000000000000000000000000000000000001",
}

// HIKE Token contract configuration
export const HIKE_TOKEN_CONFIG = {
  address: "0x...", // Contract address will be deployed
  decimals: 18,
  symbol: "HIKE",
}

// Connect to Flare Network
export const connectWallet = async (): Promise<string | null> => {
  if (typeof window === "undefined") {
    return null
  }

  // Check if MetaMask or other wallet is installed
  if (!window.ethereum) {
    console.warn("No wallet extension detected")
    return null
  }

  try {
    // Request accounts using the standard method
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found")
    }

    // Only check current network without forcing a switch
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()
      const currentChainId = Number(network.chainId)

      if (currentChainId !== FLARE_NETWORK_CONFIG.chainId) {
        console.log(`Connected to chain ${currentChainId}, Flare Network is ${FLARE_NETWORK_CONFIG.chainId}`)
        // Don't throw error - just log for user awareness
      }
    } catch (networkError) {
      console.warn("Could not check network:", networkError)
      // Continue with connection even if network check fails
    }

    return accounts[0]
  } catch (error: any) {
    console.error("Wallet connection failed:", error)

    if (error.code === 4001) {
      throw new Error("User rejected the connection request")
    } else if (error.code === -32002) {
      throw new Error("Wallet connection request is already pending. Please check your wallet.")
    } else if (error.message?.includes("timeout")) {
      throw new Error("Wallet connection timed out. Please try again.")
    } else {
      throw new Error("Failed to connect wallet. Please refresh and try again.")
    }
  }
}

export const isWalletAvailable = (): boolean => {
  return typeof window !== "undefined" && !!window.ethereum
}

export const getCurrentAccount = async (): Promise<string | null> => {
  if (!isWalletAvailable()) return null

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    })
    return accounts.length > 0 ? accounts[0] : null
  } catch (error) {
    console.error("Failed to get current account:", error)
    return null
  }
}

// Get user's HIKE token balance
export const getHikeTokenBalance = async (address: string): Promise<number> => {
  try {
    if (typeof window !== "undefined" && window.ethereum && HIKE_TOKEN_CONFIG.address !== "0x...") {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const tokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ]

      const tokenContract = new ethers.Contract(HIKE_TOKEN_CONFIG.address, tokenABI, provider)

      const balance = await tokenContract.balanceOf(address)
      return Number(balance) / Math.pow(10, HIKE_TOKEN_CONFIG.decimals)
    }
  } catch (error) {
    console.error("Failed to get HIKE token balance:", error)
  }

  // Return mock balance for demo
  return Math.floor(Math.random() * 10000) + 1000
}

// Calculate HIKE tokens earned based on climb data
export const calculateHikeReward = (climbData: Partial<ClimbData>): number => {
  if (!climbData.altitude || !climbData.difficulty) return 0

  const baseReward = climbData.altitude * 0.01 // 0.01 HIKE per meter
  const difficultyMultiplier = {
    easy: 1,
    moderate: 1.5,
    hard: 2,
    extreme: 3,
  }

  return baseReward * difficultyMultiplier[climbData.difficulty]
}

// Verify climb using Flare Data Connector (FDC)
export const verifyClimbWithFDC = async (climbData: ClimbData): Promise<boolean> => {
  // Implementation will use Flare's FDC for GPS and photo verification
  return true
}

export const verifyClimbWithStateConnector = async (climbData: ClimbData): Promise<boolean> => {
  try {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)

      // Prepare attestation request for GPS coordinates and timestamp verification
      const attestationRequest = {
        attestationType: "0x475053000000000000000000000000000000000000000000000000000000000", // GPS
        sourceId: "0x475053000000000000000000000000000000000000000000000000000000000", // GPS source
        requestBody: {
          coordinates: climbData.coordinates,
          timestamp: climbData.startTime.getTime(),
          altitude: climbData.altitude,
        },
      }

      // Submit to State Connector (simplified implementation)
      console.log("Submitting climb verification to State Connector:", attestationRequest)

      // In a real implementation, this would interact with the State Connector contract
      // For now, we'll simulate verification based on reasonable climb parameters
      const isValidAltitude = climbData.altitude > 0 && climbData.altitude < 9000 // Reasonable altitude range
      const isValidDuration = climbData.endTime.getTime() - climbData.startTime.getTime() > 300000 // At least 5 minutes
      const isValidDistance = climbData.distance > 0 && climbData.distance < 50000 // Reasonable distance in meters

      return isValidAltitude && isValidDuration && isValidDistance
    }
  } catch (error) {
    console.error("Failed to verify climb with State Connector:", error)
  }
  return false
}

export const getFTSOPrice = async (symbol: string): Promise<number> => {
  try {
    const provider = new ethers.JsonRpcProvider(FLARE_NETWORK_CONFIG.rpcUrl)

    const ftsoRegistryABI = [
      "function getCurrentPrice(string memory _symbol) external view returns (uint256 _price, uint256 _timestamp, uint256 _decimals)",
    ]

    const ftsoRegistry = new ethers.Contract(FLARE_NETWORK_CONFIG.ftsoRegistry, ftsoRegistryABI, provider)

    const [price, , decimals] = await ftsoRegistry.getCurrentPrice(symbol)
    return Number(price) / Math.pow(10, Number(decimals))
  } catch (error) {
    console.error("Failed to fetch FTSO price for", symbol, ":", error)

    const mockPrices: Record<string, number> = {
      FLR: 0.0234,
      BTC: 43250.67,
      ETH: 2456.89,
      XRP: 0.5234,
      ADA: 0.3456,
    }

    return mockPrices[symbol] || Math.random() * 100
  }
}

export const calculateHikeRewardWithFTSO = async (climbData: Partial<ClimbData>): Promise<number> => {
  if (!climbData.altitude || !climbData.difficulty) return 0

  // Get current FLR price to adjust rewards
  const flrPrice = await getFTSOPrice("FLR")
  const priceMultiplier = Math.max(0.5, Math.min(2, 1 / flrPrice)) // Adjust rewards based on FLR price

  const baseReward = climbData.altitude * 0.01 // 0.01 HIKE per meter
  const difficultyMultiplier = {
    easy: 1,
    moderate: 1.5,
    hard: 2,
    extreme: 3,
  }

  return baseReward * difficultyMultiplier[climbData.difficulty] * priceMultiplier
}

// Smart contract interactions
export const stakeHikeTokens = async (amount: number): Promise<boolean> => {
  try {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const stakingABI = [
        "function stake(uint256 amount) external",
        "function approve(address spender, uint256 amount) external returns (bool)",
      ]

      // First approve the staking contract to spend HIKE tokens
      const tokenContract = new ethers.Contract(HIKE_TOKEN_CONFIG.address, stakingABI, signer)

      const amountWei = ethers.parseUnits(amount.toString(), HIKE_TOKEN_CONFIG.decimals)

      // Approve spending (simplified - in reality would need staking contract address)
      console.log("Approving HIKE token spending for staking:", amount)

      // Stake tokens (simplified implementation)
      console.log("Staking HIKE tokens:", amount)

      return true
    }
  } catch (error) {
    console.error("Failed to stake HIKE tokens:", error)
  }
  return false
}

export const unstakeHikeTokens = async (amount: number): Promise<boolean> => {
  // Implementation will interact with staking contract
  return true
}

export const claimStakingRewards = async (): Promise<number> => {
  // Implementation will claim staking rewards
  return 0
}

// NFT minting for achievements
export const mintAchievementNFT = async (achievementData: Partial<NFTBadge>): Promise<string> => {
  try {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const nftABI = [
        "function mintAchievement(address to, string memory tokenURI, uint256 rarity) external returns (uint256)",
      ]

      // Simplified NFT minting (would need actual NFT contract address)
      console.log("Minting achievement NFT:", achievementData)

      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`

      return mockTxHash
    }
  } catch (error) {
    console.error("Failed to mint achievement NFT:", error)
  }
  return "0x0000000000000000000000000000000000000000000000000000000000000000"
}

// Declare global ethereum object for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
