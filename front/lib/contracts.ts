// Unified contract configuration - now uses network-config.ts exclusively
import {
  SUPPORTED_NETWORKS as NETWORKS,
  getNetworkByChainId,
  getContractAddress,
  PRIMARY_NETWORK,
} from "./network-config";

// Simplified contract addresses - delegates to network-config.ts
export const CONTRACT_ADDRESSES = {
  HIKE2EARN: PRIMARY_NETWORK.contracts.HIKE2EARN,
} as const;

// Re-export networks for backward compatibility
export const SUPPORTED_NETWORKS = {
  LISK_MAINNET: NETWORKS.LISK_MAINNET,
  LISK_SEPOLIA: NETWORKS.LISK_SEPOLIA,
  LOCALHOST: NETWORKS.LOCALHOST,
} as const;

// Legacy function - use getNetworkByChainId from network-config.ts instead
export function getCurrentNetwork(chainId: number) {
  return getNetworkByChainId(chainId);
}

// Helper function to get contract address for current network
export function getHike2EarnAddress(chainId: number): string | null {
  return getContractAddress(chainId, "HIKE2EARN");
}

// Contract deployment info (updated by deployment script)
export const DEPLOYMENT_INFO = {
  networkName: "",
  blockNumber: 0,
  transactionHash: "",
  deployedAt: "",
  gasUsed: 0,
} as const;
