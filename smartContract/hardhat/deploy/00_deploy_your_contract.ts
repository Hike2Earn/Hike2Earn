import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "Hike2Earn" using the deployer account
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("Hike2Earn", {
    from: deployer,
    // Contract constructor arguments - Hike2Earn no requiere argumentos
    args: [],
    log: true,
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const hike2EarnContract = await hre.ethers.getContract<Contract>("Hike2Earn", deployer);
  console.log("🏔️ Hike2Earn contract deployed successfully!");
  
  // Crear una campaña de ejemplo
  console.log("📅 Creating example campaign...");
  const now = Math.floor(Date.now() / 1000);
  const campaignStart = now + 300; // Starts in 5 minutes
  const campaignEnd = now + (30 * 24 * 60 * 60); // Ends in 30 days
  
  try {
    // Create campaign
    const tx1 = await (hike2EarnContract as any).createCampaign(
      "Argentina Mountains Challenge 2025",
      campaignStart,
      campaignEnd
    );
    await tx1.wait();
    console.log("✅ Campaign created");
    
    // Add mountains to campaign
    console.log("🏔️ Adding mountains to campaign...");
    
    // Aconcagua
    const tx2 = await (hike2EarnContract as any).addMountain(
      0, // campaignId
      "Aconcagua",
      6961,
      "Mendoza, Argentina"
    );
    await tx2.wait();
    console.log("✅ Added Aconcagua");
    
    // Cerro Torre
    const tx3 = await (hike2EarnContract as any).addMountain(
      0, // campaignId
      "Cerro Torre", 
      3128,
      "Patagonia, Argentina"
    );
    await tx3.wait();
    console.log("✅ Added Cerro Torre");
    
    // Cerro Catedral
    const tx4 = await (hike2EarnContract as any).addMountain(
      0, // campaignId
      "Cerro Catedral",
      2388,
      "Bariloche, Argentina"
    );
    await tx4.wait();
    console.log("✅ Added Cerro Catedral");
    
    console.log("🎉 All mountains added successfully!");
    console.log("📍 Contract deployed at:", await hike2EarnContract.getAddress());
    
    // Update frontend configuration
    console.log("🔄 Updating frontend configuration...");
    try {
      const { spawn } = require('child_process');
      const updateScript = spawn('npx', ['hardhat', 'run', 'scripts/update-frontend-config.ts', '--network', hre.network.name], {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      
      await new Promise((resolve, reject) => {
        updateScript.on('close', (code) => {
          if (code === 0) {
            console.log("✅ Frontend configuration updated successfully!");
            resolve(code);
          } else {
            console.warn("⚠️ Frontend configuration update failed, but deployment was successful");
            resolve(code); // Don't fail the deployment if this fails
          }
        });
        
        updateScript.on('error', (err) => {
          console.warn("⚠️ Could not update frontend configuration:", err.message);
          resolve(0); // Don't fail the deployment
        });
      });
    } catch (error) {
      console.warn("⚠️ Could not update frontend configuration:", error);
    }
    
  } catch (error: any) {
    console.error("❌ Error setting up campaign:", error);
  }
};

export default deployYourContract;

deployYourContract.tags = ["Hike2Earn"];
