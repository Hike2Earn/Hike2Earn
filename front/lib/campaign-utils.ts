import { z } from "zod"
import { Campaign, createCampaignOnChain, joinCampaignOnChain, startClimbOnChain, completeCampaignOnChain } from "./web3"

// ===============================
// VALIDATION SCHEMAS
// ===============================

// Campaign creation validation schema
export const campaignCreationSchema = z.object({
  name: z.string().min(3, "Campaign name must be at least 3 characters").max(100, "Campaign name must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  startDate: z.number().min(Math.floor(Date.now() / 1000) - 86400, "Start date must be today or in the future"),
  endDate: z.number(),
  prizePoolETH: z.number().min(0, "Prize pool must be positive").max(10, "Prize pool cannot exceed 10 LSK"),
  mountainIds: z.array(z.number()).min(1, "Select at least one mountain").max(10, "Cannot select more than 10 mountains"),
  erc20Tokens: z.array(z.string()).optional().default([]),
  erc20Amounts: z.array(z.number()).optional().default([]),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"]
}).refine((data) => {
  // Campaign duration cannot exceed 1 year
  const maxDuration = 365 * 24 * 60 * 60 // 1 year in seconds
  return (data.endDate - data.startDate) <= maxDuration
}, {
  message: "Campaign duration cannot exceed 1 year",
  path: ["endDate"]
}).refine((data) => {
  // ERC20 tokens and amounts must have same length
  return data.erc20Tokens.length === data.erc20Amounts.length
}, {
  message: "ERC20 tokens and amounts must match",
  path: ["erc20Tokens"]
})

// Mountain data validation
export const mountainSelectionSchema = z.object({
  mountainIds: z.array(z.number()).min(1, "Select at least one mountain")
})

// Campaign join validation
export const campaignJoinSchema = z.object({
  campaignId: z.string().min(1, "Campaign ID is required"),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address")
})

// ===============================
// CAMPAIGN UTILITIES
// ===============================

// Validate campaign creation data
export const validateCampaignCreation = (data: any): { success: boolean; data?: any; errors?: any } => {
  try {
    const validated = campaignCreationSchema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.flatten() }
    }
    return { success: false, errors: { _errors: ["Unknown validation error"] } }
  }
}

// Calculate campaign duration in days
export const calculateCampaignDuration = (startDate: number, endDate: number): number => {
  return Math.ceil((endDate - startDate) / (24 * 60 * 60))
}

// Check if campaign is active
export const isCampaignActive = (campaign: Campaign): boolean => {
  const now = Math.floor(Date.now() / 1000)
  return campaign.isActive && 
         campaign.startDate <= now && 
         campaign.endDate >= now && 
         !campaign.prizeDistributed
}

// Check if user can join campaign
export const canUserJoinCampaign = (campaign: Campaign, userAddress: string): boolean => {
  if (!isCampaignActive(campaign)) return false
  if (campaign.participants.includes(userAddress)) return false
  if (campaign.participants.length >= 50) return false // Assuming max participants limit
  
  return true
}

// Format campaign dates for display
export const formatCampaignDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Calculate campaign progress (based on time)
export const calculateCampaignProgress = (campaign: Campaign): number => {
  const now = Math.floor(Date.now() / 1000)
  if (now < campaign.startDate) return 0
  if (now > campaign.endDate) return 100
  
  const totalDuration = campaign.endDate - campaign.startDate
  const elapsed = now - campaign.startDate
  
  return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
}

// Get campaign status
export const getCampaignStatus = (campaign: Campaign): 'upcoming' | 'active' | 'completed' | 'ended' => {
  const now = Math.floor(Date.now() / 1000)
  
  if (now < campaign.startDate) return 'upcoming'
  if (now > campaign.endDate) return campaign.prizeDistributed ? 'completed' : 'ended'
  if (campaign.isActive) return 'active'
  
  return 'ended'
}

// ===============================
// CAMPAIGN OPERATIONS
// ===============================

