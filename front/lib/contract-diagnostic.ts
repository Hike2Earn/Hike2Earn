/**
 * Contract diagnostic utilities for debugging Hike2Earn contract issues
 */

import { HIKE2EARN_CONTRACT_CONFIG } from "./web3"
import { getBestProvider } from "./wallet-utils"

export interface ContractDiagnostic {
  contractAddress: string
  isValidAddress: boolean
  contractDeployed: boolean
  abiLoaded: boolean
  providerAvailable: boolean
  networkCorrect: boolean
  contractCallsWork: boolean
  errors: string[]
  recommendations: string[]
  debugInfo: {
    networkId?: number
    blockNumber?: number
    contractCodeSize?: number
    gasEstimate?: string
  }
}

/**
 * Perform comprehensive contract diagnostic
 */
export async function diagnoseContract(): Promise<ContractDiagnostic> {
  const diagnostic: ContractDiagnostic = {
    contractAddress: HIKE2EARN_CONTRACT_CONFIG.address,
    isValidAddress: false,
    contractDeployed: false,
    abiLoaded: false,
    providerAvailable: false,
    networkCorrect: false,
    contractCallsWork: false,
    errors: [],
    recommendations: [],
    debugInfo: {}
  }

  console.group("🔍 Contract Diagnostic Starting...")

  // Check if contract address is valid
  try {
    if (HIKE2EARN_CONTRACT_CONFIG.address && HIKE2EARN_CONTRACT_CONFIG.address !== "") {
      const addressRegex = /^0x[a-fA-F0-9]{40}$/
      diagnostic.isValidAddress = addressRegex.test(HIKE2EARN_CONTRACT_CONFIG.address)
      
      if (!diagnostic.isValidAddress) {
        diagnostic.errors.push("Contract address format is invalid")
        diagnostic.recommendations.push("Verify the contract address in contracts.ts")
      } else {
        console.log("✅ Contract address format is valid")
      }
    } else {
      diagnostic.errors.push("Contract address is empty or undefined")
      diagnostic.recommendations.push("Set the contract address in contracts.ts")
    }
  } catch (error) {
    diagnostic.errors.push("Error checking contract address")
  }

  // Check if ABI is loaded
  try {
    if (HIKE2EARN_CONTRACT_CONFIG.abi && Array.isArray(HIKE2EARN_CONTRACT_CONFIG.abi) && HIKE2EARN_CONTRACT_CONFIG.abi.length > 0) {
      diagnostic.abiLoaded = true
      console.log("✅ Contract ABI is loaded")
    } else {
      diagnostic.errors.push("Contract ABI is missing or empty")
      diagnostic.recommendations.push("Ensure Hike2Earn.json artifact is properly imported")
    }
  } catch (error) {
    diagnostic.errors.push("Error loading contract ABI")
  }

  // Check provider availability
  try {
    const provider = getBestProvider()
    if (provider) {
      diagnostic.providerAvailable = true
      console.log("✅ Provider is available")
    } else {
      diagnostic.errors.push("No wallet provider available")
      diagnostic.recommendations.push("Install MetaMask or another Web3 wallet")
    }
  } catch (error) {
    diagnostic.errors.push("Error checking provider availability")
  }

  // If we have a provider, check network and contract deployment
  if (diagnostic.providerAvailable && diagnostic.isValidAddress) {
    try {
      const { ethers } = await import("ethers")
      const provider = getBestProvider()
      
      if (provider) {
        const ethersProvider = new ethers.BrowserProvider(provider)
        
        // Check network
        try {
          const network = await ethersProvider.getNetwork()
          diagnostic.debugInfo.networkId = Number(network.chainId)
          
          // For Lisk Network (1135) or development (31337)
          if (diagnostic.debugInfo.networkId === 1135 || diagnostic.debugInfo.networkId === 31337) {
            diagnostic.networkCorrect = true
            console.log("✅ Connected to correct network")
          } else {
            diagnostic.errors.push(`Connected to wrong network. Expected 1135 (Lisk) or 31337 (Local), got ${diagnostic.debugInfo.networkId}`)
            diagnostic.recommendations.push("Switch to Lisk Network in your wallet")
          }
        } catch (networkError) {
          diagnostic.errors.push("Failed to check network")
        }

        // Check contract deployment
        try {
          const code = await ethersProvider.getCode(HIKE2EARN_CONTRACT_CONFIG.address)
          diagnostic.debugInfo.contractCodeSize = code.length
          
          if (code && code !== "0x") {
            diagnostic.contractDeployed = true
            console.log("✅ Contract is deployed")
            
            // Try to create contract instance and test basic calls
            try {
              const contract = new ethers.Contract(
                HIKE2EARN_CONTRACT_CONFIG.address,
                HIKE2EARN_CONTRACT_CONFIG.abi,
                ethersProvider
              )
              
              // Test a simple read call
              const campaignCount = await contract.campaignCount()
              diagnostic.contractCallsWork = true
              console.log("✅ Contract calls work, campaign count:", Number(campaignCount))
              
              diagnostic.debugInfo.gasEstimate = "Contract calls functional"
            } catch (callError: any) {
              diagnostic.errors.push(`Contract calls fail: ${callError.message}`)
              diagnostic.recommendations.push("Check if contract ABI matches deployed contract")
            }
          } else {
            diagnostic.errors.push("No contract code at the specified address")
            diagnostic.recommendations.push("Deploy the contract or check the address")
          }
        } catch (deployError) {
          diagnostic.errors.push("Failed to check contract deployment")
        }

        // Get current block number
        try {
          const blockNumber = await ethersProvider.getBlockNumber()
          diagnostic.debugInfo.blockNumber = blockNumber
        } catch (blockError) {
          // Not critical, just debug info
        }
      }
    } catch (error: any) {
      diagnostic.errors.push(`Provider initialization failed: ${error.message}`)
    }
  }

  // Generate recommendations based on findings
  if (diagnostic.errors.length === 0 && diagnostic.contractCallsWork) {
    diagnostic.recommendations.push("Contract is fully functional")
  } else if (diagnostic.errors.length > 3) {
    diagnostic.recommendations.push("Multiple issues detected - check wallet connection and contract deployment")
  }

  console.groupEnd()
  
  return diagnostic
}

