/**
 * Contract diagnostic utilities for debugging Hike2Earn contract issues
 */

import { HIKE2EARN_CONTRACT_CONFIG, getHike2EarnConfig } from "./web3";
import { getBestProvider } from "./wallet-utils";
import {
  validateNetwork,
  getNetworkDisplayInfo,
  PRIMARY_NETWORK,
  getContractAddress,
} from "./network-config";

export interface ContractDiagnostic {
  contractAddress: string;
  isValidAddress: boolean;
  contractDeployed: boolean;
  abiLoaded: boolean;
  providerAvailable: boolean;
  networkCorrect: boolean;
  contractCallsWork: boolean;
  errors: string[];
  recommendations: string[];
  debugInfo: {
    networkId?: number;
    networkName?: string;
    blockNumber?: number;
    contractCodeSize?: number;
    gasEstimate?: string;
    supportedNetworks?: string[];
  };
}

/**
 * Perform comprehensive contract diagnostic with network awareness
 */
export async function diagnoseContract(): Promise<ContractDiagnostic> {
  // Get current network info first
  let currentChainId: number | undefined;
  let contractConfig = HIKE2EARN_CONTRACT_CONFIG;

  try {
    const provider = getBestProvider();
    if (provider) {
      const { ethers } = await import("ethers");
      const ethersProvider = new ethers.BrowserProvider(provider);
      const network = await ethersProvider.getNetwork();
      currentChainId = Number(network.chainId);

      // Use network-specific contract config
      contractConfig = getHike2EarnConfig(currentChainId);
    }
  } catch (error) {
    // Will handle this in provider check below
  }

  const diagnostic: ContractDiagnostic = {
    contractAddress: contractConfig.address || "Not configured",
    isValidAddress: false,
    contractDeployed: false,
    abiLoaded: false,
    providerAvailable: false,
    networkCorrect: false,
    contractCallsWork: false,
    errors: [],
    recommendations: [],
    debugInfo: {
      networkId: currentChainId,
      networkName: currentChainId
        ? getNetworkDisplayInfo(currentChainId).name
        : "Unknown",
      supportedNetworks: [PRIMARY_NETWORK.name],
    },
  };

  console.group("🔍 Contract Diagnostic Starting...");

  // Check if contract address is valid
  try {
    if (contractConfig.address) {
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      diagnostic.isValidAddress = addressRegex.test(contractConfig.address);

      if (!diagnostic.isValidAddress) {
        diagnostic.errors.push("Contract address format is invalid");
        diagnostic.recommendations.push(
          "Verify the contract address in network-config.ts"
        );
      } else {
        console.log("✅ Contract address format is valid");
      }
    } else {
      diagnostic.errors.push("Contract address is empty or undefined");
      diagnostic.recommendations.push(
        "Set the contract address in network-config.ts for the current network"
      );
    }
  } catch (error) {
    diagnostic.errors.push("Error checking contract address");
  }

  // Check if ABI is loaded
  try {
    if (
      contractConfig.abi &&
      Array.isArray(contractConfig.abi) &&
      contractConfig.abi.length > 0
    ) {
      diagnostic.abiLoaded = true;
      console.log("✅ Contract ABI is loaded");
    } else {
      diagnostic.errors.push("Contract ABI is missing or empty");
      diagnostic.recommendations.push(
        "Ensure Hike2Earn.json artifact is properly imported"
      );
    }
  } catch (error) {
    diagnostic.errors.push("Error loading contract ABI");
  }

  // Check provider availability
  try {
    const provider = getBestProvider();
    if (provider) {
      diagnostic.providerAvailable = true;
      console.log("✅ Provider is available");
    } else {
      diagnostic.errors.push("No wallet provider available");
      diagnostic.recommendations.push(
        "Install MetaMask or another Web3 wallet"
      );
    }
  } catch (error) {
    diagnostic.errors.push("Error checking provider availability");
  }

  // If we have a provider, check network and contract deployment
  if (diagnostic.providerAvailable && diagnostic.isValidAddress) {
    try {
      const { ethers } = await import("ethers");
      const provider = getBestProvider();

      if (provider) {
        const ethersProvider = new ethers.BrowserProvider(provider);

        // Check network using new validation system
        try {
          const network = await ethersProvider.getNetwork();
          const chainId = Number(network.chainId);
          diagnostic.debugInfo.networkId = chainId;

          const networkValidation = validateNetwork(chainId);
          const networkInfo = getNetworkDisplayInfo(chainId);
          diagnostic.debugInfo.networkName = networkInfo.name;

          if (!networkValidation.needsSwitch && networkValidation.isSupported) {
            diagnostic.networkCorrect = true;
            console.log(`✅ Connected to correct network: ${networkInfo.name}`);
          } else {
            const errorMsg =
              networkValidation.errorMessage ||
              `Connected to ${networkInfo.name} (${chainId}), but contract is deployed on ${PRIMARY_NETWORK.name} (${PRIMARY_NETWORK.chainId})`;
            diagnostic.errors.push(errorMsg);
            diagnostic.recommendations.push(
              `Switch to ${PRIMARY_NETWORK.name} in your wallet`
            );
          }
        } catch (networkError) {
          diagnostic.errors.push("Failed to check network");
        }

        // Check contract deployment
        if (contractConfig.address) {
          try {
            const code = await ethersProvider.getCode(contractConfig.address);
            diagnostic.debugInfo.contractCodeSize = code.length;

            if (code && code !== "0x") {
              diagnostic.contractDeployed = true;
              console.log("✅ Contract is deployed");

              // Try to create contract instance and test basic calls
              try {
                const contract = new ethers.Contract(
                  contractConfig.address,
                  contractConfig.abi,
                  ethersProvider
                );

                // Test a simple read call
                const campaignCount = await contract.campaignCount();
                diagnostic.contractCallsWork = true;
                console.log(
                  "✅ Contract calls work, campaign count:",
                  Number(campaignCount)
                );

                diagnostic.debugInfo.gasEstimate = "Contract calls functional";
              } catch (callError: any) {
                diagnostic.errors.push(
                  `Contract calls fail: ${callError.message}`
                );
                diagnostic.recommendations.push(
                  "Check if contract ABI matches deployed contract"
                );
              }
            } else {
              diagnostic.errors.push(
                "No contract code at the specified address"
              );
              diagnostic.recommendations.push(
                "Deploy the contract or check the address"
              );
            }
          } catch (deployError) {
            diagnostic.errors.push("Failed to check contract deployment");
          }
        } else {
          diagnostic.errors.push("Contract address is not configured");
          diagnostic.recommendations.push(
            "Configure contract address in network-config.ts"
          );
        }

        // Get current block number
        try {
          const blockNumber = await ethersProvider.getBlockNumber();
          diagnostic.debugInfo.blockNumber = blockNumber;
        } catch (blockError) {
          // Not critical, just debug info
        }
      }
    } catch (error: any) {
      diagnostic.errors.push(
        `Provider initialization failed: ${error.message}`
      );
    }
  }

  // Generate recommendations based on findings
  if (diagnostic.errors.length === 0 && diagnostic.contractCallsWork) {
    diagnostic.recommendations.push("Contract is fully functional");
  } else if (diagnostic.errors.length > 3) {
    diagnostic.recommendations.push(
      "Multiple issues detected - check wallet connection and contract deployment"
    );
  }

  console.groupEnd();

  return diagnostic;
}

