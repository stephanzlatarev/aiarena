import Event from "./event.js";

class Effect {

  constructor(type, out) {
    this.type = type;
    this.out = out;
  }

  toEvent(loop, pid, stype, sid, ttype, tid) {
    return new Event(this.type, loop, pid, stype, sid, ttype, tid, this.out);
  }

}

const EFFECTS = {
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
  17500: new Effect(Event.Make, "Probe"),
  18000: new Effect(Event.Make, "GroundWeapons1"),
  18001: new Effect(Event.Make, "GroundWeapons2"),
  18002: new Effect(Event.Make, "GroundWeapons3"),
  18003: new Effect(Event.Make, "GroundArmor1"),
  18004: new Effect(Event.Make, "GroundArmor2"),
  18005: new Effect(Event.Make, "GroundArmor3"),
  18006: new Effect(Event.Make, "Shields1"),
  18007: new Effect(Event.Make, "Shields2"),
  18008: new Effect(Event.Make, "Shields3"),
  21400: new Effect(Event.Make, "Zealot"),
  21401: new Effect(Event.Make, "Stalker"),
  21403: new Effect(Event.Make, "HighTemplar"),
  21404: new Effect(Event.Make, "DarkTemplar"),
  21405: new Effect(Event.Make, "Sentry"),
  21406: new Effect(Event.Make, "Adept"),
  22800: new Effect(Event.Morph, "WarpGate"),              // TransformToWarpGate
  22801: new Effect(Event.Morph, "Gateway"),               // CancelTransformToWarpGate
  23600: new Effect(Event.Make, "AirWeapons1"),
  23601: new Effect(Event.Make, "AirWeapons2"),
  23602: new Effect(Event.Make, "AirWeapons3"),
  23603: new Effect(Event.Make, "AirArmor1"),
  23604: new Effect(Event.Make, "AirArmor2"),
  23605: new Effect(Event.Make, "AirArmor3"),
  23606: new Effect(Event.Make, "WarpGate"),
  23700: new Effect(Event.Make, "Charge"),
  23701: new Effect(Event.Make, "Blink"),
  23702: new Effect(Event.Make, "AdeptPiercingAttack"),
  71600: new Effect(Event.Help, "Chronoboost"),            // Game version 76114

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

export default function createEvent(ability, index, loop, pid, stype, sid) {
  const effect = EFFECTS[ability * 100 + index];

  if (effect) {
    return effect.toEvent(loop, pid, stype, sid);
  } else if (effect === undefined) {
    console.log("Unknown ability:", ability, index);
  }
}
