import Event from "../replay/event.js";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;
const LOOPS_4_MINUTES = LOOPS_PER_MINUTE * 4;

const IGNORE = { KD8Charge: true, Larva: true };

export default function buildorder(replay, pid) {
  const buildorder = [];

  for (const event of replay.events) {
    if (event.loop > LOOPS_4_MINUTES) break;
    if (!event.loop) continue;
    if (event.pid !== pid) continue;
    if (event.type !== Event.Enter) continue;
    if (IGNORE[event.stype]) continue;

    buildorder.push({
      loop: event.t,
      build: event.stype,
      x: event.x,
      y: event.y,
    });
  }

  buildorder.sort((a, b) => (a.loop - b.loop));

  return buildorder;
}

export function addBuildOrder(botName, mapName, opponentRace, opponentName, winnerName, root, buildorder) {
  const stats = {
    map: mapName,
    opponent: opponentName,
    isWin: (winnerName === botName),
    isLoss: (winnerName === opponentName),
    isTie: (winnerName !== botName) && (winnerName !== opponentName),
    isTerran: (opponentRace === "T"),
    isZerg: (opponentRace === "Z"),
    isProtoss: (opponentRace === "P"),
    isRandom: (opponentRace === "R"),
  };

  if (!root) {
    return { bot: botName, ...createDecision(stats, buildorder) };
  } else if (buildorder && buildorder.length) {
    const decisions = new Set();
    let decision = root;
    let produced = {};

    decisions.add(decision);

    for (let index = 0; index < buildorder.length; index++) {
      const action = buildorder[index];

      if (isWithinProduction(decision.production, produced, action)) {
        updateActionInProduction(decision.production, action);
        addToProduced(produced, action)
        continue;
      }

      let alternative = getDecisionForAction(decision.decisions, action);
      if (alternative) {
        updateActionInProduction(alternative.production, action);
        addToProduced(produced, action)
        decisions.add(alternative);
        decision = alternative;
        produced = {};
        continue;
      }

      alternative = createDecision(stats, buildorder.slice(index));
      decision.decisions.push(alternative);
      decisions.add(alternative);
      break;
    }

    if (hasProducedMore(decision.production, produced)) {
console.log("Produced more:", produced, "vs", decision.production);
    } else if (hasProducedLess(decision.production, produced)) {
console.log("Produced less:", produced, "vs", decision.production);
      // Split decision
      const sibling = { ...decision };
      const stop = createDecision(stats);
      const { start, end } = splitProduction(decision.production, produced);

      decision.production = start;
      decision.decisions = [sibling, stop];
      sibling.production = end;
    }

    for (const decision of decisions) {
      addStatsToDecision(decision, stats);
    }
  } else if (!Object.keys(root.production).length) {
    let decision = false;

    for (const one of root.decisions) {
      if (!one.decisions.length && !Object.keys(one.production).length) {
        decision = one;
        break;
      }
    }

    if (!decision) {
      decision = createDecision(stats);
      root.decisions.push(decision);
    }

    addStatsToDecision(root, stats);
    addStatsToDecision(decision, stats);
  } else {
    const previous = { ...root };
    delete previous.bot;

    root.production = {};
    root.decisions = [
      previous,
      createDecision(stats),
    ];

    addStatsToDecision(root, stats);
  }

  return root;
}

function createDecision(stats, actions) {
  const production = {};

  if (actions) {
    for (const action of actions) {
      addActionToProduction(production, action);
    }
  }

  return {
    map: stats.map,
    opponent: stats.opponent,
    win: stats.isWin ? 1 : 0,
    loss: stats.isLoss ? 1 : 0,
    tie: stats.isTie ? 1 : 0,
    terran: stats.isTerran ? 1 : 0,
    zerg: stats.isZerg ? 1 : 0,
    protoss: stats.isProtoss ? 1 : 0,
    random: stats.isRandom ? 1 : 0,
    production: production,
    decisions: [],
  }
}

function addStatsToDecision(decision, stats) {
  if (stats.isWin) decision.win++;
  if (stats.isLoss) decision.loss++;
  if (stats.isTie) decision.tie++;
  if (stats.isTerran) decision.terran++;
  if (stats.isZerg) decision.zerg++;
  if (stats.isProtoss) decision.protoss++;
  if (stats.isRandom) decision.random++;
  if (stats.map !== decision.map) decision.map = null;
  if (stats.opponent !== decision.opponent) decision.opponent = null;

  return decision;
}

function addToProduced(produced, action) {
  if (produced[action.build]) {
    produced[action.build]++;
  } else {
    produced[action.build] = 1;
  }
}

function getDecisionForAction(decisions, action) {
  return null;
}

function isWithinProduction(production, produced, action) {
  const unit = action.build;
  const unitsProduced = produced[unit] ? produced[unit] : 0;
  const unitsProduction = production[unit] ? production[unit].count : 0;

  // Check if the build order already produced the expected number for this production
  if (unitsProduced >= unitsProduction) return false;

  return true;
}

function hasProducedMore(production, produced) {
  for (const unit in produced) {
    if (!production[unit] || (production[unit].count < produced[unit])) return true;
  }

  return false;
}

function hasProducedLess(production, produced) {
  for (const unit in production) {
    if (!produced[unit] || (produced[unit] < production[unit].count)) return true;
  }

  return false;
}

function splitProduction(production, produced) {
  const start = {};
  const end = {};

  return { start, end };
}

function addActionToProduction(production, action) {
  const line = production[action.build];

  if (line) {
    line.count++;
    line.end = action.loop;
  } else {
    production[action.build] = { start: action.loop, count: 1, end: action.loop };
  }
}

function updateActionInProduction(production, action) {
  const item = production[action.build];

  if (action.loop && (action.loop < item.start)) {
    item.start = action.loop;
  }
}
