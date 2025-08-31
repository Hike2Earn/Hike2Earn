const { ethers } = require("hardhat");

/**
 * Script para crear campañas de ejemplo en el contrato desplegado
 * Esto permitirá mostrar campañas en la página de Campaigns
 */
async function main() {
    console.log("🏔️  CREANDO CAMPAÑAS DE EJEMPLO");
    console.log("================================\n");

    const [owner] = await ethers.getSigners();
    console.log("👤 Owner:", owner.address);
    console.log();

    // Dirección del contrato desplegado en Lisk Sepolia
    const contractAddress = "0xD9986E17F96e99D11330F72F90f78982b8F29570";

    // Verificar si el contrato existe
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
        console.error("❌ Contrato no encontrado en la dirección especificada");
        return;
    }

    console.log("✅ Contrato encontrado en:", contractAddress);

    // Conectar al contrato
    const Hike2Earn = await ethers.getContractFactory("Hike2Earn");
    const hike2Earn = Hike2Earn.attach(contractAddress);

    console.log("🔗 Conectado al contrato existente\n");

    // Obtener el número actual de campañas
    const currentCount = await hike2Earn.campaignCount();
    console.log(`📊 Número actual de campañas: ${currentCount}\n`);

    if (currentCount > 0) {
        console.log("ℹ️  Ya hay campañas creadas. Creando más campañas de ejemplo...\n");
    }

    // ========================================
    // CREAR CAMPAÑAS DE EJEMPLO
    // ========================================

    const campaigns = [
        {
            name: "Expedición Aconcagua 2025",
            description: "La expedición más desafiante a la montaña más alta de América",
            startDate: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 días desde ahora
            endDate: Math.floor(Date.now() / 1000) + (60 * 24 * 60 * 60), // 60 días desde ahora
        },
        {
            name: "Torres del Paine Trek",
            description: "Trekking por los glaciares más impresionantes de Patagonia",
            startDate: Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60), // 15 días desde ahora
            endDate: Math.floor(Date.now() / 1000) + (25 * 24 * 60 * 60), // 25 días desde ahora
        },
        {
            name: "Volcán Villarrica Ascenso",
            description: "Experiencia única escalando un volcán activo",
            startDate: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 días desde ahora
            endDate: Math.floor(Date.now() / 1000) + (10 * 24 * 60 * 60), // 10 días desde ahora
        },
        {
            name: "Cerro Manquehue Challenge",
            description: "Desafío técnico en las cercanías de Santiago",
            startDate: Math.floor(Date.now() / 1000) + (3 * 24 * 60 * 60), // 3 días desde ahora
            endDate: Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60), // 5 días desde ahora
        }
    ];

    console.log("📅 CREANDO CAMPAÑAS:");
    console.log("===================");

    const createdCampaigns = [];

    for (let i = 0; i < campaigns.length; i++) {
        const campaign = campaigns[i];
        console.log(`\n🏔️  Creando campaña ${i + 1}: "${campaign.name}"`);

        try {
            const tx = await hike2Earn.createCampaign(
                campaign.name,
                campaign.startDate,
                campaign.endDate
            );

            console.log("⏳ Esperando confirmación...");
            const receipt = await tx.wait();

            console.log("✅ Campaña creada exitosamente!");
            console.log(`   📅 Inicio: ${new Date(campaign.startDate * 1000).toLocaleDateString()}`);
            console.log(`   📅 Fin: ${new Date(campaign.endDate * 1000).toLocaleDateString()}`);
            console.log(`   ⛓️  TX Hash: ${receipt.hash}`);

            // Agregar algunas montañas a cada campaña
            await addMountainsToCampaign(hike2Earn, Number(currentCount) + i, campaign.name);

            createdCampaigns.push({
                id: Number(currentCount) + i,
                ...campaign,
                txHash: receipt.hash
            });

        } catch (error) {
            console.error(`❌ Error creando campaña "${campaign.name}":`, error.message);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 RESUMEN DE CAMPAÑAS CREADAS");
    console.log("=".repeat(50));

    for (const campaign of createdCampaigns) {
        console.log(`\n🏔️  Campaña #${campaign.id}: ${campaign.name}`);
        console.log(`   📝 Descripción: ${campaign.description}`);
        console.log(`   📅 Período: ${new Date(campaign.startDate * 1000).toLocaleDateString()} - ${new Date(campaign.endDate * 1000).toLocaleDateString()}`);
        console.log(`   ⛓️  TX: ${campaign.txHash}`);
    }

    // Verificar el total de campañas
    const finalCount = await hike2Earn.campaignCount();
    console.log(`\n📊 TOTAL DE CAMPAÑAS EN EL CONTRATO: ${finalCount}`);

    console.log("\n" + "🎯 PRÓXIMOS PASOS:");
    console.log("1. Ejecuta 'npm run dev' en el directorio front/");
    console.log("2. Conecta tu wallet a Lisk Sepolia");
    console.log("3. Ve a la página de Campaigns");
    console.log("4. ¡Deberías ver las nuevas campañas!");
}

// Función auxiliar para agregar montañas a una campaña
async function addMountainsToCampaign(contract, campaignId, campaignName) {
    const mountainsByCampaign = {
        "Expedición Aconcagua 2025": [
            { name: "Aconcagua", altitude: 6962, location: "Mendoza, Argentina" },
            { name: "Cerro Bonete", altitude: 6759, location: "La Rioja, Argentina" },
        ],
        "Torres del Paine Trek": [
            { name: "Torres del Paine", altitude: 2500, location: "Patagonia, Chile" },
            { name: "Cerro Almirante Nieto", altitude: 2670, location: "Patagonia, Chile" },
        ],
        "Volcán Villarrica Ascenso": [
            { name: "Volcán Villarrica", altitude: 2847, location: "Pucón, Chile" },
            { name: "Volcán Llaima", altitude: 3125, location: "Temuco, Chile" },
        ],
        "Cerro Manquehue Challenge": [
            { name: "Cerro Manquehue", altitude: 1632, location: "Santiago, Chile" },
            { name: "Cerro Pochoco", altitude: 2414, location: "Santiago, Chile" },
        ]
    };

    const mountains = mountainsByCampaign[campaignName] || [
        { name: "Monte Demo", altitude: 2000, location: "Demo Location" }
    ];

    console.log(`   🏔️  Agregando ${mountains.length} montañas:`);

    for (const mountain of mountains) {
        try {
            const tx = await contract.addMountain(
                campaignId,
                mountain.name,
                mountain.altitude,
                mountain.location
            );
            await tx.wait();
            console.log(`     ✅ ${mountain.name} (${mountain.altitude}m) - ${mountain.location}`);
        } catch (error) {
            console.error(`     ❌ Error agregando ${mountain.name}:`, error.message);
        }
    }
}

main()
    .then(() => {
        console.log("\n🎉 Script completado exitosamente!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Error ejecutando el script:", error);
        process.exit(1);
    });
