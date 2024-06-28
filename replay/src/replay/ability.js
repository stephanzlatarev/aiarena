import Event from "./event.js";

class Effect {

  constructor(type, out) {
    this.type = type;
    this.out = out;
  }

  toEvent(loop, pid, uid) {
    return new Event(this.type, loop, pid, uid, this.out);
  }

}

const EFFECTS = {
   6900: new Effect(Event.Make, "FluxVanes"),
   6902: new Effect(Event.Make, "PulseCrystals"),
   6904: new Effect(Event.Make, "BosonicCore"),
   6905: new Effect(Event.Make, "GravitySling"),
   7000: new Effect(Event.Harm, "FungalGrowth"),
   7100: new Effect(Event.Help, "GuardianShield"),
   7200: new Effect(Event.Help, "Repair"),
   7400: new Effect(Event.Make, "Mothership"),
   7500: new Effect(Event.Harm, "Feedback"),
   7600: new Effect(Event.Help, "MassRecall"),
   7800: new Effect(Event.Make, "HallucinationArchon"),
   7900: new Effect(Event.Make, "HallucinationColossus"),
   8000: new Effect(Event.Make, "HallucinationHighTemplar"),
   8100: new Effect(Event.Make, "HallucinationImmortal"),
   8200: new Effect(Event.Make, "HallucinationPhoenix"),
   8300: new Effect(Event.Make, "HallucinationProbe"),
   8400: new Effect(Event.Make, "HallucinationStalker"),
   8500: new Effect(Event.Make, "HallucinationVoidRay"),
   8600: new Effect(Event.Make, "HallucinationWarpPrism"),
   8700: new Effect(Event.Make, "HallucinationZealot"),
   9100: new Effect(Event.Harm, "GravitonBeam"),
   9500: new Effect(Event.Make, "Changling"),
  10701: new Effect(Event.Make, "GlialReconstitution"),
  10702: new Effect(Event.Make, "TunnelingClaws"),
  11000: new Effect(Event.Harm, "InfestorNeuralParasite"),
  11200: new Effect(Event.Help, "UseStimpack"),
  11700: new Effect(Event.Make, "AnabolicSynthesis"),
  11702: new Effect(Event.Make, "ChitinousPlating"),
  11703: new Effect(Event.Make, "BurrowCharge"),
  12800: new Effect(Event.Help, "Repair"),
  12900: new Effect(Event.Make, "CommandCenter"),
  12901: new Effect(Event.Make, "SupplyDepot"),
  12902: new Effect(Event.Make, "Refinery"),
  12903: new Effect(Event.Make, "Barracks"),
  12904: new Effect(Event.Make, "EngineeringBay"),
  12905: new Effect(Event.Make, "MissileTurret"),
  12906: new Effect(Event.Make, "Bunker"),
  12908: new Effect(Event.Make, "SensorTower"),
  12909: new Effect(Event.Make, "GhostAcademy"),
  12910: new Effect(Event.Make, "Factory"),
  12911: new Effect(Event.Make, "Starport"),
  12913: new Effect(Event.Make, "Armory"),
  12915: new Effect(Event.Make, "FusionCore"),
  13100: new Effect(Event.Help, "UseStimpack"),
  13200: new Effect(Event.Help, "CloakGhost"),
  13400: new Effect(Event.Help, "HealMedivac"),
  13500: new Effect(Event.Help, "SiegeMode"),
  13700: new Effect(Event.Help, "CloakBanshee"),
  13800: new Effect(Event.Help, "Load"),
  13801: new Effect(Event.Help, "UnloadAll"),
  13802: new Effect(Event.Help, "Unload"),
  13803: new Effect(Event.Help, "UnloadUnit"),
  13804: new Effect(Event.Help, "LoadAll"),
  13900: new Effect(Event.Harm, "ScannerSweep"),
  14000: new Effect(Event.Harm, "YamatoGun"),
  14100: new Effect(Event.Help, "AssaultMode"),
  14200: new Effect(Event.Help, "FighterMode"),
  14300: new Effect(Event.Help, "Load"),
  14301: new Effect(Event.Help, "UnloadAll"),
  14302: new Effect(Event.Help, "Unload"),
  14303: new Effect(Event.Help, "UnloadUnit"),
  14304: new Effect(Event.Help, "LoadAll"),
  14400: new Effect(Event.Help, "Load"),
  14401: new Effect(Event.Help, "UnloadAll"),
  14402: new Effect(Event.Help, "Unload"),
  14403: new Effect(Event.Help, "UnloadUnit"),
  14404: new Effect(Event.Help, "LoadAll"),
  14700: new Effect(Event.Make, "BarracksTechLab"),
  14701: new Effect(Event.Make, "BarracksReactor"),
  14900: new Effect(Event.Make, "FactoryTechLab"),
  14901: new Effect(Event.Make, "FactoryReactor"),
  15100: new Effect(Event.Make, "StarportTechLab"),
  15101: new Effect(Event.Make, "StarportReactor"),
  15500: new Effect(Event.Make, "SCV"),
  15900: new Effect(Event.Make, "Marine"),
  15901: new Effect(Event.Make, "Reaper"),
  15902: new Effect(Event.Make, "Ghost"),
  15903: new Effect(Event.Make, "Marauder"),
  16001: new Effect(Event.Make, "SiegeTank"),
  16004: new Effect(Event.Make, "Thor"),
  16005: new Effect(Event.Make, "Hellion"),
  16006: new Effect(Event.Make, "Hellbat"),
  16007: new Effect(Event.Make, "Cyclone"),
  16024: new Effect(Event.Make, "WidowMine"),
  16100: new Effect(Event.Make, "Medivac"),
  16101: new Effect(Event.Make, "Banshee"),
  16102: new Effect(Event.Make, "Raven"),
  16103: new Effect(Event.Make, "Battlecruiser"),
  16104: new Effect(Event.Make, "Viking"),
  16106: new Effect(Event.Make, "Liberator"),
  16200: new Effect(Event.Make, "HiSecAutoTracking"),
  16201: new Effect(Event.Make, "StructureArmor"),
  16202: new Effect(Event.Make, "TerranInfantryWeapons1"),
  16203: new Effect(Event.Make, "TerranInfantryWeapons2"),
  16204: new Effect(Event.Make, "TerranInfantryWeapons3"),
  16205: new Effect(Event.Make, "NeosteelFrame"),
  16206: new Effect(Event.Make, "TerranInfantryArmor1"),
  16207: new Effect(Event.Make, "TerranInfantryArmor2"),
  16208: new Effect(Event.Make, "TerranInfantryArmor3"),
  16400: new Effect(Event.Make, "Nuke"),
  16500: new Effect(Event.Make, "Stimpack"),
  16501: new Effect(Event.Make, "CombatShield"),
  16502: new Effect(Event.Make, "ConcussiveShells"),
  16601: new Effect(Event.Make, "InfernalPreIgniter"),
  16604: new Effect(Event.Make, "DrillingClaws"),
  16605: new Effect(Event.Make, "SmartServos"),
  16700: new Effect(Event.Make, "CloakingField"),
  16709: new Effect(Event.Make, "BansheeSpeed"),
  16717: new Effect(Event.Make, "InterferenceMatrix"),
  16800: new Effect(Event.Make, "PersonalCloaking"),
  16902: new Effect(Event.Make, "VehiclePlating1"),
  16903: new Effect(Event.Make, "VehiclePlating2"),
  16904: new Effect(Event.Make, "VehiclePlating3"),
  16905: new Effect(Event.Make, "VehicleWeapons1"),
  16906: new Effect(Event.Make, "VehicleWeapons2"),
  16907: new Effect(Event.Make, "VehicleWeapons3"),
  16908: new Effect(Event.Make, "ShipPlating1"),
  16909: new Effect(Event.Make, "ShipPlating2"),
  16910: new Effect(Event.Make, "ShipPlating3"),
  16911: new Effect(Event.Make, "ShipWeapons1"),
  16912: new Effect(Event.Make, "ShipWeapons2"),
  16913: new Effect(Event.Make, "ShipWeapons3"),
  16914: new Effect(Event.Make, "VehicleAndShipArmorsLevel1"),
  16915: new Effect(Event.Make, "VehicleAndShipArmorsLevel2"),
  16916: new Effect(Event.Make, "VehicleAndShipArmorsLevel3"),
  17000: new Effect(Event.Make, "Nexus"),
  17001: new Effect(Event.Make, "Pylon"),
  17002: new Effect(Event.Make, "Assimilator"),
  17003: new Effect(Event.Make, "Gateway"),
  17004: new Effect(Event.Make, "Forge"),
  17005: new Effect(Event.Make, "FleetBeacon"),
  17006: new Effect(Event.Make, "TwilightCouncil"),
  17007: new Effect(Event.Make, "PhotonCannon"),
  17009: new Effect(Event.Make, "Stargate"),
  17010: new Effect(Event.Make, "TemplarArchive"),
  17011: new Effect(Event.Make, "DarkShrine"),
  17012: new Effect(Event.Make, "RoboticsBay"),
  17013: new Effect(Event.Make, "RoboticsFacility"),
  17014: new Effect(Event.Make, "CyberneticsCore"),
  17015: new Effect(Event.Make, "ShieldBattery"),
  17100: new Effect(Event.Help, "Load"),
  17101: new Effect(Event.Help, "UnloadAll"),
  17102: new Effect(Event.Help, "Unload"),
  17103: new Effect(Event.Help, "UnloadUnit"),
  17104: new Effect(Event.Help, "LoadAll"),
  17200: new Effect(Event.Make, "Zealot"),
  17201: new Effect(Event.Make, "Stalker"),
  17203: new Effect(Event.Make, "HighTemplar"),
  17204: new Effect(Event.Make, "DarkTemplar"),
  17205: new Effect(Event.Make, "Sentry"),
  17206: new Effect(Event.Make, "Adept"),
  17300: new Effect(Event.Make, "Phoenix"),
  17301: new Effect(Event.Make, "Carrier"),
  17302: new Effect(Event.Make, "Carrier"),
  17304: new Effect(Event.Make, "VoidRay"),
  17308: new Effect(Event.Make, "Oracle"),
  17309: new Effect(Event.Make, "Tempest"),
  17400: new Effect(Event.Make, "WarpPrism"),
  17401: new Effect(Event.Make, "Observer"),
  17402: new Effect(Event.Make, "Colossus"),
  17403: new Effect(Event.Make, "Immortal"),
  17418: new Effect(Event.Make, "Disruptor"),
  17500: new Effect(Event.Make, "Probe"),
  17600: new Effect(Event.Help, "PsiStorm"),
  18000: new Effect(Event.Make, "GroundWeapons1"),
  18001: new Effect(Event.Make, "GroundWeapons2"),
  18002: new Effect(Event.Make, "GroundWeapons3"),
  18003: new Effect(Event.Make, "GroundArmor1"),
  18004: new Effect(Event.Make, "GroundArmor2"),
  18005: new Effect(Event.Make, "GroundArmor3"),
  18006: new Effect(Event.Make, "Shields1"),
  18007: new Effect(Event.Make, "Shields2"),
  18008: new Effect(Event.Make, "Shields3"),
  18101: new Effect(Event.Make, "GraviticBoosters"),
  18102: new Effect(Event.Make, "GraviticDrive"),
  18105: new Effect(Event.Make, "ExtendedThermalLance"),
  18204: new Effect(Event.Make, "PsiStorm"),
  18300: new Effect(Event.Make, "Hatchery"),
  18301: new Effect(Event.Make, "CreepTumor"),
  18302: new Effect(Event.Make, "Extractor"),
  18303: new Effect(Event.Make, "SpawningPool"),
  18304: new Effect(Event.Make, "EvolutionChamber"),
  18305: new Effect(Event.Make, "HydraliskDen"),
  18306: new Effect(Event.Make, "Spire"),
  18307: new Effect(Event.Make, "UltraliskCavern"),
  18308: new Effect(Event.Make, "InfestationPit"),
  18309: new Effect(Event.Make, "NydusNetwork"),
  18310: new Effect(Event.Make, "BanelingNest"),
  18311: new Effect(Event.Make, "LurkerDenMP"),
  18313: new Effect(Event.Make, "RoachWarren"),
  18314: new Effect(Event.Make, "SpineCrawler"),
  18315: new Effect(Event.Make, "SporeCrawler"),
  18500: new Effect(Event.Make, "MeleeAttacks1"),
  18501: new Effect(Event.Make, "MeleeAttacks2"),
  18502: new Effect(Event.Make, "MeleeAttacks3"),
  18503: new Effect(Event.Make, "GroundCarapace1"),
  18504: new Effect(Event.Make, "GroundCarapace2"),
  18505: new Effect(Event.Make, "GroundCarapace3"),
  18506: new Effect(Event.Make, "MissileAttacks1"),
  18507: new Effect(Event.Make, "MissileAttacks2"),
  18508: new Effect(Event.Make, "MissileAttacks3"),
  18600: new Effect(Event.Morph, "Lair"),                  // Upgrade to Lair
  18700: new Effect(Event.Morph, "Hive"),                  // Upgrade to Hive
  18800: new Effect(Event.Morph, "GreaterSpire"),          // Upgrade to GreaterSpire
  18901: new Effect(Event.Make, "OverlordSpeed"),
  18903: new Effect(Event.Make, "Burrow"),
  19000: new Effect(Event.Make, "AdrenalGlands"),
  19001: new Effect(Event.Make, "MetabolicBoost"),
  19100: new Effect(Event.Make, "GroovedSpines"),
  19101: new Effect(Event.Make, "MuscularAugments"),
  19200: new Effect(Event.Make, "ZergFlyerWeaponsLevel1"),
  19201: new Effect(Event.Make, "ZergFlyerWeaponsLevel2"),
  19202: new Effect(Event.Make, "ZergFlyerWeaponsLevel3"),
  19203: new Effect(Event.Make, "ZergFlyerArmorsLevel1"),
  19204: new Effect(Event.Make, "ZergFlyerArmorsLevel2"),
  19205: new Effect(Event.Make, "ZergFlyerArmorsLevel3"),
  19300: new Effect(Event.Morph, "Drone"),
  19301: new Effect(Event.Morph, "Zergling"),
  19302: new Effect(Event.Morph, "Overlord"),
  19303: new Effect(Event.Morph, "Hydralisk"),
  19304: new Effect(Event.Morph, "Mutalisk"),
  19306: new Effect(Event.Morph, "Ultralisk"),
  19309: new Effect(Event.Morph, "Roach"),
  19310: new Effect(Event.Morph, "Infestor"),
  19311: new Effect(Event.Morph, "Corruptor"),
  19312: new Effect(Event.Morph, "Viper"),
  19314: new Effect(Event.Morph, "SwarmHost"),
  19400: new Effect(Event.Morph, "BroodLord"),
  19500: new Effect(Event.Help, "Burrow"),
  19700: new Effect(Event.Help, "Burrow"),
  19900: new Effect(Event.Help, "Burrow"),
  20100: new Effect(Event.Help, "Burrow"),
  20300: new Effect(Event.Help, "Burrow"),
  20500: new Effect(Event.Help, "Burrow"),
  21100: new Effect(Event.Help, "Load"),
  21101: new Effect(Event.Help, "UnloadAll"),
  21102: new Effect(Event.Help, "Unload"),
  21103: new Effect(Event.Help, "UnloadUnit"),
  21104: new Effect(Event.Help, "LoadAll"),
  21400: new Effect(Event.Make, "Zealot"),
  21401: new Effect(Event.Make, "Stalker"),
  21403: new Effect(Event.Make, "HighTemplar"),
  21404: new Effect(Event.Make, "DarkTemplar"),
  21405: new Effect(Event.Make, "Sentry"),
  21406: new Effect(Event.Make, "Adept"),
  21500: new Effect(Event.Help, "Burrow"),
  21800: new Effect(Event.Help, "Blink"),
  21900: new Effect(Event.Help, "Burrow"),
  22100: new Effect(Event.Morph, "Overseer"),
  22200: new Effect(Event.Morph, "PlanetaryFortress"),
  22303: new Effect(Event.Make, "NeuralParasite"),
  22400: new Effect(Event.Make, "CentrifugalHooks"),
  22500: new Effect(Event.Help, "Burrow"),
  22700: new Effect(Event.Morph, "OrbitalCommand"),
  22800: new Effect(Event.Morph, "WarpGate"),              // TransformToWarpGate
  22801: new Effect(Event.Morph, "Gateway"),               // CancelTransformToWarpGate
  23200: new Effect(Event.Help, "ForceField"),
  23500: new Effect(Event.Make, "WeaponRefit"),
  23501: new Effect(Event.Make, "BehemothReactor"),
  23502: new Effect(Event.Make, "MedivacIncreaseSpeedBoost"),
  23600: new Effect(Event.Make, "AirWeapons1"),
  23601: new Effect(Event.Make, "AirWeapons2"),
  23602: new Effect(Event.Make, "AirWeapons3"),
  23603: new Effect(Event.Make, "AirArmor1"),
  23604: new Effect(Event.Make, "AirArmor2"),
  23605: new Effect(Event.Make, "AirArmor3"),
  23606: new Effect(Event.Make, "WarpGate"),
  23700: new Effect(Event.Make, "Charge"),
  23701: new Effect(Event.Make, "Blink"),
  23702: new Effect(Event.Make, "ResonatingGlaives"),
  23800: new Effect(Event.Harm, "TacticalNukeStrike"),
  24100: new Effect(Event.Harm, "EMP"),
  24300: new Effect(Event.Make, "Queen"),
  24500: new Effect(Event.Help, "Transfusion"),
  25900: new Effect(Event.Help, "GenerateCreep"),
  26600: new Effect(Event.Make, "AutoTurret"),
  26700: new Effect(Event.Morph, "Archon"),
  26800: new Effect(Event.Make, "NydusCanal"),
  27400: new Effect(Event.Harm, "Contaminate"),
  28100: new Effect(Event.Harm, "CorrosiveBile"),
  30300: new Effect(Event.Help, "Burrow"),
  30700: new Effect(Event.Help, "Burrow"),
  30900: new Effect(Event.Morph, "Ravager"),
  31000: new Effect(Event.Morph, "TransportOverlord"),
  35700: new Effect(Event.Morph, "Hellion"),
  36700: new Effect(Event.Morph, "Hellbat"),
  37500: new Effect(Event.Morph, "SwarmHost"),
  37600: new Effect(Event.Morph, "SwarmHost"),
  38100: new Effect(Event.Harm, "BlindingCloud"),
  38300: new Effect(Event.Harm, "Abduct"),
  39700: new Effect(Event.Harm, "Consume"),
  22500: new Effect(Event.Help, "Burrow"),
  40400: new Effect(Event.Help, "MedivacSpeedBoost"),
  41900: new Effect(Event.Help, "Revelation"),
  46800: new Effect(Event.Harm, "TemporalField"),
  51900: new Effect(Event.Harm, "CausticSpray"),
  52200: new Effect(Event.Morph, "Lurker"),
  52600: new Effect(Event.Harm, "PurificationNova"),
  53700: new Effect(Event.Help, "Load"),
  53701: new Effect(Event.Help, "UnloadAll"),
  60300: new Effect(Event.Harm, "StatisTrap"),
  60700: new Effect(Event.Harm, "ParasiticBomb"),
  63000: new Effect(Event.Harm, "KD5Charge"),
  70700: new Effect(Event.Make, "DiggingClaws"),
  70701: new Effect(Event.Make, "MuscularAugments"),
  71200: new Effect(Event.Make, "ScrambleMissile"),
  71500: new Effect(Event.Make, "ShredderMissile"),
  71600: new Effect(Event.Help, "Chronoboost"),            // Game version 76114
  71700: new Effect(Event.Help, "MassRecall"),

  // Abilities of no interest
   4000: null, // Stop
   4001: null, // Stop hold fire
   4002: null, // Stop cheer
   4003: null, // Stop dance
   4200: null, // Move
   4201: null, // Move patrol
   4202: null, // Move hold position
   4203: null, // Move scan
   4204: null, // Move turn
   4500: null, // Attack
   6300: null, // Salvage
   6800: null, // Explode
   8800: null, // Gather
   9000: null, // Calldown MULE
   9101: null, // Cancel graviton beam
  10200: null, // Rally
  10400: null, // Rally workers
  10500: null, // Rally Nexus
  10600: null, // Rally Hatchery units
  10601: null, // Rally Hatchery workers
  11001: null, // NeuralParasite cancel
  11100: null, // Spawn larva
  11900: null, // SCV harvest gather
  11901: null, // SCV harvest return cargo
  12000: null, // Probe harvest gather
  12001: null, // Probe harvest return cargo
  12300: null, // Queue cancel
  12400: null, // Queue cancel
  12700: null, // Building in progress stop
  12701: null, // Building in progress halt
  13201: null, // Ghost decloak
  13600: null, // Unsiege to tank mode
  13701: null, // Banshee decloak
  14500: null, // CommandCenter lift-off
  14600: null, // CommandCenter land
  14800: null, // Barracks lift-off
  15000: null, // Factory lift-off
  15200: null, // Starport lift-off
  15300: null, // Factory land
  15400: null, // Starport land
  15600: null, // Barracks land
  15700: null, // Lower supply depot
  15800: null, // Raise supply depot
  18400: null, // Drone harvest gather
  18401: null, // Drone harvest return cargo
  18801: null, // Cancel upgrade to GreaterSpire
  19401: null, // Cancel morph to BroodLord
  19600: null, // Unburrow Baneling
  19800: null, // Unburrow Drone
  20000: null, // Unburrow Hydralisk
  20200: null, // Unburrow Roach
  20400: null, // Unburrow Zergling
  20600: null, // Unburrow InfestorTerran
  21600: null, // Unburrow Queen
  22000: null, // Unburrow Infestor
  22201: null, // Cancel upgrade to PlanetaryFortress
  22600: null, // Unburrow Ultralisk
  22701: null, // Cancel upgrade to OrbitalCommand
  23000: null, // OrbitalCommand lift-off
  23100: null, // OrbitalCommand land
  23300: null, // Phasing mode
  23400: null, // Transport mode
  23801: null, // Cancel TacticalNukeStrike
  25401: null, // Redirect attack
  25901: null, // Stop generate creep
  26000: null, // Queen build creep tumor
  26100: null, // Uproot SpineCrawler
  26200: null, // Uproot SporeCrawler
  26300: null, // Root SpineCrawler
  26400: null, // Root SporeCrawler
  26500: null, // Creep tumor burrowed build creep tumor
  30400: null, // Unburrow Lurker
  30800: null, // Unburrow Ravager
  39800: null, // Unburrow WidowMine
  52800: null, // Lock on
  53000: null, // Lock on cancel
  53200: null, // Hyperjump
  53400: null, // Thor AP mode
  53800: null, // Oracle weapon on
  53801: null, // Oracle weapon off
  54401: null, // Locust flying swoop
  54700: null, // VoidRay swarm damage boost cancel
  60800: null, // Psionic transfer
  61500: null, // Liberator AG target
  61600: null, // Liberator AA target
  63300: null, // Adept shift cancel
  63400: null, // Adept shift cancel
  69000: null, // Battlecruiser attack
  69200: null, // Battlecruiser move
  69201: null, // Battlecruiser patrol
  69202: null, // Battlecruiser hold position
  69400: null, // Battlecruiser stop
  69600: null, // Locust targeted
  69900: null, // VoidRay swarm damage boost cancel
  70300: null, // Channel snipe
  70301: null, // Channel snipe cancel
};

export default function createEvent(ability, index, loop, pid, uid) {
  if (index === 30) return Event.MutedEvent; // Cancel command

  const effect = EFFECTS[ability * 100 + index];

  if (effect) {
    return effect.toEvent(loop, pid, uid);
  } else if (effect === undefined) {
    return Event.UnknownEvent;
  }

  return Event.MutedEvent;
}
