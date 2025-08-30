// Simple script to test contract connection
const { ethers } = require('ethers');

// Contract address and ABI (simplified for testing)
const CONTRACT_ADDRESS = "0xD9986E17F96e99D11330F72F90f78982b8F29570";
const CONTRACT_ABI = [
  "function campaignCount() external view returns (uint256)",
  "function mountainCount() external view returns (uint256)",
  "function getCampaignInfo(uint256 _campaignId) external view returns (string memory name, uint256 startDate, uint256 endDate, uint256 prizePoolETH, uint256 participantCount, bool isActive, bool prizeDistributed)"
];

// RPC endpoints to try
const RPC_URLS = [
  "https://flare-api.flare.network/ext/C/rpc",        // Flare Mainnet
  "https://coston2-api.flare.network/ext/C/rpc",     // Flare Testnet
  "http://127.0.0.1:8545"                            // Local Hardhat
];

async function testContractConnection() {
  console.log("🔍 Testing contract connection...");
  console.log(`📋 Contract Address: ${CONTRACT_ADDRESS}\n`);

  for (const rpcUrl of RPC_URLS) {
    try {
      console.log(`🌐 Testing RPC: ${rpcUrl}`);
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Test network connection
      const network = await provider.getNetwork();
      console.log(`   ✅ Network connected - Chain ID: ${network.chainId}`);
      
      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      // Test contract calls
      const campaignCount = await contract.campaignCount();
      console.log(`   📊 Campaign Count: ${campaignCount.toString()}`);
      
      const mountainCount = await contract.mountainCount();
      console.log(`   🏔️  Mountain Count: ${mountainCount.toString()}`);
      
      // If we have campaigns, get info about the first one
      if (campaignCount > 0) {
        const campaignInfo = await contract.getCampaignInfo(0);
        console.log(`   🎯 First Campaign: "${campaignInfo[0]}"`);
        console.log(`      - Start: ${new Date(Number(campaignInfo[1]) * 1000).toLocaleDateString()}`);
        console.log(`      - End: ${new Date(Number(campaignInfo[2]) * 1000).toLocaleDateString()}`);
        console.log(`      - Prize Pool: ${ethers.formatEther(campaignInfo[3])} ETH`);
        console.log(`      - Participants: ${campaignInfo[4].toString()}`);
        console.log(`      - Active: ${campaignInfo[5]}`);
      }
      
      console.log(`   🎉 SUCCESS: Contract is responsive on this network!\n`);
      return { rpcUrl, chainId: network.chainId };
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
    }
  }
  
  console.log("❌ Could not connect to contract on any network");
  return null;
}

// Run the test
testContractConnection()
  .then(result => {
    if (result) {
      console.log("✅ CONTRACT CONNECTION TEST PASSED!");
      console.log(`   Working RPC: ${result.rpcUrl}`);
      console.log(`   Chain ID: ${result.chainId}`);
      console.log("\n🚀 Your frontend should be able to connect to the contract!");
    } else {
      console.log("❌ CONTRACT CONNECTION TEST FAILED!");
      console.log("\n💡 Possible solutions:");
      console.log("   1. Check if the contract is deployed on the expected network");
      console.log("   2. Verify the contract address is correct");
      console.log("   3. Ensure the RPC endpoints are accessible");
      console.log("   4. For local testing, make sure Hardhat node is running");
    }
  })
  .catch(console.error);