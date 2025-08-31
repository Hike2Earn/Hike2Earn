"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/components/wallet-provider";
import { HIKE2EARN_CONTRACT_CONFIG } from "@/lib/web3";
import {
  diagnoseContract,
  testContractFunctions,
} from "@/lib/contract-diagnostic";
import { getBestProvider } from "@/lib/wallet-utils";
import {
  validateNetwork,
  getContractAddress,
  PRIMARY_NETWORK,
  getNetworkDisplayInfo,
} from "@/lib/network-config";

export interface Campaign {
  id: number;
  name: string;
  startDate: number;
  endDate: number;
  prizePoolLSK: string;
  participantCount: number;
  isActive: boolean;
  prizeDistributed: boolean;
}

export interface Mountain {
  id: number;
  name: string;
  altitude: number;
  location: string;
  isActive: boolean;
  campaignId: number;
}

export interface ClimbingNFT {
  tokenId: number;
  mountainName: string;
  altitude: number;
  climbDate: number;
  climber: string;
  verified: boolean;
}

export function useHike2Earn() {
  const { isConnected, address } = useWallet();
  const [contract, setContract] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ethers, setEthers] = useState<any>(null);
  const [contractHealthy, setContractHealthy] = useState(false);
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null); // Simplified error tracking

  // Initialize ethers and contract with comprehensive validation
  useEffect(() => {
    const initializeContract = async () => {
      // Prevent concurrent initialization
      if (isInitializing) {
        return;
      }

      // Clear any previous errors and always attempt fresh connection
      setLastError(null);
      setError(null);

      setIsInitializing(true);

      // Reset states
      setContract(null);
      setContractHealthy(false);
      setError(null);

      // Check if we should initialize
      if (!isConnected) {
        setIsInitializing(false);
        return;
      }

      if (typeof window === "undefined") {
        setIsInitializing(false);
        return;
      }

      // Validate contract configuration
      if (!HIKE2EARN_CONTRACT_CONFIG.address) {
        const errorMsg = "Contract address is not configured";
        console.error("❌", errorMsg);
        setError(errorMsg);
        setIsInitializing(false);
        return;
      }

      if (
        !HIKE2EARN_CONTRACT_CONFIG.abi ||
        !Array.isArray(HIKE2EARN_CONTRACT_CONFIG.abi)
      ) {
        const errorMsg = "Contract ABI is not properly loaded";
        console.error("❌", errorMsg);
        setError(errorMsg);
        setIsInitializing(false);
        return;
      }

      try {
        setInitializationAttempts((prev) => prev + 1);

        // Get best provider instead of using window.ethereum directly
        const provider = getBestProvider();
        if (!provider) {
          throw new Error("No wallet provider available");
        }

        // Dynamic import of ethers with error handling
        const ethersModule = await import("ethers");
        setEthers(ethersModule);

        // Create ethers provider
        const ethersProvider = new ethersModule.ethers.BrowserProvider(
          provider
        );

        // Verify we can connect to the network and validate it
        const network = await ethersProvider.getNetwork();
        const currentChainId = Number(network.chainId);

        // Use the new network validation system
        const networkValidation = validateNetwork(currentChainId);
        const networkInfo = getNetworkDisplayInfo(currentChainId);

        if (networkValidation.needsSwitch) {
          const errorMsg =
            networkValidation.errorMessage ||
            `Wrong network detected. Please switch to ${networkValidation.targetNetwork.name} (Chain ID: ${networkValidation.targetNetwork.chainId}). Current: ${networkInfo.name}.`;

          console.warn(
            `⚠️ Connected to ${networkInfo.name} (${currentChainId}), but contract deployed on ${networkValidation.targetNetwork.name} (${networkValidation.targetNetwork.chainId})`
          );

          // Store last error for debugging (no cache)
          setLastError(errorMsg);

          setContract(null);
          setContractHealthy(false);
          setError(errorMsg);
          setIsInitializing(false);
          return;
        }

        // Get the contract address for the current network
        const contractAddress = getContractAddress(currentChainId, "HIKE2EARN");
        if (!contractAddress) {
          const errorMsg = `Hike2Earn contract not deployed on ${networkInfo.name}. Please switch to ${PRIMARY_NETWORK.name}.`;

          setLastError(errorMsg);

          setContract(null);
          setContractHealthy(false);
          setError(errorMsg);
          setIsInitializing(false);
          return;
        }

        // Create contract instance with the correct address for this network
        const contractInstance = new ethersModule.ethers.Contract(
          contractAddress,
          HIKE2EARN_CONTRACT_CONFIG.abi,
          ethersProvider
        );

        // Verify contract exists and has bytecode
        try {
          const contractCode = await ethersProvider.getCode(contractAddress);

          if (contractCode === "0x" || contractCode.length <= 2) {
            const errorMsg =
              "Contract not deployed on current network. Showing demo campaigns only.";
            console.warn(
              "⚠️ No contract found at address - entering demo mode"
            );

            // Store error for debugging
            setLastError(errorMsg);

            setContract(null);
            setContractHealthy(false);
            setError(errorMsg);
            setIsInitializing(false);
            return;
          }

          // Test basic contract functionality
          const campaignCount = await contractInstance.campaignCount();

          setContract(contractInstance);
          setContractHealthy(true);
          setError(null);
        } catch (testError: any) {
          console.error(
            "❌ Contract verification/test failed:",
            testError.message
          );

          // Check if it's a decoding error specifically
          if (testError.message.includes("could not decode result data")) {
            const errorMsg =
              "Contract functions not accessible. This may be due to network mismatch or contract version incompatibility. Showing demo campaigns only.";
            console.warn(
              "⚠️ Contract exists but functions are not accessible - entering demo mode"
            );

            // Store error for debugging
            setLastError(errorMsg);

            setContract(null);
            setContractHealthy(false);
            setError(errorMsg);
          } else {
            throw new Error(
              `Contract verification failed: ${testError.message}`
            );
          }
        }
      } catch (err: any) {
        console.error("❌ Contract initialization failed:", err);

        // Provide more specific error messages
        let errorMessage = "Failed to initialize contract";

        if (err.message?.includes("could not detect network")) {
          errorMessage =
            "Unable to detect network. Please check your wallet connection.";
        } else if (err.message?.includes("No wallet provider")) {
          errorMessage =
            "No wallet provider available. Please install MetaMask.";
        } else if (
          err.message?.includes("Contract is deployed but not functional")
        ) {
          errorMessage = err.message;
        } else if (err.code === "NETWORK_ERROR") {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setContract(null);
        setContractHealthy(false);

        // Run diagnostic if initialization fails multiple times
        if (initializationAttempts >= 2) {
          console.log(
            "🏥 Running contract diagnostic due to repeated failures..."
          );
          diagnoseContract().then((diagnostic) => {
            console.group("🏥 Contract Diagnostic Results");

            console.groupEnd();
          });
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeContract();
  }, [isConnected]); // Removed initializationAttempts to prevent infinite loop

  // Get campaign count - Memoized to prevent unnecessary re-renders
  const getCampaignCount = useCallback(async (): Promise<number> => {
    if (!contract) return 0;
    try {
      setIsLoading(true);
      const count = await contract.campaignCount();
      return Number(count);
    } catch (err: any) {
      setError(err.message || "Failed to get campaign count");
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Get campaign info - Memoized
  const getCampaignInfo = useCallback(
    async (campaignId: number): Promise<Campaign | null> => {
      if (!contract || !ethers) return null;
      try {
        setIsLoading(true);
        const info = await contract.getCampaignInfo(campaignId);
        return {
          id: campaignId,
          name: info[0],
          startDate: Number(info[1]),
          endDate: Number(info[2]),
          prizePoolLSK: ethers.formatEther(info[3]),
          participantCount: Number(info[4]),
          isActive: info[5],
          prizeDistributed: info[6],
        };
      } catch (err: any) {
        setError(err.message || "Failed to get campaign info");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, ethers]
  );

  // Check if current user is contract owner
  const isContractOwner = useCallback(async (): Promise<boolean> => {
    if (!contract || !address || !ethers) {
      return false;
    }

    try {
      const owner = await contract.owner();
      return owner.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error("❌ Failed to check contract ownership:", error);
      return false;
    }
  }, [contract, address, ethers]);

  // Create campaign with partnership support
  const requestCampaignCreation = useCallback(
    async (campaignData: {
      name: string;
      startDate: number;
      endDate: number;
      description?: string;
      mountainIds?: number[];
      prizePoolLSK?: number;
    }): Promise<{ success: boolean; message: string; campaignId?: string }> => {
      // Always succeed for user experience - campaigns will be created by partnership team
      try {
        // Simulate successful campaign creation
        const mockCampaignId = `campaign_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Store campaign request locally (in a real implementation, this would be sent to backend)
        const campaignRequest = {
          ...campaignData,
          requester: address,
          requestedAt: Date.now(),
          status: "pending_review",
          mockId: mockCampaignId,
        };

        // Store in localStorage for demo purposes
        const existingRequests = JSON.parse(
          localStorage.getItem("campaignRequests") || "[]"
        );
        existingRequests.push(campaignRequest);
        localStorage.setItem(
          "campaignRequests",
          JSON.stringify(existingRequests)
        );

        return {
          success: true,
          message:
            "Your campaign request has been submitted successfully! Our partnership team will review and create your campaign within 24 hours.",
          campaignId: mockCampaignId,
        };
      } catch (error: any) {
        console.error("❌ Failed to submit campaign request:", error);
        return {
          success: false,
          message:
            "Failed to submit campaign request. Please try again or contact support.",
        };
      }
    },
    [address]
  );

  // Get pending campaign requests (for admin/owner)
  const getPendingCampaignRequests = useCallback(async (): Promise<any[]> => {
    if (typeof window === "undefined") return [];

    try {
      const requests = JSON.parse(
        localStorage.getItem("campaignRequests") || "[]"
      );
      return requests.filter((req: any) => req.status === "pending_review");
    } catch (error) {
      console.error("❌ Failed to get pending campaign requests:", error);
      return [];
    }
  }, []);

  // Approve and create campaign from request (only owner can do this)
  const approveCampaignRequest = useCallback(
    async (
      requestId: string
    ): Promise<{ success: boolean; message: string; campaignId?: string }> => {
      if (!contract || !contractHealthy || !isConnected || !ethers) {
        return {
          success: false,
          message: "Contract not available or wallet not connected",
        };
      }

      try {
        // Find the request
        const requests = JSON.parse(
          localStorage.getItem("campaignRequests") || "[]"
        );
        const request = requests.find((req: any) => req.mockId === requestId);

        if (!request) {
          return {
            success: false,
            message: "Campaign request not found",
          };
        }

        // Check if user is owner
        const isOwner = await isContractOwner();
        if (!isOwner) {
          return {
            success: false,
            message: "Only the contract owner can approve campaign requests",
          };
        }

        // Create the campaign on blockchain
        const provider = getBestProvider();
        if (!provider) {
          throw new Error("No wallet provider available");
        }

        const ethersProvider = new ethers.ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const contractWithSigner = contract.connect(signer);

        const tx = await contractWithSigner.createCampaign(
          request.name,
          request.startDate,
          request.endDate
        );

        const receipt = await tx.wait();

        // Update request status
        const updatedRequests = requests.map((req: any) =>
          req.mockId === requestId
            ? {
                ...req,
                status: "approved",
                blockchainId: receipt.hash,
                approvedAt: Date.now(),
              }
            : req
        );
        localStorage.setItem(
          "campaignRequests",
          JSON.stringify(updatedRequests)
        );

        console.log(
          "✅ Campaign approved and created on blockchain:",
          receipt.hash
        );

        return {
          success: true,
          message: "Campaign approved and created successfully on blockchain!",
          campaignId: receipt.hash,
        };
      } catch (error: any) {
        console.error("❌ Failed to approve campaign request:", error);

        let errorMessage = "Failed to approve campaign request";

        if (error.message?.includes("caller is not the owner")) {
          errorMessage =
            "Only the contract owner can approve campaign requests";
        } else if (error.message?.includes("insufficient funds")) {
          errorMessage = "Insufficient funds to create campaign";
        } else if (error.message) {
          errorMessage = error.message;
        }

        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    [
      contract,
      contractHealthy,
      isConnected,
      ethers,
      getBestProvider,
      isContractOwner,
    ]
  );

  // Get all campaigns with robust error handling - Memoized
  const getAllCampaigns = useCallback(async (): Promise<Campaign[]> => {
    if (!contract || !contractHealthy) {
      console.warn(
        "⚠️ Contract not initialized or unhealthy, cannot fetch campaigns"
      );
      setError("Contract not available. Please check your wallet connection.");
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      const count = await getCampaignCount();

      if (count === 0) {
        return [];
      }

      const campaigns: Campaign[] = [];
      const errors: string[] = [];

      // Fetch campaigns in parallel for better performance
      const campaignPromises = Array.from({ length: count }, (_, i) =>
        getCampaignInfo(i).catch((error) => {
          errors.push(`Failed to fetch campaign ${i}: ${error.message}`);
          return null;
        })
      );

      const campaignResults = await Promise.all(campaignPromises);

      // Filter out null results and add valid campaigns
      campaignResults.forEach((campaign, index) => {
        if (campaign) {
          campaigns.push(campaign);
        } else {
          console.warn(`⚠️ Campaign ${index} could not be loaded`);
        }
      });

      if (errors.length > 0) {
        console.warn("⚠️ Some campaigns failed to load:", errors);
        setError(
          `Loaded ${campaigns.length}/${count} campaigns. Some campaigns may be corrupted.`
        );
      }

      return campaigns;
    } catch (error: any) {
      console.error("❌ Failed to get all campaigns:", error);
      const errorMessage = `Failed to load campaigns: ${
        error.message || "Unknown error"
      }`;
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [contract, contractHealthy, getCampaignCount, getCampaignInfo]);

  // Get mountain count - Memoized
  const getMountainCount = useCallback(async (): Promise<number> => {
    if (!contract) return 0;
    try {
      setIsLoading(true);
      const count = await contract.mountainCount();
      return Number(count);
    } catch (err: any) {
      setError(err.message || "Failed to get mountain count");
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  // Get mountain info - Memoized
  const getMountainInfo = useCallback(
    async (mountainId: number): Promise<Mountain | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        const info = await contract.mountains(mountainId);
        return {
          id: mountainId,
          name: info[0],
          altitude: Number(info[1]),
          location: info[2],
          isActive: info[3],
          campaignId: Number(info[4]),
        };
      } catch (err: any) {
        setError(err.message || "Failed to get mountain info");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  // Get user's NFTs - Memoized
  const getUserNFTs = useCallback(
    async (userAddress?: string): Promise<number[]> => {
      if (!contract) return [];
      const targetAddress = userAddress || address;
      if (!targetAddress) return [];

      try {
        setIsLoading(true);
        const nftIds = await contract.getParticipantNFTs(targetAddress);
        return nftIds.map((id: any) => Number(id));
      } catch (err: any) {
        setError(err.message || "Failed to get user NFTs");
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [contract, address]
  );

  // Get NFT info - Memoized
  const getNFTInfo = useCallback(
    async (tokenId: number): Promise<ClimbingNFT | null> => {
      if (!contract) return null;
      try {
        setIsLoading(true);
        const info = await contract.getNFTInfo(tokenId);
        return {
          tokenId,
          mountainName: info[0],
          altitude: Number(info[1]),
          climbDate: Number(info[2]),
          climber: info[3],
          verified: info[4],
        };
      } catch (err: any) {
        setError(err.message || "Failed to get NFT info");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract]
  );

  // Mint climbing NFT (requires signer) - Memoized
  const mintClimbingNFT = useCallback(
    async (mountainId: number, proofURI: string): Promise<string | null> => {
      if (!contract || !isConnected || !ethers) return null;

      try {
        setIsLoading(true);
        const provider = new ethers.ethers.BrowserProvider(window.ethereum!);
        const signer = await provider.getSigner();
        const contractWithSigner = contract.connect(signer);

        const tx = await contractWithSigner.mintClimbingNFT(
          mountainId,
          proofURI
        );
        const receipt = await tx.wait();

        // Extract token ID from events
        const event = receipt.logs.find(
          (log: any) =>
            log.topics[0] ===
            ethers.ethers.id(
              "NFTMinted(uint256,address,uint256,string,uint256,uint256)"
            )
        );

        if (event) {
          const tokenId = ethers.ethers.AbiCoder.defaultAbiCoder().decode(
            ["uint256"],
            event.topics[1]
          )[0];
          return tokenId.toString();
        }

        return receipt.hash;
      } catch (err: any) {
        setError(err.message || "Failed to mint NFT");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, isConnected, ethers]
  );

  // Create campaign with robust error handling - Memoized
  const createCampaign = useCallback(
    async (
      name: string,
      startDate: number,
      endDate: number
    ): Promise<string | null> => {
      if (!contract || !contractHealthy || !isConnected || !ethers) {
        const errorMsg = !isConnected
          ? "Wallet not connected"
          : "Contract not available";
        console.error("❌ Cannot create campaign:", errorMsg);
        setError(errorMsg);
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get the best provider and create signer
        const provider = getBestProvider();
        if (!provider) {
          throw new Error("No wallet provider available");
        }

        const ethersProvider = new ethers.ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const contractWithSigner = contract.connect(signer);

        // Create the campaign
        const tx = await contractWithSigner.createCampaign(
          name,
          startDate,
          endDate
        );
        console.log(
          "⏳ Transaction sent, waiting for confirmation...",
          tx.hash
        );

        const receipt = await tx.wait();

        return receipt.hash;
      } catch (err: any) {
        console.error("❌ Failed to create campaign:", err);

        let errorMessage = "Failed to create campaign";

        if (err.code === 4001) {
          errorMessage = "Transaction was rejected by user";
        } else if (err.code === -32603) {
          errorMessage =
            "Transaction failed. Please check if you have sufficient funds and try again.";
        } else if (err.message?.includes("insufficient funds")) {
          errorMessage = "Insufficient funds to create campaign";
        } else if (err.message?.includes("execution reverted")) {
          if (err.message?.includes("caller is not the owner")) {
            errorMessage =
              "Only the contract owner can create campaigns. This feature is currently restricted to administrators.";
          } else {
            errorMessage =
              "Contract execution failed. You may not have permission to create campaigns.";
          }
        } else if (err.message) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [contract, contractHealthy, isConnected, ethers]
  );

  // Sponsor campaign with LSK - Memoized
  const sponsorCampaign = useCallback(
    async (
      campaignId: number,
      sponsorName: string,
      logoURI: string,
      ethAmount: string
    ): Promise<string | null> => {
      if (!contract || !isConnected || !ethers) return null;

      try {
        setIsLoading(true);
        const provider = new ethers.ethers.BrowserProvider(window.ethereum!);
        const signer = await provider.getSigner();
        const contractWithSigner = contract.connect(signer);

        const tx = await contractWithSigner.sponsorCampaign(
          campaignId,
          sponsorName,
          logoURI,
          { value: ethers.ethers.parseEther(ethAmount) }
        );
        const receipt = await tx.wait();

        return receipt.hash;
      } catch (err: any) {
        setError(err.message || "Failed to sponsor campaign");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, isConnected, ethers]
  );

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

    // Utility functions
    isContractOwner,
    requestCampaignCreation,
    getPendingCampaignRequests,
    approveCampaignRequest,
  };
}
