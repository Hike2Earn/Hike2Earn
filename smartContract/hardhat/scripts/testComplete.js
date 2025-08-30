const { ethers, network } = require("hardhat");

async function main() {
    console.log("🚀 PRUEBA COMPLETA HIKE2EARN");
    console.log("============================\n");

    const [deployer, sponsor1, climber1, climber2] = await ethers.getSigners();
    
    // Deploy contract
    const Hike2Earn = await ethers.getContractFactory("Hike2Earn");
    const hike2Earn = await Hike2Earn.deploy();
    await hike2Earn.waitForDeployment();
    console.log("✅ Contrato desplegado");

    // Create campaign with start in the future
    const now = Math.floor(Date.now() / 1000);
    const campaignStart = now + 60; // Empieza en 1 minuto
    await hike2Earn.createCampaign("Test Campaign", campaignStart, now + 86400);
    console.log("✅ Campaña creada (empezará en 1 minuto)");

    // Add mountain
    await hike2Earn.addMountain(0, "Monte Test", 5000, "Test Location");
    console.log("✅ Montaña agregada");

    // Sponsor campaign
    await hike2Earn.connect(sponsor1).sponsorCampaign(
        0, "Sponsor Test", "ipfs://logo", 
        { value: ethers.parseEther("2") }
    );
    console.log("✅ Campaña patrocinada con 2 ETH");

    // Advance time to make campaign active
    console.log("\n⏰ Avanzando tiempo para activar la campaña...");
    await network.provider.send("evm_increaseTime", [65]); // Avanza 65 segundos
    await network.provider.send("evm_mine");
    console.log("✅ Campaña ahora activa");

    // Mint NFTs
    await hike2Earn.connect(climber1).mintClimbingNFT(0, "ipfs://proof1");
    await hike2Earn.connect(climber2).mintClimbingNFT(0, "ipfs://proof2");
    console.log("✅ NFTs minteados");

    // Verify NFTs
    await hike2Earn.verifyNFT(1);
    await hike2Earn.verifyNFT(2);
    console.log("✅ NFTs verificados");

    // Distribute prizes
    await hike2Earn.distributePrizes(0);
    console.log("✅ Premios distribuidos");

    console.log("\n🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!");
}

main().catch(console.error);