/**
 * Test specific contract functions
 */
export async function testContractFunctions(): Promise<{
  campaignCount: number | null
  mountainCount: number | null
  errors: string[]
}> {
  const result = {
    campaignCount: null as number | null,
    mountainCount: null as number | null,
    errors: [] as string[]
  }

  try {
    const { ethers } = await import("ethers")
    const provider = getBestProvider()
    
    if (!provider) {
      result.errors.push("No provider available")
      return result
    }

    const ethersProvider = new ethers.BrowserProvider(provider)
    const contract = new ethers.Contract(
      HIKE2EARN_CONTRACT_CONFIG.address,
      HIKE2EARN_CONTRACT_CONFIG.abi,
      ethersProvider
    )

    // Test campaignCount
    try {
      const count = await contract.campaignCount()
      result.campaignCount = Number(count)
      console.log("📊 Campaign count:", result.campaignCount)
    } catch (error: any) {
      result.errors.push(`campaignCount failed: ${error.message}`)
    }

    // Test mountainCount
    try {
      const count = await contract.mountainCount()
      result.mountainCount = Number(count)
      console.log("⛰️ Mountain count:", result.mountainCount)
    } catch (error: any) {
      result.errors.push(`mountainCount failed: ${error.message}`)
    }

  } catch (error: any) {
    result.errors.push(`Contract function test failed: ${error.message}`)
  }

  return result
}

/**
 * Get contract creation cost estimate
 */
export async function estimateContractGas(): Promise<{
  createCampaign?: string
  sponsorCampaign?: string
  mintNFT?: string
  errors: string[]
}> {
  const result = {
    errors: [] as string[]
  }

  try {
    const { ethers } = await import("ethers")
    const provider = getBestProvider()
    
    if (!provider) {
      result.errors.push("No provider available")
      return result
    }

    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = await ethersProvider.getSigner()
    const contract = new ethers.Contract(
      HIKE2EARN_CONTRACT_CONFIG.address,
      HIKE2EARN_CONTRACT_CONFIG.abi,
      signer
    )

    // Estimate createCampaign gas
    try {
      const gasEstimate = await contract.createCampaign.estimateGas(
        "Test Campaign",
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 86400
      )
      result.createCampaign = ethers.formatUnits(gasEstimate, "gwei") + " gwei"
    } catch (error: any) {
      result.errors.push(`createCampaign gas estimation failed: ${error.message}`)
    }

  } catch (error: any) {
    result.errors.push(`Gas estimation failed: ${error.message}`)
  }

  return result
}

/**
 * Auto-run diagnostics in development mode
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  setTimeout(async () => {
    const diagnostic = await diagnoseContract()
    console.log("🏥 Contract Health Check:", {
      healthy: diagnostic.contractCallsWork && diagnostic.errors.length === 0,
      errors: diagnostic.errors.length,
      recommendations: diagnostic.recommendations.length
    })
  }, 2000)
}