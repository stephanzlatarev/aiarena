import { getArmyBuild } from "./army.js";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;
const STATS_PER_MINUTE = LOOPS_PER_MINUTE / 160;

const PLAYER_1 = 1;
const PLAYER_2 = 2;

const ECONOMY_COEFFICIENT = 100 / 72;
const MILITARY_COEFFICIENT = 100 / 16000;

export default function overview(timeline) {
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
        wealth = currentPlayerInfo.resources.totalValue;

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
    const militaryCapacity = Math.floor(MILITARY_COEFFICIENT * fight.player.value);
    const militaryPerformance = Math.floor(Math.min(militaryCapacity * fight.opponent.value * fight.player.kill / (fight.player.value + 1) / (fight.opponent.kill + 1), 100));
    const economyCapacity = Math.floor(ECONOMY_COEFFICIENT * work / time);
    const economyPerformance = Math.floor(ECONOMY_COEFFICIENT * wealth / work);

    players[player] = { armyBuild, militaryCapacity, militaryPerformance, economyCapacity, economyPerformance };
  }

  return { players: players };
}
