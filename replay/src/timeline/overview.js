import { getArmyBuild } from "./army.js";
import { averageMilitaryRating, calculateEconomyRating, calculateTechnologyRating } from "./rating.js";

const PLAYER_1 = 1;
const PLAYER_2 = 2;

export default function overview(replay, timeline) {
  const players = {};

  for (const pid of [PLAYER_1, PLAYER_2]) {
    players[pid] = {
      armyBuild: getBestArmy(timeline, pid),
      ...averageMilitaryRating(timeline, pid),
      ...calculateEconomyRating(timeline.filter(point => (point.type === "stats")), pid),
      ...calculateTechnologyRating(replay, pid),
    };
  }

  return { players: players };
}

function getBestArmy(timeline, pid) {
  let best;

  for (const point of timeline) {
    if (point.type === "fight") {
      const build = point.players[pid];

      if (!best || (build.value >= best.value)) {
        best = build;
      }
    }
  }

  return best ? getArmyBuild(best.army) : [];
}
