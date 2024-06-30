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
    let fight = null;

    for (const point of timeline) {
      if (point.type === "stats") {
        time += 1 / STATS_PER_MINUTE;
        work += point.players[player].resources.activeWorkers / STATS_PER_MINUTE;
        wealth = point.players[player].resources.totalValue;
      } else if (point.type === "fight") {
        if (fight) {
          if (point.players[player].value > fight.players[player].value) {
            fight = point;
          }
        } else {
          fight = point;
        }
      }
    }

    players[player] = {};

    if (fight) {
      const opponent = (player === PLAYER_2) ? PLAYER_1 : PLAYER_2;
      const playerArmyValue = fight.players[player].value;
      const opponentArmyValue = fight.players[opponent].value;
      const playerKillValue = fight.players[player].kill;
      const opponentKillValue = fight.players[opponent].kill;

      players[player].armyBuild = getArmyBuild(fight.players[player].army);
      players[player].militaryCapacity = Math.floor(MILITARY_COEFFICIENT * fight.players[player].value);
      players[player].militaryPerformance = Math.min(Math.floor(players[player].militaryCapacity * opponentArmyValue * playerKillValue / playerArmyValue / opponentKillValue), 100);
    } else {
      players[player].armyBuild = [];
      players[player].militaryCapacity = 0;
      players[player].militaryPerformance = 0;
    }

    players[player].economyCapacity = Math.floor(ECONOMY_COEFFICIENT * work / time);
    players[player].economyPerformance = Math.floor(ECONOMY_COEFFICIENT * wealth / work);
  }

  return { players: players };
}
