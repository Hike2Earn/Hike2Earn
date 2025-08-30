// Contract addresses and configuration
export const CONTRACT_ADDRESSES = {
  // Will be updated by deployment script
  HIKE2EARN: "0xD9986E17F96e99D11330F72F90f78982b8F29570", // Deployed contract address
} as const

export const SUPPORTED_NETWORKS = {
  LISK_MAINNET: {
    chainId: 1135,
    name: "Lisk",
    currency: "LSK",
    rpcUrl: "https://rpc.api.lisk.com",
    blockExplorer: "https://liskscan.com",
  },
  LISK_SEPOLIA: {
    chainId: 4202,
    name: "Lisk Sepolia",
    currency: "LSK",
    rpcUrl: "https://rpc.sepolia-api.lisk.com",
    blockExplorer: "https://sepolia-blockscout.lisk.com",
  },
  LOCALHOST: {
    chainId: 31337,
    name: "Hardhat Network",
    currency: "ETH",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "",
  }
} as const

// Get current network based on chain ID
export function getCurrentNetwork(chainId: number) {
  switch (chainId) {
    case 1135:
      return SUPPORTED_NETWORKS.LISK_MAINNET
    case 4202:
      return SUPPORTED_NETWORKS.LISK_SEPOLIA
    case 31337:
      return SUPPORTED_NETWORKS.LOCALHOST
    default:
      return null
  }
}

// Contract deployment info (updated by deployment script)
export const DEPLOYMENT_INFO = {
  networkName: "",
  blockNumber: 0,
  transactionHash: "",
  deployedAt: "",
  gasUsed: 0,
} as const