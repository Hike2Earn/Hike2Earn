import { ethers } from "hardhat";

async function addMountainExample() {
  // Obtener la dirección del contrato desplegado (necesitarás actualizarla con la dirección real)
  const contractAddress = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82"; // Reemplaza con la dirección real del contrato desplegado
  
  // Obtener el signer (cuenta que ejecutará la transacción)
  const [owner] = await ethers.getSigners();
  console.log("Ejecutando desde la cuenta:", owner.address);

  // Conectar al contrato desplegado
  const Hike2Earn = await ethers.getContractFactory("Hike2Earn");
  const hike2Earn = Hike2Earn.attach(contractAddress);

  try {
    // Ejemplo 1: Agregar el Monte Everest
    console.log("\n=== Agregando Monte Everest ===");
    const tx1 = await (hike2Earn as any).addMountain(
      "Monte Everest",           // _name: Nombre de la montaña
      8849,                      // _heightInMeters: Altura en metros
      "Nepal/Tibet",             // _location: Ubicación
      1000                       // _baseReward: Recompensa base en tokens
    );
    
    await tx1.wait();
    console.log("✅ Monte Everest agregado exitosamente");
    console.log("Hash de transacción:", tx1.hash);

    // Ejemplo 2: Agregar el Aconcagua
    console.log("\n=== Agregando Aconcagua ===");
    const tx2 = await (hike2Earn as any).addMountain(
      "Aconcagua",               // _name
      6961,                      // _heightInMeters
      "Argentina",               // _location
      700                        // _baseReward
    );
    
    await tx2.wait();
    console.log("✅ Aconcagua agregado exitosamente");
    console.log("Hash de transacción:", tx2.hash);

    // Ejemplo 3: Agregar una montaña más pequeña
    console.log("\n=== Agregando Cerro Torre ===");
    const tx3 = await (hike2Earn as any).addMountain(
      "Cerro Torre",             // _name
      3128,                      // _heightInMeters
      "Patagonia, Argentina",    // _location
      300                        // _baseReward
    );
    
    await tx3.wait();
    console.log("✅ Cerro Torre agregado exitosamente");
    console.log("Hash de transacción:", tx3.hash);

    // Verificar que las montañas se agregaron correctamente
    console.log("\n=== Verificando montañas agregadas ===");
    const mountainCount = await (hike2Earn as any).mountainCount();
    console.log("Número total de montañas:", mountainCount.toString());

    // Obtener información de las montañas agregadas
    for (let i = 0; i < Number(mountainCount); i++) {
      const mountain = await (hike2Earn as any).getMountain(i);
      console.log(`\nMontaña ${i}:`);
      console.log(`  Nombre: ${mountain.name}`);
      console.log(`  Altura: ${mountain.heightInMeters} metros`);
      console.log(`  Ubicación: ${mountain.location}`);
      console.log(`  Recompensa base: ${mountain.baseReward} tokens`);
      console.log(`  Activa: ${mountain.isActive}`);
    }

  } catch (error: any) {
    console.error("❌ Error al agregar montañas:", error);
    
    // Verificar si es un error de permisos
    if (error?.message?.includes("Ownable: caller is not the owner")) {
      console.log("💡 Nota: Solo el propietario del contrato puede agregar montañas");
    }
  }
}

// Función para ejecutar con un contrato recién desplegado
async function deployAndAddMountains() {
  console.log("=== Desplegando contrato Hike2Earn ===");
  
  const [owner] = await ethers.getSigners();
  console.log("Desplegando desde la cuenta:", owner.address);

  // Desplegar el contrato
  const Hike2Earn = await ethers.getContractFactory("Hike2Earn");
  const hike2Earn = await Hike2Earn.deploy();
  await hike2Earn.waitForDeployment();

  console.log("✅ Contrato desplegado en:", await hike2Earn.getAddress());

  // Agregar montañas de ejemplo
  console.log("\n=== Agregando montañas de ejemplo ===");

  try {
    // Montaña 1: K2
    const tx1 = await (hike2Earn as any).addMountain(
      "K2",
      8611,
      "Pakistán/China",
      950
    );
    await tx1.wait();
    console.log("✅ K2 agregado");

    // Montaña 2: Denali
    const tx2 = await (hike2Earn as any).addMountain(
      "Denali",
      6190,
      "Alaska, EE.UU.",
      600
    );
    await tx2.wait();
    console.log("✅ Denali agregado");

    // Montaña 3: Kilimanjaro
    const tx3 = await (hike2Earn as any).addMountain(
      "Kilimanjaro",
      5895,
      "Tanzania",
      500
    );
    await tx3.wait();
    console.log("✅ Kilimanjaro agregado");

    console.log("\n=== Resumen ===");
    const count = await (hike2Earn as any).mountainCount();
    console.log(`Total de montañas agregadas: ${count}`);

    // Mostrar todas las montañas
    for (let i = 0; i < Number(count); i++) {
      const mountain = await (hike2Earn as any).getMountain(i);
      console.log(`${i}. ${mountain.name} - ${mountain.heightInMeters}m - ${mountain.location}`);
    }

  } catch (error: any) {
    console.error("❌ Error:", error);
  }
}

// Exportar las funciones para uso
export { addMountainExample, deployAndAddMountains };

// Ejecutar si se llama directamente
if (require.main === module) {
  deployAndAddMountains()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
