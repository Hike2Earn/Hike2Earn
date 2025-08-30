const { ethers } = require("hardhat");

async function main() {
    console.log("🏔️  CREANDO MONTAÑAS EN HIKE2EARN 🏔️");
    console.log("=====================================\n");

    // Obtener la cuenta que desplegará el contrato
    const [deployer] = await ethers.getSigners();
    console.log("👤 Desplegando contratos con la cuenta:", deployer.address);

    // Verificar balance
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH\n");

    // Desplegar el contrato Hike2Earn
    console.log("🚀 Desplegando contrato Hike2Earn...");
    const Hike2Earn = await ethers.getContractFactory("Hike2Earn");
    const hike2Earn = await Hike2Earn.deploy();
    
    await hike2Earn.waitForDeployment();
    const contractAddress = await hike2Earn.getAddress();
    console.log("✅ Contrato desplegado en:", contractAddress);
    console.log("🔗 Guarda esta dirección para futuras interacciones\n");

    // EJEMPLO 1: Monte Everest
    console.log("🗻 Agregando Monte Everest...");
    try {
        const tx1 = await hike2Earn.addMountain(
            "Monte Everest",        // Nombre
            8849,                   // 8,849 metros de altura
            "Nepal/Tibet",          // Ubicación
            1000                    // 1000 tokens de recompensa base
        );
        await tx1.wait();
        console.log("✅ Monte Everest agregado exitosamente");
        console.log("   📊 Recompensa total: 1000 + (8849÷100) = 1088 tokens\n");
    } catch (error) {
        console.error("❌ Error agregando Monte Everest:", error.message);
    }

    // EJEMPLO 2: Aconcagua
    console.log("⛰️  Agregando Aconcagua...");
    try {
        const tx2 = await hike2Earn.addMountain(
            "Aconcagua",            // Nombre
            6961,                   // 6,961 metros de altura
            "Argentina",            // Ubicación
            700                     // 700 tokens de recompensa base
        );
        await tx2.wait();
        console.log("✅ Aconcagua agregado exitosamente");
        console.log("   📊 Recompensa total: 700 + (6961÷100) = 769 tokens\n");
    } catch (error) {
        console.error("❌ Error agregando Aconcagua:", error.message);
    }

    // EJEMPLO 3: Kilimanjaro
    console.log("🌋 Agregando Kilimanjaro...");
    try {
        const tx3 = await hike2Earn.addMountain(
            "Kilimanjaro",          // Nombre
            5895,                   // 5,895 metros de altura
            "Tanzania",             // Ubicación
            500                     // 500 tokens de recompensa base
        );
        await tx3.wait();
        console.log("✅ Kilimanjaro agregado exitosamente");
        console.log("   📊 Recompensa total: 500 + (5895÷100) = 558 tokens\n");
    } catch (error) {
        console.error("❌ Error agregando Kilimanjaro:", error.message);
    }

    // EJEMPLO 4: Una montaña más accesible
    console.log("🏔️  Agregando Cerro Catedral...");
    try {
        const tx4 = await hike2Earn.addMountain(
            "Cerro Catedral",       // Nombre
            2388,                   // 2,388 metros de altura
            "Bariloche, Argentina", // Ubicación
            200                     // 200 tokens de recompensa base
        );
        await tx4.wait();
        console.log("✅ Cerro Catedral agregado exitosamente");
        console.log("   📊 Recompensa total: 200 + (2388÷100) = 223 tokens\n");
    } catch (error) {
        console.error("❌ Error agregando Cerro Catedral:", error.message);
    }

    // Verificar el estado final
    console.log("📋 RESUMEN FINAL");
    console.log("================");
    try {
        const totalMountains = await hike2Earn.mountainCount();
        console.log(`🏔️  Total de montañas creadas: ${totalMountains}`);

        for (let i = 0; i < Number(totalMountains); i++) {
            const mountain = await hike2Earn.getMountain(i);
            const totalReward = Number(mountain.baseReward) + Math.floor(Number(mountain.heightInMeters) / 100);
            
            console.log(`\n🗻 Montaña ${i}: ${mountain.name}`);
            console.log(`   📍 Ubicación: ${mountain.location}`);
            console.log(`   📏 Altura: ${mountain.heightInMeters} metros`);
            console.log(`   🪙 Recompensa base: ${mountain.baseReward} tokens`);
            console.log(`   💰 Recompensa total: ${totalReward} tokens`);
            console.log(`   ✅ Activa: ${mountain.isActive}`);
        }

        console.log("\n🎉 ¡Todas las montañas han sido creadas exitosamente!");
        console.log(`📍 Dirección del contrato: ${contractAddress}`);
        
    } catch (error) {
        console.error("❌ Error obteniendo información de las montañas:", error.message);
    }
}

// Función auxiliar para mostrar cómo usar la función addMountain
function mostrarEjemplosDeUso() {
    console.log("\n📚 EJEMPLOS DE USO DE LA FUNCIÓN addMountain:");
    console.log("==============================================");
    
    console.log(`
// Sintaxis básica:
await hike2Earn.addMountain(
    "Nombre de la Montaña",    // string: nombre
    alturaEnMetros,            // uint256: altura en metros
    "Ubicación",               // string: ubicación geográfica
    recompensaBase             // uint256: tokens de recompensa base
);

// Ejemplo práctico:
await hike2Earn.addMountain(
    "Monte Fitz Roy",          // Nombre
    3375,                      // 3,375 metros
    "Patagonia, Argentina",    // Ubicación
    300                        // 300 tokens base
);

// La recompensa total se calcula automáticamente:
// Recompensa Total = recompensaBase + (altura / 100)
// Para Monte Fitz Roy: 300 + (3375 / 100) = 300 + 33 = 333 tokens
    `);
}

// Ejecutar el script principal
main()
    .then(() => {
        mostrarEjemplosDeUso();
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Error ejecutando el script:", error);
        process.exit(1);
    });
