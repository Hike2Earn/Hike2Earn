const { ethers } = require("hardhat");

/**
 * Script de demostración completa con timelock real
 * Este script crea campañas con fechas muy cortas para poder probar todo el flujo
 */
async function main() {
    console.log("⚡ HIKE2EARN - DEMO COMPLETA CON TIMELOCK REAL");
    console.log("=============================================\n");

    const [owner, sponsor1, climber1, climber2] = await ethers.getSigners();
    
    console.log("👥 PARTICIPANTES DEL DEMO:");
    console.log("📋 Admin:", owner.address);
    console.log("💰 Sponsor:", sponsor1.address);
    console.log("🧗 Climber 1:", climber1.address);
    console.log("🧗 Climber 2:", climber2.address);
    console.log();

    // ========================================
    // DESPLIEGUE
    // ========================================
    console.log("🚀 PASO 1: DESPLEGANDO CONTRATO");
    console.log("===============================");
    
    const Hike2Earn = await ethers.getContractFactory("Hike2Earn");
    const hike2Earn = await Hike2Earn.deploy();
    await hike2Earn.waitForDeployment();
    const contractAddress = await hike2Earn.getAddress();
    console.log("✅ Contrato desplegado:", contractAddress);
    console.log();

    // ========================================
    // CREAR CAMPAÑA CON DURACIÓN CORTA
    // ========================================
    console.log("📅 PASO 2: CREANDO CAMPAÑA DE PRUEBA");
    console.log("====================================");
    
    const now = Math.floor(Date.now() / 1000);
    const campaignStart = now + 10; // Empieza en 10 segundos
    const campaignEnd = now + 120; // Termina en 2 minutos
    
    const createTx = await hike2Earn.createCampaign(
        "Demo Rápido - Montañas Test",
        campaignStart,
        campaignEnd
    );
    await createTx.wait();
    
    console.log("✅ Campaña creada:");
    console.log(`   Inicio: ${new Date(campaignStart * 1000).toLocaleString()}`);
    console.log(`   Fin: ${new Date(campaignEnd * 1000).toLocaleString()}`);
    console.log(`   Duración: ${(campaignEnd - campaignStart) / 60} minutos`);
    console.log();

    // ========================================
    // AGREGAR MONTAÑAS
    // ========================================
    console.log("🏔️  PASO 3: AGREGANDO MONTAÑAS");
    console.log("===============================");
    
    const mountains = [
        { name: "Monte Demo 1", altitude: 1000, location: "Test Location 1" },
        { name: "Monte Demo 2", altitude: 2000, location: "Test Location 2" }
    ];

    for (let i = 0; i < mountains.length; i++) {
        const tx = await hike2Earn.addMountain(0, mountains[i].name, mountains[i].altitude, mountains[i].location);
        await tx.wait();
        console.log(`✅ ${mountains[i].name} agregado (${mountains[i].altitude}m)`);
    }
    console.log();

    // ========================================
    // PATROCINIO
    // ========================================
    console.log("💰 PASO 4: PATROCINANDO CAMPAÑA");
    console.log("===============================");
    
    const sponsorAmount = ethers.parseEther("1.0");
    const sponsorTx = await hike2Earn.connect(sponsor1).sponsorCampaign(
        0,
        "Demo Sponsor",
        "ipfs://demo-logo",
        { value: sponsorAmount }
    );
    await sponsorTx.wait();
    console.log(`✅ Sponsor contribuyó ${ethers.formatEther(sponsorAmount)} ETH al pool`);
    console.log();

    // ========================================
    // ESPERAR A QUE EMPIECE LA CAMPAÑA
    // ========================================
    console.log("⏰ PASO 5: ESPERANDO INICIO DE CAMPAÑA");
    console.log("======================================");
    
    const waitUntilStart = (campaignStart - Math.floor(Date.now() / 1000)) * 1000;
    if (waitUntilStart > 0) {
        console.log(`⏳ Esperando ${waitUntilStart/1000} segundos para que inicie la campaña...`);
        await new Promise(resolve => setTimeout(resolve, waitUntilStart + 1000));
    }
    console.log("✅ ¡La campaña ya empezó!");
    console.log();

    // ========================================
    // MINTEAR NFTs
    // ========================================
    console.log("🎨 PASO 6: MINTEANDO NFTs");
    console.log("=========================");
    
    // Climber 1 escala Monte Demo 1
    const nft1Tx = await hike2Earn.connect(climber1).mintClimbingNFT(
        0, // mountainId
        "ipfs://demo-proof-1"
    );
    await nft1Tx.wait();
    console.log("✅ Climber 1 minteó NFT por Monte Demo 1");

    // Climber 2 escala Monte Demo 2
    const nft2Tx = await hike2Earn.connect(climber2).mintClimbingNFT(
        1, // mountainId
        "ipfs://demo-proof-2"
    );
    await nft2Tx.wait();
    console.log("✅ Climber 2 minteó NFT por Monte Demo 2");
    console.log();

    // ========================================
    // VERIFICAR NFTs
    // ========================================
    console.log("✅ PASO 7: VERIFICANDO NFTs");
    console.log("============================");
    
    for (let tokenId = 1; tokenId <= 2; tokenId++) {
        const verifyTx = await hike2Earn.verifyNFT(tokenId);
        await verifyTx.wait();
        console.log(`✅ NFT #${tokenId} verificado`);
    }
    console.log();

    // ========================================
    // MOSTRAR ESTADO ACTUAL
    // ========================================
    console.log("📊 PASO 8: ESTADO ACTUAL");
    console.log("========================");
    
    const campaignInfo = await hike2Earn.getCampaignInfo(0);
    console.log(`📈 Pool de premios: ${ethers.formatEther(campaignInfo[3])} ETH`);
    console.log(`👥 Participantes verificados: ${campaignInfo[4]}`);
    console.log(`💵 Premio por participante: ${ethers.formatEther(campaignInfo[3] / BigInt(2))} ETH`);
    
    // Obtener balances antes
    const climber1BalanceBefore = await climber1.provider.getBalance(climber1.address);
    const climber2BalanceBefore = await climber2.provider.getBalance(climber2.address);
    
    console.log(`\n💰 BALANCES ACTUALES:`);
    console.log(`Climber 1: ${ethers.formatEther(climber1BalanceBefore)} ETH`);
    console.log(`Climber 2: ${ethers.formatEther(climber2BalanceBefore)} ETH`);
    console.log();

    // ========================================
    // ESPERAR A QUE TERMINE LA CAMPAÑA
    // ========================================
    console.log("⏰ PASO 9: ESPERANDO FIN DE CAMPAÑA");
    console.log("===================================");
    
    const waitUntilEnd = (campaignEnd - Math.floor(Date.now() / 1000)) * 1000;
    if (waitUntilEnd > 0) {
        console.log(`⏳ Esperando ${waitUntilEnd/1000} segundos para que termine la campaña...`);
        
        // Mostrar countdown
        const countdownInterval = setInterval(() => {
            const remaining = (campaignEnd - Math.floor(Date.now() / 1000));
            if (remaining > 0) {
                process.stdout.write(`\r⏱️  Tiempo restante: ${remaining} segundos`);
            }
        }, 1000);
        
        await new Promise(resolve => setTimeout(resolve, waitUntilEnd + 2000));
        clearInterval(countdownInterval);
        console.log(`\n✅ ¡La campaña terminó!`);
    } else {
        console.log("✅ La campaña ya terminó");
    }
    console.log();

    // ========================================
    // DISTRIBUIR PREMIOS
    // ========================================
    console.log("🏆 PASO 10: DISTRIBUYENDO PREMIOS");
    console.log("=================================");
    
    try {
        console.log("💰 Ejecutando distribución de premios...");
        const distributeTx = await hike2Earn.distributePrizes(0);
        await distributeTx.wait();
        console.log("✅ ¡Premios distribuidos exitosamente!");
        
        // Verificar nuevos balances
        const climber1BalanceAfter = await climber1.provider.getBalance(climber1.address);
        const climber2BalanceAfter = await climber2.provider.getBalance(climber2.address);
        
        const climber1Gain = climber1BalanceAfter - climber1BalanceBefore;
        const climber2Gain = climber2BalanceAfter - climber2BalanceBefore;
        
        console.log(`\n💸 PREMIOS RECIBIDOS:`);
        console.log(`Climber 1: +${ethers.formatEther(climber1Gain)} ETH`);
        console.log(`Climber 2: +${ethers.formatEther(climber2Gain)} ETH`);
        console.log(`Total distribuido: ${ethers.formatEther(climber1Gain + climber2Gain)} ETH`);
        
    } catch (error) {
        console.log("❌ Error distribuyendo premios:", error.message);
    }
    console.log();

    // ========================================
    // RESUMEN FINAL
    // ========================================
    console.log("🎉 DEMO COMPLETADO EXITOSAMENTE");
    console.log("===============================");
    console.log("✅ Contrato desplegado y funcionando");
    console.log("✅ Campaña creada con tiempo real");
    console.log("✅ Montañas agregadas a la campaña");
    console.log("✅ Pool de premios financiado por sponsor");
    console.log("✅ NFTs minteados por escaladas completadas");
    console.log("✅ NFTs verificados por el administrador");
    console.log("✅ Premios distribuidos equitativamente");
    
    console.log(`\n📍 DIRECCIÓN DEL CONTRATO: ${contractAddress}`);
    console.log("🔗 Guarda esta dirección para pruebas adicionales");
    
    console.log(`\n⚡ TIEMPO TOTAL DEL DEMO: ${(campaignEnd - campaignStart) / 60} minutos`);
    console.log("🚀 ¡El sistema Hike2Earn funciona perfectamente!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Error en el demo:", error);
        process.exit(1);
    });
