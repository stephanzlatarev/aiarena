
const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;
const STATS_PER_MINUTE = LOOPS_PER_MINUTE / 160;

const INITIAL_WEALTH = 1000;
const ECONOMY_COEFFICIENT = 100 / 6000;
const MILITARY_COEFFICIENT = 100 / 16000;
const TECHNOLOGY_COEFFICIENT = 100 / 50;

export function calculateEconomyRating(stats, pid) {
  let time = 0;
  let work = 0;
  let wealth = 0;

  for (const point of stats) {
    const player = point.players[pid];

    time += 1 / STATS_PER_MINUTE;
    work += player.resources.activeWorkers / STATS_PER_MINUTE;
    wealth = player.resources.totalValue - INITIAL_WEALTH;
  }

  const capacity = roundScore(work / time);
  const performance = roundScore(ECONOMY_COEFFICIENT * wealth / time);

  return {
    economyPerformance: roundScore(performance),
    economyCapacity: roundScore(capacity),
  };
}

export function calculateMilitaryRating(fight, pid) {
  if (!fight) return { militaryPerformance: 0, militaryCapacity: 0 };

  const player = fight.players[pid];
  const opponent = (pid == 1) ? fight.players[2] : fight.players[1];
  const loss = fight.players[1].loss + fight.players[2].loss;

  const capacity = MILITARY_COEFFICIENT * player.value;
  const killLossRatio = loss ? opponent.value * opponent.loss / (player.value + 1) / (player.loss + 1) : 1;
  const performance = capacity * killLossRatio;

  return {
    militaryPerformance: roundScore(performance),
    militaryCapacity: roundScore(capacity),
  };
}

export function averageMilitaryRating(timeline, pid) {
  let capacity = 0;
  let performanceSum = 0;
  let performanceCount = 0;

  for (const fight of timeline) {
    if (fight.type === "fight") {
      const rating = calculateMilitaryRating(fight, pid);
  
      if (rating.militaryCapacity > capacity) {
        capacity = rating.militaryCapacity;
      }
  
      if (fight.loss) {
        performanceSum += rating.militaryPerformance * fight.loss;
        performanceCount += fight.loss;
      }
    }
  }
  
  const performance = performanceCount ? (performanceSum / performanceCount) : capacity;

  return {
    militaryPerformance: roundScore(performance),
    militaryCapacity: roundScore(capacity),
  };
}

export function calculateTechnologyRating(replay, pid) {
  const types = new Set();

  for (const unit of replay.units.values()) {
    if (unit.owner == pid) {
      types.add(unit.type);
    }
  }

  const technology = TECHNOLOGY_COEFFICIENT * types.size;

  return {
    technologyPerformance: roundScore(technology),
    technologyCapacity: roundScore(technology),
  };
}

function roundScore(score) {
  return Math.floor(Math.min(score, 100) * 10) / 10;
}
