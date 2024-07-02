
const ArmyRank = {
  // Protoss army
  Carrier: 1,
  VoidRay: 2,
  Colossus: 3,
  Archon: 4,
  Stalker: 5,
  Immortal: 6,
  Adept: 7,
  Zealot: 8,
  Sentry: 9,
  Phoenix: 10,
  Tempest: 11,
  HighTemplar: 12,
  DarkTemplar: 13,
  Oracle: 14,
  Disruptor: 15,
  Mothership: 16,
  WarpPrism: 17,
  Observer: 18,

  // Terran army
  Battlecruiser: 1,
  Liberator: 2,
  Raven: 3,
  VikingFighter: 4,
  Banshee: 5,
  Thor: 6,
  SiegeTank: 7,
  VikingAssault: 8,
  Ghost: 9,
  Cyclone: 10,
  WidowMine: 11,
  Reaper: 12,
  Marauder: 13,
  Hellbat: 14,
  Hellion: 15,
  Marine: 16,
  Medivac: 17,

  // Zerg army
  BroodLord: 1,
  Viper: 2,
  Corruptor: 3,
  Mutalisk: 4,
  Ultralisk: 5,
  Hydralisk: 6,
  Infestor: 7,
  Lurker: 8,
  SwarmHost: 9,
  Ravager: 10,
  Baneling: 11,
  Roach: 12,
  Zergling: 13,
  Queen: 14,
  Changeling: 15,
  Overseer: 16,
};

export function getArmyCount(replay, loop, pid) {
  const army = {};

  for (const unit of replay.units.values()) {
    if (ArmyRank[unit.type] && (unit.owner == pid) && (unit.enter <= loop) && (unit.exit > loop)) {
      const type = unit.type;
  
      if (army[type]) {
        army[type]++;
      } else {
        army[type] = 1;
      }
    }
  }

  return army;
}

export function getArmyBuild(army) {
  return Object.keys(army).sort((a, b) => (ArmyRank[a] - ArmyRank[b]));
}
