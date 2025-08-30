"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/components/wallet-provider"
import { HIKE2EARN_CONTRACT_CONFIG } from "@/lib/web3"
import { diagnoseContract, testContractFunctions } from "@/lib/contract-diagnostic"
import { getBestProvider } from "@/lib/wallet-utils"

export interface Campaign {
  id: number
  name: string
  startDate: number
  endDate: number
  prizePoolETH: string
  participantCount: number
  isActive: boolean
  prizeDistributed: boolean
}

export interface Mountain {
  id: number
  name: string
  altitude: number
  location: string
  isActive: boolean
  campaignId: number
}

export interface ClimbingNFT {
  tokenId: number
  mountainName: string
  altitude: number
  climbDate: number
  climber: string
  verified: boolean
}

export function useHike2Earn() {
  const { isConnected, address } = useWallet()
  const [contract, setContract] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ethers, setEthers] = useState<any>(null)
  const [contractHealthy, setContractHealthy] = useState(false)
  const [initializationAttempts, setInitializationAttempts] = useState(0)

  // Initialize ethers and contract with comprehensive validation
  useEffect(() => {
    const initializeContract = async () => {
      console.log("🔄 Initializing Hike2Earn contract...", { 
        isConnected, 
        address,
        contractAddress: HIKE2EARN_CONTRACT_CONFIG.address
      })

      // Reset states
      setContract(null)
      setContractHealthy(false)
      setError(null)

      // Check if we should initialize
      if (!isConnected) {
        console.log("❌ Wallet not connected, skipping contract initialization")
        return
      }

      if (typeof window === "undefined") {
        console.log("❌ SSR environment, skipping contract initialization")
        return
      }

      // Validate contract configuration
      if (!HIKE2EARN_CONTRACT_CONFIG.address || HIKE2EARN_CONTRACT_CONFIG.address === "") {
        const errorMsg = "Contract address is not configured"
        console.error("❌", errorMsg)
        setError(errorMsg)
        return
      }

      if (!HIKE2EARN_CONTRACT_CONFIG.abi || !Array.isArray(HIKE2EARN_CONTRACT_CONFIG.abi)) {
        const errorMsg = "Contract ABI is not properly loaded"
        console.error("❌", errorMsg)
        setError(errorMsg)
        return
      }

      try {
        setInitializationAttempts(prev => prev + 1)
        
        // Get best provider instead of using window.ethereum directly
        const provider = getBestProvider()
        if (!provider) {
          throw new Error("No wallet provider available")
        }

        console.log("✅ Provider obtained, loading ethers...")

        // Dynamic import of ethers with error handling
        const ethersModule = await import("ethers")
        setEthers(ethersModule)

        console.log("✅ Ethers loaded, creating provider...")

        // Create ethers provider
        const ethersProvider = new ethersModule.ethers.BrowserProvider(provider)
        
        // Verify we can connect to the network
        const network = await ethersProvider.getNetwork()
        console.log("🌐 Connected to network:", Number(network.chainId))

        console.log("✅ Creating contract instance...")

        // Create contract instance
        const contractInstance = new ethersModule.ethers.Contract(
          HIKE2EARN_CONTRACT_CONFIG.address,
          HIKE2EARN_CONTRACT_CONFIG.abi,
          ethersProvider
        )

        console.log("✅ Contract instance created, testing functionality...")

        // Test basic contract functionality
        try {
          const campaignCount = await contractInstance.campaignCount()
          console.log("✅ Contract test successful, campaign count:", Number(campaignCount))
          
          setContract(contractInstance)
          setContractHealthy(true)
          setError(null)
          
          console.log("🎉 Contract initialization completed successfully!")
        } catch (testError: any) {
          console.error("❌ Contract test failed:", testError.message)
          throw new Error(`Contract is deployed but not functional: ${testError.message}`)
        }

      } catch (err: any) {
        console.error("❌ Contract initialization failed:", err)
        
        // Provide more specific error messages
        let errorMessage = "Failed to initialize contract"
        
        if (err.message?.includes("could not detect network")) {
          errorMessage = "Unable to detect network. Please check your wallet connection."
        } else if (err.message?.includes("No wallet provider")) {
          errorMessage = "No wallet provider available. Please install MetaMask."
        } else if (err.message?.includes("Contract is deployed but not functional")) {
          errorMessage = err.message
        } else if (err.code === "NETWORK_ERROR") {
          errorMessage = "Network error. Please check your internet connection and try again."
        } else if (err.message) {
          errorMessage = err.message
        }
        
        setError(errorMessage)
        setContract(null)
        setContractHealthy(false)

        // Run diagnostic if initialization fails multiple times
        if (initializationAttempts >= 2) {
          console.log("🏥 Running contract diagnostic due to repeated failures...")
          diagnoseContract().then(diagnostic => {
            console.group("🏥 Contract Diagnostic Results")
            console.log("Contract Address Valid:", diagnostic.isValidAddress)
            console.log("Contract Deployed:", diagnostic.contractDeployed)
            console.log("Provider Available:", diagnostic.providerAvailable)
            console.log("Errors:", diagnostic.errors)
            console.log("Recommendations:", diagnostic.recommendations)
            console.groupEnd()
          })
        }
      }
    }

    initializeContract()
  }, [isConnected, initializationAttempts])

  // Get campaign count
  const getCampaignCount = async (): Promise<number> => {
    if (!contract) return 0
    try {
      setIsLoading(true)
      const count = await contract.campaignCount()
      return Number(count)
    } catch (err: any) {
      setError(err.message || "Failed to get campaign count")
      return 0
    } finally {
      setIsLoading(false)
    }
  }

  // Get campaign info
  const getCampaignInfo = async (campaignId: number): Promise<Campaign | null> => {
    if (!contract) return null
    try {
      setIsLoading(true)
      const info = await contract.getCampaignInfo(campaignId)
      return {
        id: campaignId,
        name: info[0],
        startDate: Number(info[1]),
        endDate: Number(info[2]),
        prizePoolETH: ethers.ethers.formatEther(info[3]),
        participantCount: Number(info[4]),
        isActive: info[5],
        prizeDistributed: info[6]
      }
    } catch (err: any) {
      setError(err.message || "Failed to get campaign info")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Get all campaigns with robust error handling
  const getAllCampaigns = async (): Promise<Campaign[]> => {
    if (!contract || !contractHealthy) {
      console.warn("⚠️ Contract not initialized or unhealthy, cannot fetch campaigns")
      setError("Contract not available. Please check your wallet connection.")
      return []
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log("📊 Fetching campaign count...")
      const count = await getCampaignCount()
      console.log("📊 Found campaigns:", count)
      
      if (count === 0) {
        console.log("ℹ️ No campaigns found in contract")
        return []
      }
      
      const campaigns: Campaign[] = []
      const errors: string[] = []
      
      // Fetch campaigns in parallel for better performance
      const campaignPromises = Array.from({ length: count }, (_, i) => 
        getCampaignInfo(i).catch(error => {
          errors.push(`Failed to fetch campaign ${i}: ${error.message}`)
          return null
        })
      )
      
      console.log("📊 Fetching campaign details...")
      const campaignResults = await Promise.all(campaignPromises)
      
      // Filter out null results and add valid campaigns
      campaignResults.forEach((campaign, index) => {
        if (campaign) {
          campaigns.push(campaign)
        } else {
          console.warn(`⚠️ Campaign ${index} could not be loaded`)
        }
      })
      
      if (errors.length > 0) {
        console.warn("⚠️ Some campaigns failed to load:", errors)
        setError(`Loaded ${campaigns.length}/${count} campaigns. Some campaigns may be corrupted.`)
      }
      
      console.log("✅ Successfully loaded campaigns:", campaigns.length)
      return campaigns
      
    } catch (error: any) {
      console.error("❌ Failed to get all campaigns:", error)
      const errorMessage = `Failed to load campaigns: ${error.message || 'Unknown error'}`
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Get mountain count
  const getMountainCount = async (): Promise<number> => {
    if (!contract) return 0
    try {
      setIsLoading(true)
      const count = await contract.mountainCount()
      return Number(count)
    } catch (err: any) {
      setError(err.message || "Failed to get mountain count")
      return 0
    } finally {
      setIsLoading(false)
    }
  }

  // Get mountain info
  const getMountainInfo = async (mountainId: number): Promise<Mountain | null> => {
    if (!contract) return null
    try {
      setIsLoading(true)
      const info = await contract.mountains(mountainId)
      return {
        id: mountainId,
        name: info[0],
        altitude: Number(info[1]),
        location: info[2],
        isActive: info[3],
        campaignId: Number(info[4])
      }
    } catch (err: any) {
      setError(err.message || "Failed to get mountain info")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Get user's NFTs
  const getUserNFTs = async (userAddress?: string): Promise<number[]> => {
    if (!contract) return []
    const targetAddress = userAddress || address
    if (!targetAddress) return []

    try {
      setIsLoading(true)
      const nftIds = await contract.getParticipantNFTs(targetAddress)
      return nftIds.map((id: any) => Number(id))
    } catch (err: any) {
      setError(err.message || "Failed to get user NFTs")
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Get NFT info
  const getNFTInfo = async (tokenId: number): Promise<ClimbingNFT | null> => {
    if (!contract) return null
    try {
      setIsLoading(true)
      const info = await contract.getNFTInfo(tokenId)
      return {
        tokenId,
        mountainName: info[0],
        altitude: Number(info[1]),
        climbDate: Number(info[2]),
        climber: info[3],
        verified: info[4]
      }
    } catch (err: any) {
      setError(err.message || "Failed to get NFT info")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Mint climbing NFT (requires signer)
  const mintClimbingNFT = async (mountainId: number, proofURI: string): Promise<string | null> => {
    if (!contract || !isConnected) return null
    
    try {
      setIsLoading(true)
      const provider = new ethers.ethers.BrowserProvider(window.ethereum!)
      const signer = await provider.getSigner()
      const contractWithSigner = contract.connect(signer)
      
      const tx = await contractWithSigner.mintClimbingNFT(mountainId, proofURI)
      const receipt = await tx.wait()
      
      // Extract token ID from events
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.ethers.id("NFTMinted(uint256,address,uint256,string,uint256,uint256)")
      )
      
      if (event) {
        const tokenId = ethers.ethers.AbiCoder.defaultAbiCoder().decode(
          ["uint256"], 
          event.topics[1]
        )[0]
        return tokenId.toString()
      }
      
      return receipt.hash
    } catch (err: any) {
      setError(err.message || "Failed to mint NFT")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  // Create campaign with robust error handling
  const createCampaign = async (name: string, startDate: number, endDate: number): Promise<string | null> => {
    if (!contract || !contractHealthy || !isConnected) {
      const errorMsg = !isConnected ? "Wallet not connected" : "Contract not available"
      console.error("❌ Cannot create campaign:", errorMsg)
      setError(errorMsg)
      return null
    }
    
    try {
      setIsLoading(true)
      setError(null)
      
      console.log("🚀 Creating campaign:", { name, startDate, endDate })
      
      // Get the best provider and create signer
      const provider = getBestProvider()
      if (!provider) {
        throw new Error("No wallet provider available")
      }
      
      const ethersProvider = new ethers.ethers.BrowserProvider(provider)
      const signer = await ethersProvider.getSigner()
      const contractWithSigner = contract.connect(signer)
      
      console.log("📝 Sending transaction...")
      
      // Create the campaign
      const tx = await contractWithSigner.createCampaign(name, startDate, endDate)
      console.log("⏳ Transaction sent, waiting for confirmation...", tx.hash)
      
      const receipt = await tx.wait()
      console.log("✅ Campaign created successfully!", receipt.hash)
      
      return receipt.hash
    } catch (err: any) {
      console.error("❌ Failed to create campaign:", err)
      
      let errorMessage = "Failed to create campaign"
      
      if (err.code === 4001) {
        errorMessage = "Transaction was rejected by user"
      } else if (err.code === -32603) {
        errorMessage = "Transaction failed. Please check if you have sufficient funds and try again."
      } else if (err.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient funds to create campaign"
      } else if (err.message?.includes("execution reverted")) {
        errorMessage = "Contract execution failed. You may not have permission to create campaigns."
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Sponsor campaign with ETH
  const sponsorCampaign = async (
    campaignId: number, 
    sponsorName: string, 
    logoURI: string, 
    ethAmount: string
  ): Promise<string | null> => {
    if (!contract || !isConnected) return null
    
    try {
      setIsLoading(true)
      const provider = new ethers.ethers.BrowserProvider(window.ethereum!)
      const signer = await provider.getSigner()
      const contractWithSigner = contract.connect(signer)
      
      const tx = await contractWithSigner.sponsorCampaign(
        campaignId, 
        sponsorName, 
        logoURI,
        { value: ethers.ethers.parseEther(ethAmount) }
      )
      const receipt = await tx.wait()
      
      return receipt.hash
    } catch (err: any) {
      setError(err.message || "Failed to sponsor campaign")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    contract,
    isLoading,
    error,
    setError,
    contractHealthy,
    initializationAttempts,
    
    // Read functions
    getCampaignCount,
    getCampaignInfo,
    getAllCampaigns,
    getMountainCount,
    getMountainInfo,
    getUserNFTs,
    getNFTInfo,
    
    // Write functions (require wallet connection)
    mintClimbingNFT,
    createCampaign,
    sponsorCampaign,
  }
}