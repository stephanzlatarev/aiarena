import { getArmyBuild } from "./army.js";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;
const STATS_PER_MINUTE = LOOPS_PER_MINUTE / 160;

const PLAYER_1 = 1;
const PLAYER_2 = 2;

const INITIAL_WEALTH = 1000;
const ECONOMY_COEFFICIENT = 100 / 6000;
const MILITARY_COEFFICIENT = 100 / 16000;
const TECHNOLOGY_COEFFICIENT = 100 / 50;

export default function overview(replay, timeline) {
  const players = {};

  for (const player of [PLAYER_1, PLAYER_2]) {
    let time = 0;
    let work = 0;
    let wealth = 0;

    const build = { army: {}, value: 0 };
    const fight = { kill: 0, player: { army: {}, value: 0, kill: 0 }, opponent: { value: 0, kill: 0 } };

    for (const point of timeline) {
      const currentPlayerInfo = point.players[player];

      if (point.type === "stats") {
        time += 1 / STATS_PER_MINUTE;
        work += currentPlayerInfo.resources.activeWorkers / STATS_PER_MINUTE;
        wealth = currentPlayerInfo.resources.totalValue - INITIAL_WEALTH;

        if (currentPlayerInfo.resources.activeForces >= build.value) {
          build.army = currentPlayerInfo.army;
          build.value = currentPlayerInfo.resources.activeForces;
        }
      } else if (point.type === "fight") {
        const opponentInfo = point.players[(player === PLAYER_2) ? PLAYER_1 : PLAYER_2];
        const kill = currentPlayerInfo.kill + opponentInfo.kill;

        if (currentPlayerInfo.value >= build.value) {
          build.army = currentPlayerInfo.army;
          build.value = currentPlayerInfo.value;
        }

        if (currentPlayerInfo.kill && opponentInfo.kill && (!fight || (kill > fight.kill))) {
          fight.kill = kill;
          fight.player = currentPlayerInfo;
          fight.opponent = opponentInfo;
        }
      }
    }

    const armyBuild = getArmyBuild(build.army);
    const militaryCapacity = roundScore(MILITARY_COEFFICIENT * build.value);
    const militaryPerformance = roundScore(militaryCapacity * fight.opponent.value * fight.player.kill / (fight.player.value + 1) / (fight.opponent.kill + 1));
    const economyCapacity = roundScore(work / time);
    const economyPerformance = roundScore(ECONOMY_COEFFICIENT * wealth / time);
    const technologyCapacity = roundScore(TECHNOLOGY_COEFFICIENT * getUniqueUnitCount(replay, player));
    const technologyPerformance = technologyCapacity;

    players[player] = { armyBuild, militaryCapacity, militaryPerformance, economyCapacity, economyPerformance, technologyCapacity, technologyPerformance };
  }

  return { players: players };
}

function roundScore(score) {
  return Math.floor(Math.min(score, 100));
}

function getUniqueUnitCount(replay, pid) {
  const types = new Set();

  for (const unit of replay.units.values()) {
    if (unit.owner == pid) {
      types.add(unit.type);
    }
  }

  return types.size;
}
