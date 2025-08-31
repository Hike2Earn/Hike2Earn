/**
 * Centralized network configuration for Hike2Earn
 * This file manages all network-specific settings and contract deployments
 */

export interface NetworkConfig {
  chainId: number;
  name: string;
  currency: string;
  rpcUrl: string;
  blockExplorer: string;
  isTestnet: boolean;
  contracts: {
    HIKE2EARN?: string;
  };
}

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  // Lisk Mainnet
  LISK_MAINNET: {
    chainId: 1135,
    name: "Lisk",
    currency: "LSK",
    rpcUrl: "https://rpc.api.lisk.com",
    blockExplorer: "https://liskscan.com",
    isTestnet: false,
    contracts: {
      HIKE2EARN: "", // Not deployed yet
    },
  },

  // Lisk Sepolia Testnet - Primary deployment
  LISK_SEPOLIA: {
    chainId: 4202,
    name: "Lisk Sepolia",
    currency: "LSK",
    rpcUrl: "https://rpc.sepolia-api.lisk.com",
    blockExplorer: "https://sepolia-blockscout.lisk.com",
    isTestnet: true,
    contracts: {
      HIKE2EARN: "0xD9986E17F96e99D11330F72F90f78982b8F29570", // Current deployment
    },
  },

  // Local Development
  LOCALHOST: {
    chainId: 31337,
    name: "Hardhat Network",
    currency: "LSK",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "",
    isTestnet: true,
    contracts: {
      HIKE2EARN: "", // Will be set by deployment script
    },
  },

  // Ethereum Mainnet (for reference/fallback)
  ETHEREUM_MAINNET: {
    chainId: 1,
    name: "Ethereum",
    currency: "ETH",
    rpcUrl: "https://eth-mainnet.alchemyapi.io/v2/your-key",
    blockExplorer: "https://etherscan.io",
    isTestnet: false,
    contracts: {
      // No Hike2Earn deployment on Ethereum
    },
  },
} as const;

// Primary network where the contract is deployed
export const PRIMARY_NETWORK = SUPPORTED_NETWORKS.LISK_SEPOLIA;

// Get network configuration by chain ID
export function getNetworkByChainId(chainId: number): NetworkConfig | null {
  return (
    Object.values(SUPPORTED_NETWORKS).find(
      (network) => network.chainId === chainId
    ) || null
  );
}

// Get the deployed contract address for a specific network
export function getContractAddress(
  chainId: number,
  contractName: "HIKE2EARN"
): string | null {
  const network = getNetworkByChainId(chainId);
  return network?.contracts[contractName] || null;
}

// Check if a network is supported for Hike2Earn
export function isNetworkSupported(chainId: number): boolean {
  const network = getNetworkByChainId(chainId);
  return network ? !!network.contracts.HIKE2EARN : false;
}

// Get the primary network where Hike2Earn is deployed
export function getPrimaryDeployment(): {
  network: NetworkConfig;
  contractAddress: string;
} {
  return {
    network: PRIMARY_NETWORK,
    contractAddress: PRIMARY_NETWORK.contracts.HIKE2EARN!,
  };
}

// Get all networks where Hike2Earn is deployed
export function getSupportedNetworks(): NetworkConfig[] {
  return Object.values(SUPPORTED_NETWORKS).filter(
    (network) => network.contracts.HIKE2EARN
  );
}

// Network validation and switching utilities
export interface NetworkValidation {
  isSupported: boolean;
  currentNetwork: NetworkConfig | null;
  targetNetwork: NetworkConfig;
  needsSwitch: boolean;
  canAutoSwitch: boolean;
  errorMessage?: string;
}

export function validateNetwork(currentChainId: number): NetworkValidation {
  // Ensure chainId is a number for proper comparison
  const normalizedChainId = Number(currentChainId);
  const currentNetwork = getNetworkByChainId(normalizedChainId);
  const targetNetwork = PRIMARY_NETWORK;
  const isSupported = isNetworkSupported(normalizedChainId);

  const needsSwitch = normalizedChainId !== Number(targetNetwork.chainId);

  console.log(`🔍 validateNetwork debug:`, {
    input: currentChainId,
    normalized: normalizedChainId,
    target: targetNetwork.chainId,
    targetNormalized: Number(targetNetwork.chainId),
    needsSwitch,
    isSupported
  });

  return {
    isSupported,
    currentNetwork,
    targetNetwork,
    needsSwitch,
    canAutoSwitch: typeof window !== "undefined" && !!window.ethereum,
    errorMessage: !isSupported
      ? `Network not supported. Please switch to ${targetNetwork.name} (Chain ID: ${targetNetwork.chainId})`
      : undefined,
  };
}

// Switch network utility for MetaMask
export async function switchToNetwork(chainId: number): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet provider found");
  }

  const network = getNetworkByChainId(chainId);
  if (!network) {
    throw new Error(`Unsupported network: ${chainId}`);
  }

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (switchError: any) {
    // If the network is not added, add it first
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: {
                name: network.currency,
                symbol: network.currency,
                decimals: 18,
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: network.blockExplorer
                ? [network.blockExplorer]
                : [],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error("Failed to add network:", addError);
        throw new Error(`Failed to add ${network.name} to wallet`);
      }
    }

    console.error("Failed to switch network:", switchError);
    throw new Error(`Failed to switch to ${network.name}`);
  }
}

// Auto-switch to primary network
export async function switchToPrimaryNetwork(): Promise<boolean> {
  return switchToNetwork(PRIMARY_NETWORK.chainId);
}

// Get human-readable network info
export function getNetworkDisplayInfo(chainId: number) {
  const network = getNetworkByChainId(chainId);
  if (!network) {
    return {
      name: `Unknown Network (${chainId})`,
      isSupported: false,
      hasContract: false,
    };
  }

  return {
    name: network.name,
    isSupported: true,
    hasContract: !!network.contracts.HIKE2EARN,
    isTestnet: network.isTestnet,
    blockExplorer: network.blockExplorer,
  };
}

// Development utilities
export const DEV_UTILS = {
  // Update contract address for a specific network (used by deployment scripts)
  updateContractAddress: (chainId: number, contractAddress: string) => {
    const networkKey = Object.keys(SUPPORTED_NETWORKS).find(
      (key) =>
        SUPPORTED_NETWORKS[key as keyof typeof SUPPORTED_NETWORKS].chainId ===
        chainId
    );

    if (networkKey) {
      // In a real app, this would update a config file or database
      // For now, we'll log it for manual updating
      console.log(
        `📝 Update ${networkKey} contract address to: ${contractAddress}`
      );
      return true;
    }

    return false;
  },

  // List all network configurations
  listNetworks: () => {
    console.table(
      Object.entries(SUPPORTED_NETWORKS).map(([key, config]) => ({
        Key: key,
        "Chain ID": config.chainId,
        Name: config.name,
        "Has Contract": !!config.contracts.HIKE2EARN,
        "Contract Address": config.contracts.HIKE2EARN || "Not deployed",
      }))
    );
  },
};

// Type exports
export type SupportedNetworkKey = keyof typeof SUPPORTED_NETWORKS;

// Declare global ethereum for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      enable?: () => Promise<string[]>;
      send?: (method: string, params?: any[]) => Promise<any>;
      isMetaMask?: boolean;
      isPhantom?: boolean;
      isCoinbaseWallet?: boolean;
      isTrustWallet?: boolean;
      isRabby?: boolean;
      providers?: any[];
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (
        event: string,
        callback: (...args: any[]) => void
      ) => void;
    };
  }
}
