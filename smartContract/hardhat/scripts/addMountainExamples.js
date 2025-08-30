// EJEMPLOS DE USO DE LA FUNCIÓN addMountain
// ===============================================

// La función addMountain tiene la siguiente firma:
// function addMountain(
//     string memory _name,        // Nombre de la montaña
//     uint256 _heightInMeters,    // Altura en metros
//     string memory _location,    // Ubicación geográfica
//     uint256 _baseReward         // Recompensa base en tokens
// ) external onlyOwner

// EJEMPLO 1: Monte Everest (la montaña más alta del mundo)
// ========================================================
await hike2Earn.addMountain(
    "Monte Everest",    // _name: Nombre de la montaña
    8849,               // _heightInMeters: 8,849 metros
    "Nepal/Tibet",      // _location: Frontera Nepal-Tibet
    1000                // _baseReward: 1000 tokens base
);

// EJEMPLO 2: Aconcagua (montaña más alta de América)
// ==================================================
await hike2Earn.addMountain(
    "Aconcagua",        // _name: Cerro Aconcagua
    6961,               // _heightInMeters: 6,961 metros
    "Argentina",        // _location: Mendoza, Argentina
    700                 // _baseReward: 700 tokens base
);

// EJEMPLO 3: Kilimanjaro (montaña más alta de África)
// ===================================================
await hike2Earn.addMountain(
    "Kilimanjaro",      // _name: Monte Kilimanjaro
    5895,               // _heightInMeters: 5,895 metros
    "Tanzania",         // _location: Tanzania
    500                 // _baseReward: 500 tokens base
);

// EJEMPLO 4: Montaña local más pequeña
// ====================================
await hike2Earn.addMountain(
    "Cerro Catedral",   // _name: Cerro Catedral
    2388,               // _heightInMeters: 2,388 metros
    "Bariloche, Argentina", // _location: Río Negro, Argentina
    200                 // _baseReward: 200 tokens base
);

// EJEMPLO 5: Pico europeo
// =======================
await hike2Earn.addMountain(
    "Mont Blanc",       // _name: Mont Blanc
    4807,               // _heightInMeters: 4,807 metros
    "Francia/Italia/Suiza", // _location: Alpes
    400                 // _baseReward: 400 tokens base
);

// NOTAS IMPORTANTES:
// ==================
// 1. Solo el propietario (owner) del contrato puede ejecutar esta función
// 2. La recompensa final se calcula como: baseReward + (altura / 100)
//    Por ejemplo, Everest: 1000 + (8849 / 100) = 1000 + 88 = 1088 tokens
// 3. Las montañas se crean automáticamente como activas (isActive = true)
// 4. Cada montaña recibe un ID único secuencial (0, 1, 2, ...)
// 5. Se emite un evento MountainAdded cuando se agrega exitosamente

// FÓRMULA DE RECOMPENSA TOTAL:
// ============================
// Recompensa Total = baseReward + (heightInMeters / 100)
//
// Ejemplos de recompensas calculadas:
// - Everest (8849m, base 1000): 1000 + 88 = 1088 tokens
// - Aconcagua (6961m, base 700): 700 + 69 = 769 tokens
// - Kilimanjaro (5895m, base 500): 500 + 58 = 558 tokens
// - Cerro Catedral (2388m, base 200): 200 + 23 = 223 tokens
