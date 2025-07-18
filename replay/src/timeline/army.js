
const ProtossArmyUnitValue = {
  // Probe is first with rank 0 and value 1 so that it is included in army only when there are no other units and it counts minimally in army value
  Probe: 1,

  // All other units are ordered by their rank
  Carrier: 600,
  VoidRay: 400,
  Colossus: 500,
  Archon: 450,
  Stalker: 175,
  Immortal: 375,
  Adept: 125,
  Zealot: 100,
  Sentry: 150,
  Phoenix: 250,
  Tempest: 425,
  HighTemplar: 200,
  DarkTemplar: 250,
  Oracle: 300,
  Disruptor: 300,
  Mothership: 600,
  WarpPrism: 250,
  Observer: 100,
  PhotonCannon: 150,
  ShieldBattery: 100,
};

const TerranArmyUnitValue = {
  // SCV is first with rank 0 and value 1 so that it is included in army only when there are no other units and it counts minimally in army value
  SCV: 1,

  // All other units are ordered by their rank
  Battlecruiser: 700,
  Liberator: 275,
  Raven: 250,
  VikingFighter: 225,
  Banshee: 250,
  Thor: 500,
  SiegeTank: 275,
  VikingAssault: 225,
  Ghost: 275,
  Cyclone: 175,
  WidowMine: 100,
  Reaper: 100,
  Marauder: 125,
  Hellbat: 100,
  Hellion: 100,
  Marine: 50,
  Medivac: 200,
  PlanetaryFortress: 700,
  Bunker: 100,
  MissileTurret: 100,
  SensorTower: 225,
};

const ZergArmyUnitValue = {
  // Drone is first with rank 0 and value 1 so that it is included in army only when there are no other units and it counts minimally in army value
  Drone: 1,

  // All other units are ordered by their rank
  BroodLord: 550,
  Viper: 300,
  Corruptor: 250,
  Mutalisk: 200,
  Ultralisk: 475,
  Hydralisk: 150,
  Infestor: 250,
  Lurker: 300,
  SwarmHost: 175,
  Ravager: 200,
  Baneling: 75,
  Roach: 100,
  Zergling: 25,
  Queen: 150,
  Overseer: 200,
  NydusWorm: 150,
  SporeCrawler: 75,
  SpineCrawler: 100,
};

const UnitValue = { ...ProtossArmyUnitValue, ...TerranArmyUnitValue, ...ZergArmyUnitValue };
const ArmyRank = { ...rank(ProtossArmyUnitValue), ...rank(TerranArmyUnitValue), ...rank(ZergArmyUnitValue) };

export function getArmyBuild(units) {
  if (hasNonWorkerUnits(units)) {
    return Object.keys(units).filter(type => (UnitValue[type] > 1)).sort((a, b) => (ArmyRank[a] - ArmyRank[b]));
  } else {
    return Object.keys(units).filter(type => (UnitValue[type] > 0));
  }
}

export function getArmyValue(list, army) {
  let value = 0;
  let workers = 0;

  for (let type in list) {
    if (UnitValue[type] === 1 && army[type]) {
      workers += list[type].count;
    } else if (UnitValue[type] && army[type]) {
      value += UnitValue[type] * list[type].count;
    }
  }

  return value ? value : workers;
}

export function getArmyDiedValue(list, army) {
  let value = 0;
  let workers = 0;

  for (let type in list) {
    if (UnitValue[type] === 1 && army[type]) {
      workers += list[type].died;
    } else if (UnitValue[type] && army[type]) {
      value += UnitValue[type] * list[type].died;
    }
  }

  return value ? value : workers;
}

function rank(list) {
  const result = {};
  let rank = 0;

  for (let type in list) {
    result[type] = rank++;
  }

  return result;
}

function hasNonWorkerUnits(units) {
  for (const type in units) {
    if (UnitValue[type] > 1) {
      return true;
    }
  }
}