/**
 * Test specific contract functions
 */
export async function testContractFunctions(): Promise<{
  campaignCount: number | null;
  mountainCount: number | null;
  errors: string[];
}> {
  const result = {
    campaignCount: null as number | null,
    mountainCount: null as number | null,
    errors: [] as string[],
  };

  try {
    const { ethers } = await import("ethers");
    const provider = getBestProvider();

    if (!provider) {
      result.errors.push("No provider available");
      return result;
    }

    const ethersProvider = new ethers.BrowserProvider(provider);

    // Get current network to use correct contract config
    let chainId: number | undefined;
    try {
      const network = await ethersProvider.getNetwork();
      chainId = Number(network.chainId);
    } catch (error) {
      // Use default config if network detection fails
    }

    const contractConfig = getHike2EarnConfig(chainId);

    if (!contractConfig.address) {
      result.errors.push("Contract address not configured for current network");
      return result;
    }

    const contract = new ethers.Contract(
      contractConfig.address,
      contractConfig.abi,
      ethersProvider
    );

    // Test campaignCount
    try {
      const count = await contract.campaignCount();
      result.campaignCount = Number(count);
      console.log("📊 Campaign count:", result.campaignCount);
    } catch (error: any) {
      result.errors.push(`campaignCount failed: ${error.message}`);
    }

    // Test mountainCount
    try {
      const count = await contract.mountainCount();
      result.mountainCount = Number(count);
      console.log("⛰️ Mountain count:", result.mountainCount);
    } catch (error: any) {
      result.errors.push(`mountainCount failed: ${error.message}`);
    }
  } catch (error: any) {
    result.errors.push(`Contract function test failed: ${error.message}`);
  }

  return result;
}

/**
 * Get contract creation cost estimate
 */
export async function estimateContractGas(): Promise<{
  createCampaign: string | undefined;
  sponsorCampaign: string | undefined;
  mintNFT: string | undefined;
  errors: string[];
}> {
  const result: {
    createCampaign: string | undefined;
    sponsorCampaign: string | undefined;
    mintNFT: string | undefined;
    errors: string[];
  } = {
    errors: [],
    createCampaign: undefined,
    sponsorCampaign: undefined,
    mintNFT: undefined,
  };

  try {
    const { ethers } = await import("ethers");
    const provider = getBestProvider();

    if (!provider) {
      result.errors.push("No provider available");
      return result;
    }

    const ethersProvider = new ethers.BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    // Get current network to use correct contract config
    let chainId: number | undefined;
    try {
      const network = await ethersProvider.getNetwork();
      chainId = Number(network.chainId);
    } catch (error) {
      // Use default config if network detection fails
    }

    const contractConfig = getHike2EarnConfig(chainId);

    if (!contractConfig.address) {
      result.errors.push("Contract address not configured for current network");
      return result;
    }

    const contract = new ethers.Contract(
      contractConfig.address,
      contractConfig.abi,
      signer
    );

    // Estimate createCampaign gas
    try {
      const gasEstimate = await contract.createCampaign.estimateGas(
        "Test Campaign",
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 86400
      );
      result.createCampaign = gasEstimate.toString() + " wei";
    } catch (error: any) {
      result.errors.push(
        `createCampaign gas estimation failed: ${error.message}`
      );
    }
  } catch (error: any) {
    result.errors.push(`Gas estimation failed: ${error.message}`);
  }

  return result;
}

/**
 * Auto-run diagnostics in development mode
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  setTimeout(async () => {
    const diagnostic = await diagnoseContract();
    console.log("🏥 Contract Health Check:", {
      healthy: diagnostic.contractCallsWork && diagnostic.errors.length === 0,
      errors: diagnostic.errors.length,
      recommendations: diagnostic.recommendations.length,
    });
  }, 2000);
}