// Create campaign with validation
export const createCampaign = async (campaignData: any): Promise<{ success: boolean; campaignId?: string; error?: string }> => {
  try {
    // Validate data
    const validation = validateCampaignCreation(campaignData)
    if (!validation.success) {
      return { success: false, error: "Validation failed: " + JSON.stringify(validation.errors) }
    }

    // Create campaign on blockchain
    const campaignId = await createCampaignOnChain(validation.data!)
    
    if (!campaignId) {
      return { success: false, error: "Failed to create campaign on blockchain" }
    }

    return { success: true, campaignId }
    
  } catch (error) {
    console.error("Campaign creation error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

// Join campaign with validation
export const joinCampaign = async (campaignId: string, userAddress: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate join data
    const validation = campaignJoinSchema.safeParse({ campaignId, userAddress })
    if (!validation.success) {
      return { success: false, error: "Invalid campaign join data" }
    }

    // Join campaign on blockchain
    const success = await joinCampaignOnChain(campaignId)
    
    if (!success) {
      return { success: false, error: "Failed to join campaign on blockchain" }
    }

    return { success: true }
    
  } catch (error) {
    console.error("Campaign join error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

// Start climb for campaign
export const startCampaignClimb = async (campaignId: string, mountainId: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const success = await startClimbOnChain(campaignId, mountainId)
    
    if (!success) {
      return { success: false, error: "Failed to start climb on blockchain" }
    }

    return { success: true }
    
  } catch (error) {
    console.error("Campaign climb start error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

// ===============================
// CAMPAIGN DATA HELPERS
// ===============================

// Get campaign difficulty based on selected mountains
export const calculateCampaignDifficulty = (mountainIds: number[]): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
  // This would map mountain IDs to their difficulties
  // For now, we'll use a simple logic
  if (mountainIds.some(id => [1, 2].includes(id))) return 'expert' // Aconcagua, Mercedario
  if (mountainIds.some(id => [3, 4].includes(id))) return 'advanced' // Tupungato, Plata
  if (mountainIds.some(id => [5, 6].includes(id))) return 'intermediate' // El Plomo, Vallecitos
  return 'beginner'
}

// Calculate estimated campaign rewards
export const calculateTotalCampaignRewards = (mountainIds: number[], prizePoolETH: number): number => {
  // Mountain rewards mapping (this should match the data from map-widget)
  const mountainRewards = {
    1: 2500, // Aconcagua
    2: 2200, // Mercedario
    3: 1800, // Tupungato
    4: 1500, // Plata
    5: 800,  // El Plomo
    6: 900   // Vallecitos
  }

  const baseRewards = mountainIds.reduce((total, id) => {
    return total + (mountainRewards[id as keyof typeof mountainRewards] || 0)
  }, 0)

  // Add ETH pool converted to HIKE tokens (simplified conversion)
  const ethToHikeMultiplier = 1000 // 1 ETH = 1000 HIKE tokens (for demo)
  const ethRewards = prizePoolETH * ethToHikeMultiplier

  return baseRewards + ethRewards
}

// Generate campaign metadata for storage
export const generateCampaignMetadata = (campaignData: any): any => {
  return {
    name: campaignData.name,
    description: campaignData.description,
    image: `/campaigns/campaign-${Date.now()}.jpg`,
    attributes: [
      { trait_type: "Duration", value: calculateCampaignDuration(campaignData.startDate, campaignData.endDate) + " days" },
      { trait_type: "Mountains", value: campaignData.mountainIds.length },
      { trait_type: "Difficulty", value: calculateCampaignDifficulty(campaignData.mountainIds) },
      { trait_type: "Prize Pool", value: campaignData.prizePoolETH + " ETH" },
      { trait_type: "Created", value: new Date().toISOString() }
    ]
  }
}

// Validate ERC20 token addresses
export const validateERC20Addresses = (addresses: string[]): boolean => {
  const validAddressRegex = /^0x[a-fA-F0-9]{40}$/
  return addresses.every(address => validAddressRegex.test(address))
}

// ===============================
// ERROR HANDLING
// ===============================

export class CampaignError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'CampaignError'
  }
}

export const handleCampaignError = (error: unknown): string => {
  if (error instanceof CampaignError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred"
}