
class Effect {

  loop = 0;
  player = 0;
  unit = null;
  target = null;

  constructor(ability, output) {
    this.ability = ability;
    this.output = output;
  }

  clone() {
    const effect = new Effect(this.ability, this.output);
    effect.apply(this.loop, this.player, this.unit);
    effect.target = this.target;
    return effect;
  }

  apply(loop, player, unit) {
    this.loop = loop;
    this.player = player;
    this.unit = unit;
  }

  toString() {
    const text = [];

    text.push("Player");
    text.push(this.player);
    text.push(this.unit ? this.unit.toString() : "???");
    text.push(this.ability);

    if (this.output) text.push(this.output);
    if (this.target) text.push(this.target);

    return text.join(" ");
  }

}

const EFFECTS = {
  17000: new Effect("build", "Nexus"),
  17001: new Effect("build", "Pylon"),
  17002: new Effect("build", "Assimilator"),
  17003: new Effect("build", "Gateway"),
  17004: new Effect("build", "Forge"),
  17005: new Effect("build", "FleetBeacon"),
  17006: new Effect("build", "TwilightCouncil"),
  17007: new Effect("build", "PhotonCannon"),
  17009: new Effect("build", "Stargate"),
  17010: new Effect("build", "TemplarArchive"),
  17011: new Effect("build", "DarkShrine"),
  17012: new Effect("build", "RoboticsBay"),
  17013: new Effect("build", "RoboticsFacility"),
  17014: new Effect("build", "CyberneticsCore"),
  17015: new Effect("build", "ShieldBattery"),
  17200: new Effect("build", "Zealot"),
  17201: new Effect("build", "Stalker"),
  17203: new Effect("build", "HighTemplar"),
  17204: new Effect("build", "DarkTemplar"),
  17205: new Effect("build", "Sentry"),
  17206: new Effect("build", "Adept"),
  17300: new Effect("build", "Phoenix"),
  17301: new Effect("build", "Carrier"),
  17302: new Effect("build", "Carrier"),
  17304: new Effect("build", "VoidRay"),
  17308: new Effect("build", "Oracle"),
  17309: new Effect("build", "Tempest"),
  17400: new Effect("build", "WarpPrism"),
  17401: new Effect("build", "Observer"),
  17402: new Effect("build", "Colossus"),
  17403: new Effect("build", "Immortal"),
  17500: new Effect("build", "Probe"),
  18000: new Effect("research", "GroundWeapons1"),
  18001: new Effect("research", "GroundWeapons2"),
  18002: new Effect("research", "GroundWeapons3"),
  18003: new Effect("research", "GroundArmor1"),
  18004: new Effect("research", "GroundArmor2"),
  18005: new Effect("research", "GroundArmor3"),
  18006: new Effect("research", "Shields1"),
  18007: new Effect("research", "Shields2"),
  18008: new Effect("research", "Shields3"),
  21400: new Effect("build", "Zealot"),
  21401: new Effect("build", "Stalker"),
  21403: new Effect("build", "HighTemplar"),
  21404: new Effect("build", "DarkTemplar"),
  21405: new Effect("build", "Sentry"),
  21406: new Effect("build", "Adept"),
  22800: new Effect("transform", "TransformToWarpGate"),
  22801: new Effect("transform", "CancelTransformToWarpGate "),
  23600: new Effect("research", "AirWeapons1"),
  23601: new Effect("research", "AirWeapons2"),
  23602: new Effect("research", "AirWeapons3"),
  23603: new Effect("research", "AirArmor1"),
  23604: new Effect("research", "AirArmor2"),
  23605: new Effect("research", "AirArmor3"),
  23606: new Effect("research", "WarpGate"),
  23700: new Effect("research", "Charge"),
  23701: new Effect("research", "Blink"),
  23702: new Effect("research", "AdeptPiercingAttack"),
  71600: new Effect("chronoboost"),       // Game version 76114

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
  10200: null, // Rally
  10500: null, // Rally Nexus
  11900: null, // SCV harvest
  12000: null, // SCV harvest gather
  12001: null, // SCV harvest return cargo
};

export default function command(ability, index) {
  const effect = EFFECTS[ability * 100 + index];

  if (effect === undefined) {
    console.log("Unknown ability:", ability, index);
  }

  return effect ? effect.clone() : null;
}
