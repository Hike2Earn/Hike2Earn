const { ethers, network } = require("hardhat");

async function main() {
    console.log("🏔️  DESPLEGANDO HIKE2EARN NFT REWARDS SYSTEM 🏔️");
    console.log("==================================================\n");

    const [deployer] = await ethers.getSigners();
    console.log("👤 Desplegando con la cuenta:", deployer.address);
    
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

    // Desplegar el contrato
    console.log("🚀 Desplegando contrato Hike2Earn...");
    const Hike2Earn = await ethers.getContractFactory("Hike2Earn");
    const hike2Earn = await Hike2Earn.deploy();
    
    await hike2Earn.waitForDeployment();
    const contractAddress = await hike2Earn.getAddress();
    console.log("✅ Contrato desplegado en:", contractAddress);

    // Crear una campaña de ejemplo con fechas inmediatas
    console.log("\n📅 Creando campaña de ejemplo...");
    const now = Math.floor(Date.now() / 1000);
    const campaignStart = now + 300; // Empieza ahora
    const campaignEnd = now + (30 * 24 * 60 * 60); // Termina en 30 días
    
    const tx1 = await hike2Earn.createCampaign(
        "Desafío Montañas de Argentina 2025",
        campaignStart,
        campaignEnd
    );
    await tx1.wait();
    console.log("✅ Campaña creada exitosamente");

    // Agregar montañas a la campaña
    console.log("\n🗻 Agregando montañas a la campaña...");
    
    // Aconcagua
    const tx2 = await hike2Earn.addMountain(
        0, // campaignId
        "Aconcagua",
        6961,
        "Mendoza, Argentina"
    );
    await tx2.wait();
    console.log("✅ Aconcagua agregado (6,961m)");

    // Cerro Torre
    const tx3 = await hike2Earn.addMountain(
        0, // campaignId
        "Cerro Torre",
        3128,
        "Patagonia, Argentina"
    );
    await tx3.wait();
    console.log("✅ Cerro Torre agregado (3,128m)");

    // Cerro Catedral
    const tx4 = await hike2Earn.addMountain(
        0, // campaignId
        "Cerro Catedral",
        2388,
        "Bariloche, Argentina"
    );
    await tx4.wait();
    console.log("✅ Cerro Catedral agregado (2,388m)");

    // Mostrar información de la campaña
    console.log("\n📊 INFORMACIÓN DE LA CAMPAÑA");
    console.log("=============================");
    const campaignInfo = await hike2Earn.getCampaignInfo(0);
    console.log("Nombre:", campaignInfo[0]);
    console.log("Fecha inicio:", new Date(Number(campaignInfo[1]) * 1000).toLocaleString());
    console.log("Fecha fin:", new Date(Number(campaignInfo[2]) * 1000).toLocaleString());
    console.log("Pool de premios ETH:", ethers.formatEther(campaignInfo[3]), "ETH");
    console.log("Participantes:", campaignInfo[4].toString());
    console.log("Activa:", campaignInfo[5]);
    console.log("Premios distribuidos:", campaignInfo[6]);

    console.log("\n🎉 DESPLIEGUE COMPLETADO");
    console.log("========================");
    console.log("📍 Dirección del contrato:", contractAddress);
    console.log("🔗 Guarda esta dirección para interacciones futuras");
    
    return { hike2Earn, contractAddress };
}

// Función para mostrar cómo usar el contrato después del deploy
function mostrarEjemplosDeUso() {
    console.log("\n\n📖 GUÍA DE USO DEL CONTRATO");
    console.log("============================");
    
    console.log(`
🏗️  FLUJO BÁSICO:
1. Admin crea campañas con fechas de inicio y fin
2. Admin agrega montañas a cada campaña
3. Patrocinadores contribuyen ETH/tokens al pool de premios
4. Participantes mintean NFTs cuando completan escaladas
5. Admin verifica las escaladas (validando pruebas)
6. Al final de la campaña, el admin distribuye premios

🔧 FUNCIONES PRINCIPALES:

📅 GESTIÓN DE CAMPAÑAS (Solo Admin):
- createCampaign(name, startDate, endDate)
- addMountain(campaignId, name, altitude, location)
- closeCampaign(campaignId)

💰 PATROCINIO:
- sponsorCampaign(campaignId, sponsorName, logoURI) + ETH
- sponsorCampaignERC20(campaignId, tokenAddress, amount)

🏔️  PARTICIPACIÓN:
- mintClimbingNFT(mountainId, proofURI)
- getNFTInfo(tokenId) -> metadata del NFT

✅ VERIFICACIÓN (Solo Admin):
- verifyNFT(tokenId)

💸 DISTRIBUCIÓN DE PREMIOS (Solo Admin):
- distributePrizes(campaignId)

🔍 CONSULTAS:
- getCampaignInfo(campaignId)
- getParticipantNFTs(address)
- getCampaignERC20Pool(campaignId, tokenAddress)

🛡️  SEGURIDAD:
- ReentrancyGuard para prevenir ataques
- Validaciones de entrada en todas las funciones
- Solo participantes verificados reciben premios
- Distribución equitativa automática
    `);
}

main()
    .then(({ hike2Earn, contractAddress }) => {
        mostrarEjemplosDeUso();
        console.log("\n📚 PRÓXIMOS PASOS:");
        console.log("=================");
        console.log("1. Ejecuta el script de pruebas:");
        console.log(`   npx hardhat run scripts/testHike2Earn.js --network localhost`);
        console.log("\n2. O usa la consola de Hardhat:");
        console.log("   npx hardhat console --network localhost");
        console.log(`   const hike2Earn = await ethers.getContractAt("Hike2Earn", "${contractAddress}");`);
        
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Error:", error);
        process.exit(1);
    });
