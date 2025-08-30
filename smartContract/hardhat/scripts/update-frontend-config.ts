import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function updateFrontendConfig() {
  try {
    // Get network info
    const network = await ethers.provider.getNetwork();
    const chainId = Number(network.chainId);
    
    // Get deployed contract address
    const hike2EarnContract = await ethers.getContract("Hike2Earn");
    const contractAddress = await hike2EarnContract.getAddress();
    
    // Get deployment transaction
    const deploymentTx = hike2EarnContract.deploymentTransaction();
    const receipt = deploymentTx ? await deploymentTx.wait() : null;
    
    console.log(`📝 Updating frontend configuration...`);
    console.log(`Network: ${network.name} (${chainId})`);
    console.log(`Contract: ${contractAddress}`);
    
    // Path to frontend contracts.ts file
    const contractsFilePath = path.join(__dirname, "../../../front/lib/contracts.ts");
    
    // Read current file
    let contractsContent = fs.readFileSync(contractsFilePath, "utf8");
    
    // Update contract address
    contractsContent = contractsContent.replace(
      /HIKE2EARN: ".*"/,
      `HIKE2EARN: "${contractAddress}"`
    );
    
    // Update deployment info
    const deploymentInfo = {
      networkName: network.name,
      blockNumber: receipt?.blockNumber || 0,
      transactionHash: receipt?.hash || "",
      deployedAt: new Date().toISOString(),
      gasUsed: receipt?.gasUsed || 0,
    };
    
    contractsContent = contractsContent.replace(
      /export const DEPLOYMENT_INFO = {[\s\S]*?} as const/,
      `export const DEPLOYMENT_INFO = ${JSON.stringify(deploymentInfo, null, 2)} as const`
    );
    
    // Write updated file
    fs.writeFileSync(contractsFilePath, contractsContent);
    
    console.log(`✅ Frontend configuration updated successfully!`);
    console.log(`📍 Contract address: ${contractAddress}`);
    console.log(`🌐 Network: ${network.name} (Chain ID: ${chainId})`);
    
    // Also create a simple deployments.json for reference
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentData = {
      chainId,
      networkName: network.name,
      contracts: {
        Hike2Earn: {
          address: contractAddress,
          blockNumber: receipt?.blockNumber,
          transactionHash: receipt?.hash,
          deployedAt: new Date().toISOString(),
        }
      }
    };
    
    fs.writeFileSync(
      path.join(deploymentsDir, `${chainId}.json`),
      JSON.stringify(deploymentData, null, 2)
    );
    
    console.log(`📄 Deployment info saved to deployments/${chainId}.json`);
    
  } catch (error) {
    console.error("❌ Error updating frontend configuration:", error);
    process.exit(1);
  }
}

// Run the script
updateFrontendConfig()
  .then(() => {
    console.log("🎉 Frontend configuration update completed!");
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });