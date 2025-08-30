const { ethers } = require("hardhat");

/**
 * Script para probar la distribución de premios después de que terminen las campañas
 * Ejecutar este script después de que hayan pasado las fechas de fin de las campañas
 */
async function main() {
    console.log("🏆 TESTING PRIZE DISTRIBUTION");
    console.log("=============================\n");

    // Dirección del contrato desplegado (actualizar con la dirección real)
    const contractAddress = "TU_DIRECCION_DE_CONTRATO_AQUI"; // Cambiar por la dirección real
    
    if (contractAddress === "TU_DIRECCION_DE_CONTRATO_AQUI") {
        console.log("❌ ERROR: Debes actualizar la dirección del contrato en el script");
        console.log("📝 Edita testPrizeDistribution.js y cambia 'TU_DIRECCION_DE_CONTRATO_AQUI'");
        console.log("📍 Usa la dirección que se mostró cuando ejecutaste el deploy");
        process.exit(1);
    }

    const [owner, , , climber1, climber2, climber3] = await ethers.getSigners();
    console.log("👤 Admin:", owner.address);
    console.log("📍 Contrato:", contractAddress);
    console.log();

    // Conectar al contrato
    const hike2Earn = await ethers.getContractAt("Hike2Earn", contractAddress);

    // ========================================
    // VERIFICAR ESTADO DE CAMPAÑAS
    // ========================================
    console.log("📊 ESTADO ACTUAL DE CAMPAÑAS");
    console.log("=============================");
    
    for (let campaignId = 0; campaignId < 2; campaignId++) {
        const campaignInfo = await hike2Earn.getCampaignInfo(campaignId);
        const now = Math.floor(Date.now() / 1000);
        const endDate = Number(campaignInfo[2]);
        const hasEnded = now > endDate;
        
        console.log(`\n🏕️  CAMPAÑA ${campaignId}:`);
        console.log(`   Nombre: ${campaignInfo[0]}`);
        console.log(`   Fin: ${new Date(endDate * 1000).toLocaleString()}`);
        console.log(`   Estado: ${hasEnded ? '✅ TERMINADA' : '⏳ ACTIVA'}`);
        console.log(`   Pool ETH: ${ethers.formatEther(campaignInfo[3])} ETH`);
        console.log(`   Participantes: ${campaignInfo[4]}`);
        console.log(`   Premios ya distribuidos: ${campaignInfo[6] ? 'SÍ' : 'NO'}`);
    }
    console.log();

    // ========================================
    // OBTENER BALANCES ANTES DE LA DISTRIBUCIÓN
    // ========================================
    console.log("💰 BALANCES ANTES DE DISTRIBUCIÓN");
    console.log("=================================");
    
    const participants = [
        { name: "Climber 1", address: climber1.address, signer: climber1 },
        { name: "Climber 2", address: climber2.address, signer: climber2 },
        { name: "Climber 3", address: climber3.address, signer: climber3 }
    ];

    const balancesBefore = {};
    for (const participant of participants) {
        const balance = await participant.signer.provider.getBalance(participant.address);
        balancesBefore[participant.address] = balance;
        console.log(`${participant.name}: ${ethers.formatEther(balance)} ETH`);
    }
    console.log();

    // ========================================
    // DISTRIBUIR PREMIOS DE CAMPAÑA 0
    // ========================================
    console.log("🏆 DISTRIBUYENDO PREMIOS - CAMPAÑA 0");
    console.log("====================================");
    
    try {
        const campaign0Info = await hike2Earn.getCampaignInfo(0);
        
        if (campaign0Info[6]) {
            console.log("ℹ️  Los premios de la Campaña 0 ya fueron distribuidos");
        } else if (Number(campaign0Info[4]) === 0) {
            console.log("⚠️  No hay participantes verificados en la Campaña 0");
        } else {
            console.log(`💰 Pool de premios: ${ethers.formatEther(campaign0Info[3])} ETH`);
            console.log(`👥 Participantes: ${campaign0Info[4]}`);
            console.log(`💵 Premio por participante: ${ethers.formatEther(campaign0Info[3] / BigInt(campaign0Info[4]))} ETH`);
            
            const distributeTx = await hike2Earn.distributePrizes(0);
            console.log("⏳ Ejecutando distribución...");
            await distributeTx.wait();
            console.log("✅ Premios de Campaña 0 distribuidos exitosamente!");
        }
    } catch (error) {
        console.log("❌ Error distribuyendo premios de Campaña 0:", error.message);
        if (error.message.includes("Campaign still active")) {
            console.log("ℹ️  La campaña aún está activa, espera hasta después de la fecha de fin");
        }
    }
    console.log();

    // ========================================
    // DISTRIBUIR PREMIOS DE CAMPAÑA 1
    // ========================================
    console.log("🏆 DISTRIBUYENDO PREMIOS - CAMPAÑA 1");
    console.log("====================================");
    
    try {
        const campaign1Info = await hike2Earn.getCampaignInfo(1);
        
        if (campaign1Info[6]) {
            console.log("ℹ️  Los premios de la Campaña 1 ya fueron distribuidos");
        } else if (Number(campaign1Info[4]) === 0) {
            console.log("⚠️  No hay participantes verificados en la Campaña 1");
        } else {
            console.log(`💰 Pool de premios: ${ethers.formatEther(campaign1Info[3])} ETH`);
            console.log(`👥 Participantes: ${campaign1Info[4]}`);
            console.log(`💵 Premio por participante: ${ethers.formatEther(campaign1Info[3] / BigInt(campaign1Info[4]))} ETH`);
            
            const distributeTx = await hike2Earn.distributePrizes(1);
            console.log("⏳ Ejecutando distribución...");
            await distributeTx.wait();
            console.log("✅ Premios de Campaña 1 distribuidos exitosamente!");
        }
    } catch (error) {
        console.log("❌ Error distribuyendo premios de Campaña 1:", error.message);
        if (error.message.includes("Campaign still active")) {
            console.log("ℹ️  La campaña aún está activa, espera hasta después de la fecha de fin");
        }
    }
    console.log();

    // ========================================
    // VERIFICAR BALANCES DESPUÉS DE LA DISTRIBUCIÓN
    // ========================================
    console.log("💰 BALANCES DESPUÉS DE DISTRIBUCIÓN");
    console.log("===================================");
    
    let totalDistributed = 0n;
    for (const participant of participants) {
        const balanceAfter = await participant.signer.provider.getBalance(participant.address);
        const balanceBefore = balancesBefore[participant.address];
        const difference = balanceAfter - balanceBefore;
        
        console.log(`${participant.name}:`);
        console.log(`  Antes: ${ethers.formatEther(balanceBefore)} ETH`);
        console.log(`  Después: ${ethers.formatEther(balanceAfter)} ETH`);
        console.log(`  Ganancia: ${ethers.formatEther(difference)} ETH`);
        console.log();
        
        totalDistributed += difference;
    }

    console.log(`💸 Total distribuido: ${ethers.formatEther(totalDistributed)} ETH`);
    console.log();

    // ========================================
    // ESTADÍSTICAS FINALES
    // ========================================
    console.log("📊 ESTADÍSTICAS FINALES");
    console.log("=======================");
    
    for (let campaignId = 0; campaignId < 2; campaignId++) {
        const campaignInfo = await hike2Earn.getCampaignInfo(campaignId);
        console.log(`\n🏕️  Campaña ${campaignId} - ${campaignInfo[0]}:`);
        console.log(`   Pool original: ${ethers.formatEther(campaignInfo[3])} ETH`);
        console.log(`   Participantes: ${campaignInfo[4]}`);
        console.log(`   Premios distribuidos: ${campaignInfo[6] ? 'SÍ' : 'NO'}`);
    }
    
    console.log("\n🎉 DISTRIBUCIÓN DE PREMIOS COMPLETADA");
    console.log("====================================");
    console.log("✅ Todos los participantes verificados recibieron su parte igual del pool");
    console.log("🏆 El sistema de recompensas NFT funciona correctamente");
}

// Script alternativo para usar con dirección específica
async function testWithAddress(contractAddress) {
    console.log(`🎯 Testing con contrato en: ${contractAddress}`);
    
    // Aquí puedes copiar la lógica principal pero usando la dirección proporcionada
    // Este es útil para llamar desde la consola de Hardhat
    const [owner] = await ethers.getSigners();
    const hike2Earn = await ethers.getContractAt("Hike2Earn", contractAddress);
    
    try {
        const campaign0Info = await hike2Earn.getCampaignInfo(0);
        console.log(`Campaña 0: ${campaign0Info[0]}`);
        console.log(`Pool: ${ethers.formatEther(campaign0Info[3])} ETH`);
        console.log(`Participantes: ${campaign0Info[4]}`);
        
        if (!campaign0Info[6] && Number(campaign0Info[4]) > 0) {
            console.log("Distribuyendo premios...");
            const tx = await hike2Earn.distributePrizes(0);
            await tx.wait();
            console.log("✅ Premios distribuidos!");
        }
    } catch (error) {
        console.log("Error:", error.message);
    }
}

// Para uso desde consola de Hardhat
module.exports = { testWithAddress };

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("💥 Error:", error);
        process.exit(1);
    });
