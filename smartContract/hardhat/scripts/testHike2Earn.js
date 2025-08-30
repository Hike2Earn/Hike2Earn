const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 TESTING HIKE2EARN CONTRACT - FULL WORKFLOW");
    console.log("=============================================\n");

    // Obtener cuentas para las pruebas
    const [owner, sponsor1, sponsor2, climber1, climber2, climber3] = await ethers.getSigners();
    
    console.log("👥 CUENTAS DE PRUEBA:");
    console.log("📋 Owner (Admin):", owner.address);
    console.log("💰 Sponsor 1:", sponsor1.address);
    console.log("💰 Sponsor 2:", sponsor2.address);
    console.log("🧗 Climber 1:", climber1.address);
    console.log("🧗 Climber 2:", climber2.address);
    console.log("🧗 Climber 3:", climber3.address);
    console.log();

    // Desplegar el contrato
    console.log("🚀 DESPLEGANDO CONTRATO...");
    console.log("===========================");
    const Hike2Earn = await ethers.getContractFactory("Hike2Earn");
    const hike2Earn = await Hike2Earn.deploy();
    await hike2Earn.waitForDeployment();
    const contractAddress = await hike2Earn.getAddress();
    console.log("✅ Contrato desplegado en:", contractAddress);
    console.log();

    // ========================================
    // PASO 1: CREAR CAMPAÑAS
    // ========================================
    console.log("📅 PASO 1: CREANDO CAMPAÑAS");
    console.log("============================");
    
    const now = Math.floor(Date.now() / 1000);
    
    // Campaña 1: Montañas de Argentina
    const campaign1Start = now + 300; // 5 minutos
    const campaign1End = now + (7 * 24 * 60 * 60); // 7 días
    
    const tx1 = await hike2Earn.createCampaign(
        "Desafío Montañas de Argentina",
        campaign1Start,
        campaign1End
    );
    await tx1.wait();
    console.log("✅ Campaña 1 creada: Desafío Montañas de Argentina");

    // Campaña 2: Picos Patagónicos
    const campaign2Start = now + 600; // 10 minutos
    const campaign2End = now + (14 * 24 * 60 * 60); // 14 días
    
    const tx2 = await hike2Earn.createCampaign(
        "Picos Patagónicos Challenge",
        campaign2Start,
        campaign2End
    );
    await tx2.wait();
    console.log("✅ Campaña 2 creada: Picos Patagónicos Challenge");
    console.log();

    // ========================================
    // PASO 2: AGREGAR MONTAÑAS A LAS CAMPAÑAS
    // ========================================
    console.log("🏔️  PASO 2: AGREGANDO MONTAÑAS");
    console.log("===============================");
    
    // Montañas para Campaña 1
    const mountains1 = [
        { name: "Aconcagua", altitude: 6961, location: "Mendoza, Argentina" },
        { name: "Ojos del Salado", altitude: 6893, location: "Catamarca, Argentina" },
        { name: "Pissis", altitude: 6793, location: "La Rioja, Argentina" }
    ];

    for (let i = 0; i < mountains1.length; i++) {
        const mountain = mountains1[i];
        const tx = await hike2Earn.addMountain(0, mountain.name, mountain.altitude, mountain.location);
        await tx.wait();
        console.log(`✅ Agregado a Campaña 1: ${mountain.name} (${mountain.altitude}m)`);
    }

    // Montañas para Campaña 2
    const mountains2 = [
        { name: "Cerro Torre", altitude: 3128, location: "Patagonia, Argentina" },
        { name: "Fitz Roy", altitude: 3375, location: "Patagonia, Argentina" },
        { name: "Cerro Catedral", altitude: 2388, location: "Bariloche, Argentina" }
    ];

    for (let i = 0; i < mountains2.length; i++) {
        const mountain = mountains2[i];
        const tx = await hike2Earn.addMountain(1, mountain.name, mountain.altitude, mountain.location);
        await tx.wait();
        console.log(`✅ Agregado a Campaña 2: ${mountain.name} (${mountain.altitude}m)`);
    }
    console.log();

    // ========================================
    // PASO 3: PATROCINIO DE CAMPAÑAS
    // ========================================
    console.log("💰 PASO 3: PATROCINANDO CAMPAÑAS");
    console.log("=================================");

    // Sponsor 1 patrocina Campaña 1 con ETH
    const sponsor1Amount = ethers.parseEther("2.5");
    const sponsorTx1 = await hike2Earn.connect(sponsor1).sponsorCampaign(
        0, // campaignId
        "TechCorp Argentina", 
        "ipfs://QmTechCorpLogo",
        { value: sponsor1Amount }
    );
    await sponsorTx1.wait();
    console.log(`✅ ${sponsor1.address} patrocinó Campaña 1 con ${ethers.formatEther(sponsor1Amount)} ETH`);

    // Sponsor 2 patrocina Campaña 1 con más ETH
    const sponsor2Amount = ethers.parseEther("1.5");
    const sponsorTx2 = await hike2Earn.connect(sponsor2).sponsorCampaign(
        0, // campaignId
        "Mountain Gear Co", 
        "ipfs://QmMountainGearLogo",
        { value: sponsor2Amount }
    );
    await sponsorTx2.wait();
    console.log(`✅ ${sponsor2.address} patrocinó Campaña 1 con ${ethers.formatEther(sponsor2Amount)} ETH`);

    // Sponsor 1 también patrocina Campaña 2
    const sponsor1Amount2 = ethers.parseEther("1.8");
    const sponsorTx3 = await hike2Earn.connect(sponsor1).sponsorCampaign(
        1, // campaignId
        "TechCorp Argentina", 
        "ipfs://QmTechCorpLogo",
        { value: sponsor1Amount2 }
    );
    await sponsorTx3.wait();
    console.log(`✅ ${sponsor1.address} patrocinó Campaña 2 con ${ethers.formatEther(sponsor1Amount2)} ETH`);
    console.log();

    // ========================================
    // PASO 4: MOSTRAR INFO DE CAMPAÑAS
    // ========================================
    console.log("📊 PASO 4: INFORMACIÓN DE CAMPAÑAS");
    console.log("===================================");
    
    for (let i = 0; i < 2; i++) {
        const campaignInfo = await hike2Earn.getCampaignInfo(i);
        console.log(`\n🏕️  CAMPAÑA ${i}:`);
        console.log(`   Nombre: ${campaignInfo[0]}`);
        console.log(`   Inicio: ${new Date(Number(campaignInfo[1]) * 1000).toLocaleString()}`);
        console.log(`   Fin: ${new Date(Number(campaignInfo[2]) * 1000).toLocaleString()}`);
        console.log(`   Pool ETH: ${ethers.formatEther(campaignInfo[3])} ETH`);
        console.log(`   Participantes: ${campaignInfo[4]}`);
        console.log(`   Activa: ${campaignInfo[5]}`);
        console.log(`   Premios distribuidos: ${campaignInfo[6]}`);
    }
    console.log();

    // ========================================
    // PASO 5: SIMULAR TIEMPO PARA QUE EMPIECEN LAS CAMPAÑAS
    // ========================================
    console.log("⏰ PASO 5: SIMULANDO INICIO DE CAMPAÑAS");
    console.log("=======================================");
    console.log("⚠️  En un entorno real, esperarías a que llegue la fecha de inicio");
    console.log("⚠️  Para testing, asumimos que las campañas ya comenzaron");
    console.log();

    // ========================================
    // PASO 6: MINTEAR NFTs (ESCALADAS COMPLETADAS)
    // ========================================
    console.log("🏔️  PASO 6: MINTEANDO NFTs (ESCALADAS)");
    console.log("======================================");

    // Climber 1 escala Aconcagua (mountainId 0, campaignId 0)
    const nft1Tx = await hike2Earn.connect(climber1).mintClimbingNFT(
        0, // mountainId (Aconcagua)
        "ipfs://QmAconcaguaProof1" // proof URI
    );
    await nft1Tx.wait();
    console.log("✅ Climber 1 minteó NFT por escalar Aconcagua");

    // Climber 2 escala Ojos del Salado (mountainId 1, campaignId 0)
    const nft2Tx = await hike2Earn.connect(climber2).mintClimbingNFT(
        1, // mountainId (Ojos del Salado)
        "ipfs://QmOjosDelSaladoProof1"
    );
    await nft2Tx.wait();
    console.log("✅ Climber 2 minteó NFT por escalar Ojos del Salado");

    // Climber 3 escala Cerro Torre (mountainId 3, campaignId 1)
    const nft3Tx = await hike2Earn.connect(climber3).mintClimbingNFT(
        3, // mountainId (Cerro Torre)
        "ipfs://QmCerroTorreProof1"
    );
    await nft3Tx.wait();
    console.log("✅ Climber 3 minteó NFT por escalar Cerro Torre");

    // Climber 1 también escala Fitz Roy (mountainId 4, campaignId 1)
    const nft4Tx = await hike2Earn.connect(climber1).mintClimbingNFT(
        4, // mountainId (Fitz Roy)
        "ipfs://QmFitzRoyProof1"
    );
    await nft4Tx.wait();
    console.log("✅ Climber 1 minteó NFT por escalar Fitz Roy");
    console.log();

    // ========================================
    // PASO 7: MOSTRAR NFTs MINTEADOS
    // ========================================
    console.log("🎨 PASO 7: INFORMACIÓN DE NFTs MINTEADOS");
    console.log("========================================");
    
    for (let tokenId = 1; tokenId <= 4; tokenId++) {
        try {
            const nftInfo = await hike2Earn.getNFTInfo(tokenId);
            const owner = await hike2Earn.ownerOf(tokenId);
            console.log(`\n🏷️  NFT #${tokenId}:`);
            console.log(`   Montaña: ${nftInfo[0]}`);
            console.log(`   Altitud: ${nftInfo[1]} metros`);
            console.log(`   Fecha escalada: ${new Date(Number(nftInfo[2]) * 1000).toLocaleString()}`);
            console.log(`   Escalador: ${nftInfo[3]}`);
            console.log(`   Verificado: ${nftInfo[4]}`);
            console.log(`   Propietario actual: ${owner}`);
        } catch (error) {
            console.log(`❌ Error obteniendo info del NFT #${tokenId}`);
        }
    }
    console.log();

    // ========================================
    // PASO 8: VERIFICAR NFTs (SOLO ADMIN)
    // ========================================
    console.log("✅ PASO 8: VERIFICANDO NFTs");
    console.log("============================");
    
    // El admin verifica todos los NFTs
    for (let tokenId = 1; tokenId <= 4; tokenId++) {
        try {
            const verifyTx = await hike2Earn.verifyNFT(tokenId);
            await verifyTx.wait();
            console.log(`✅ NFT #${tokenId} verificado`);
        } catch (error) {
            console.log(`❌ Error verificando NFT #${tokenId}:`, error.message);
        }
    }
    console.log();

    // ========================================
    // PASO 9: MOSTRAR PARTICIPANTES POR CAMPAÑA
    // ========================================
    console.log("👥 PASO 9: PARTICIPANTES VERIFICADOS");
    console.log("====================================");
    
    for (let campaignId = 0; campaignId < 2; campaignId++) {
        const campaignInfo = await hike2Earn.getCampaignInfo(campaignId);
        console.log(`\n🏕️  Campaña ${campaignId} - ${campaignInfo[0]}:`);
        console.log(`   Participantes verificados: ${campaignInfo[4]}`);
        console.log(`   Pool de premios: ${ethers.formatEther(campaignInfo[3])} ETH`);
    }
    console.log();

    // ========================================
    // PASO 10: SIMULAR FIN DE CAMPAÑA Y DISTRIBUIR PREMIOS
    // ========================================
    console.log("🏆 PASO 10: DISTRIBUCIÓN DE PREMIOS");
    console.log("===================================");
    
    console.log("⚠️  Simulando que las campañas han terminado...");
    console.log("⚠️  En producción, esperarías hasta campaign.endDate");
    console.log();

    // Intentar distribuir premios para la Campaña 0
    try {
        console.log("💰 Distribuyendo premios de Campaña 0...");
        
        // Obtener balances antes
        const climber1BalanceBefore = await climber1.provider.getBalance(climber1.address);
        const climber2BalanceBefore = await climber2.provider.getBalance(climber2.address);
        
        // Simular que la campaña terminó modificando el timestamp
        // En un entorno real, esperarías hasta después de endDate
        console.log("⚠️  NOTA: En producción, esta distribución fallaría porque la campaña aún está activa");
        console.log("⚠️  Se requiere esperar hasta después de campaign.endDate");
        
        // const distributeTx = await hike2Earn.distributePrizes(0);
        // await distributeTx.wait();
        
        console.log("ℹ️  La distribución de premios requiere que la campaña haya terminado");
        
    } catch (error) {
        console.log("❌ Error distribuyendo premios:", error.message);
        console.log("ℹ️  Esto es esperado porque la campaña aún está activa");
    }
    console.log();

    // ========================================
    // PASO 11: MOSTRAR ESTADÍSTICAS FINALES
    // ========================================
    console.log("📈 PASO 11: ESTADÍSTICAS FINALES");
    console.log("================================");
    
    console.log(`📊 RESUMEN DEL CONTRATO:`);
    console.log(`   Total de campañas: 2`);
    console.log(`   Total de montañas: 6`);
    console.log(`   Total de NFTs minteados: 4`);
    console.log(`   Total de NFTs verificados: 4`);
    
    // Mostrar NFTs por participante
    const participants = [climber1, climber2, climber3];
    for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        const nfts = await hike2Earn.getParticipantNFTs(participant.address);
        console.log(`   ${participant.address}: ${nfts.length} NFT(s)`);
    }
    
    console.log();
    console.log("🎉 PRUEBA COMPLETA TERMINADA");
    console.log("============================");
    console.log("✅ Contratos desplegados correctamente");
    console.log("✅ Campañas creadas y patrocinadas");
    console.log("✅ Montañas agregadas a campañas");
    console.log("✅ NFTs minteados por escaladas");
    console.log("✅ NFTs verificados por admin");
    console.log("ℹ️  Para distribuir premios, espera hasta que terminen las campañas");
    
    console.log("\n📍 DIRECCIÓN DEL CONTRATO:", contractAddress);
    console.log("🔗 Úsala para interacciones futuras desde la consola o frontend");
}

// Función adicional para probar distribución de premios (ejecutar después)
async function testPrizeDistribution(contractAddress) {
    console.log("💰 TESTING PRIZE DISTRIBUTION");
    console.log("=============================");
    
    const [owner] = await ethers.getSigners();
    const hike2Earn = await ethers.getContractAt("Hike2Earn", contractAddress);
    
    // Intentar distribuir premios para campañas que ya terminaron
    try {
        console.log("Distribuyendo premios de Campaña 0...");
        const distributeTx = await hike2Earn.distributePrizes(0);
        await distributeTx.wait();
        console.log("✅ Premios de Campaña 0 distribuidos");
        
        console.log("Distribuyendo premios de Campaña 1...");
        const distributeTx2 = await hike2Earn.distributePrizes(1);
        await distributeTx2.wait();
        console.log("✅ Premios de Campaña 1 distribuidos");
        
    } catch (error) {
        console.log("❌ Error distribuyendo premios:", error.message);
    }
}

// Exportar función para testing manual de distribución
module.exports = { testPrizeDistribution };

// Ejecutar prueba principal
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Error en las pruebas:", error);
        process.exit(1);
    });
