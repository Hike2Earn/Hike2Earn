const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 PRUEBA SIMPLE DE HIKE2EARN");
    console.log("==============================\n");

    // Obtener signers
    const [deployer, sponsor1, climber1, climber2] = await ethers.getSigners();
    
    // Desplegar contrato
    console.log("🚀 Desplegando contrato...");
    const Hike2Earn = await ethers.getContractFactory("Hike2Earn");
    const hike2Earn = await Hike2Earn.deploy();
    await hike2Earn.waitForDeployment();
    
    const contractAddress = await hike2Earn.getAddress();
    console.log("✅ Contrato desplegado:", contractAddress);

    // Crear campaña que empiece inmediatamente
    console.log("\n📅 Creando campaña...");
    const now = Math.floor(Date.now() / 1000);
    await hike2Earn.createCampaign(
        "Test Campaign",
        now, // Empieza ahora
        now + 86400 // Termina en 1 día
    );
    console.log("✅ Campaña creada");

    // Agregar montaña
    console.log("\n🏔️ Agregando montaña...");
    await hike2Earn.addMountain(0, "Monte Test", 5000, "Test Location");
    console.log("✅ Montaña agregada");

    // Patrocinar campaña
    console.log("\n💰 Patrocinando campaña...");
    const sponsorTx = await hike2Earn.connect(sponsor1).sponsorCampaign(
        0, 
        "Sponsor Test", 
        "ipfs://test-logo",
        { value: ethers.parseEther("2") }
    );
    await sponsorTx.wait();
    console.log("✅ Campaña patrocinada con 2 ETH");

    // Verificar información de la campaña
    const campaignInfo = await hike2Earn.getCampaignInfo(0);
    console.log("\n📊 Info de campaña:");
    console.log("Pool ETH:", ethers.formatEther(campaignInfo[3]), "ETH");
    console.log("Activa:", campaignInfo[5]);

    // Mintear NFTs
    console.log("\n🎨 Minteando NFTs...");
    
    // Climber 1 mintea NFT
    const mintTx1 = await hike2Earn.connect(climber1).mintClimbingNFT(0, "ipfs://proof1");
    await mintTx1.wait();
    console.log("✅ NFT #1 minteado por climber1");

    // Climber 2 mintea NFT
    const mintTx2 = await hike2Earn.connect(climber2).mintClimbingNFT(0, "ipfs://proof2");
    await mintTx2.wait();
    console.log("✅ NFT #2 minteado por climber2");

    // Verificar NFTs (como admin)
    console.log("\n✅ Verificando NFTs...");
    await hike2Earn.verifyNFT(1);
    await hike2Earn.verifyNFT(2);
    console.log("✅ NFTs verificados");

    // Mostrar info de los NFTs
    console.log("\n🎨 Información de NFTs:");
    const nft1 = await hike2Earn.getNFTInfo(1);
    const nft2 = await hike2Earn.getNFTInfo(2);
    
    console.log("NFT #1:");
    console.log("  - Montaña:", nft1[3]);
    console.log("  - Climber:", nft1[1]);
    console.log("  - Verificado:", nft1[5]);
    
    console.log("NFT #2:");
    console.log("  - Montaña:", nft2[3]);
    console.log("  - Climber:", nft2[1]);
    console.log("  - Verificado:", nft2[5]);

    // Mostrar balances antes de distribución
    console.log("\n💰 Balances antes de distribución:");
    console.log("Climber1:", ethers.formatEther(await ethers.provider.getBalance(climber1.address)), "ETH");
    console.log("Climber2:", ethers.formatEther(await ethers.provider.getBalance(climber2.address)), "ETH");

    // Distribuir premios
    console.log("\n🏆 Distribuyendo premios...");
    const distributeTx = await hike2Earn.distributePrizes(0);
    await distributeTx.wait();
    console.log("✅ Premios distribuidos");

    // Mostrar balances después de distribución
    console.log("\n💰 Balances después de distribución:");
    console.log("Climber1:", ethers.formatEther(await ethers.provider.getBalance(climber1.address)), "ETH");
    console.log("Climber2:", ethers.formatEther(await ethers.provider.getBalance(climber2.address)), "ETH");

    console.log("\n🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!");
    console.log("📍 Dirección del contrato:", contractAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Error:", error);
        process.exit(1);
    });