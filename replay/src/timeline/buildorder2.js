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
    return { bot: botName, ...createDecision(stats, buildorder, {}) };
  } else if (buildorder && buildorder.length) {
    let decision = root;

    for (let index = 0; index < buildorder.length; index++) {
      const action = buildorder[index];

      if (isWithinProduction(decision.production, action)) {
        addStatsToDecision(decision, stats);
        continue;
      }

      const alternative = getDecisionForAction(decision.decisions, action);
      if (alternative) {
        addStatsToDecision(decision, stats);
        addStatsToDecision(alternative, stats);
        addActionToProduction(alternative, action);
        continue;
      }







      if (actionsIndex >= decision.actions.length) {
        // This action in the build order is part of the alternatives of this decision
        addStatsToDecision(decision, stats);

        // Find existing alternative that starts with this action
        let hasMatchingAlternative = false;
        for (const alternative of decision.decisions) {
          const nextAction = alternative.actions[0];

          if (isSameAction(buildAction, nextAction)) {
            addTimeToAction(nextAction, buildAction.loop);

            hasMatchingAlternative = true;
            decision = alternative;
            actionsIndex = 0;
            index--;
            break;
          }
        }
        if (hasMatchingAlternative) {
          continue;
        }

        // No existing alternative, so add one
        decision.decisions.push(createDecision(stats, buildorder.slice(index), production));
        break;

      } else if (isSameAction(buildAction, decision.actions[actionsIndex])) {
        // This action in the build order matches this decision
        addTimeToAction(decision.actions[actionsIndex], buildAction.loop);

        if (index === buildorder.length - 1) {
          // This is the last action in the build order, so update the stats but split remainder actions or decisions

          if (actionsIndex + 1 < decision.actions.length) {
            const previous = { ...decision };
            const actions = [...decision.actions];

            decision.actions = actions.slice(0, actionsIndex + 1);
            decision.decisions = [
              {
                ...previous,
                actions: actions.slice(actionsIndex + 1),
              },
              createDecision(stats, [], production),
            ];
          } else if (decision.decisions.length) {
            decision.decisions.push(createDecision(stats, [], production));
          }

          addStatsToDecision(decision, stats);
          break;
        } else {
          // There are more actions. Process the next one
          actionsIndex++;
          continue;
        }
      } else {
        // This action in the build order doesn't match this decision, so split the decision
        const previous = { ...decision };
        const actions = [...decision.actions];

        decision.actions = actions.slice(0, actionsIndex);
        decision.decisions = [
          {
            ...previous,
            actions: actions.slice(actionsIndex),
            decisions: previous.decisions,
          },
          createDecision(stats, buildorder.slice(index), production),
        ];

        addStatsToDecision(decision, stats);
        break;
      }
    }
  } else if (!root.actions.length) {
    let hasMatchingAlternative = false;

    for (const alternative of root.decisions) {
      if (!alternative.actions.length) {
        addStatsToDecision(alternative, stats);
        hasMatchingAlternative = true;
        break;
      }
    }

    if (!hasMatchingAlternative) {
      root.decisions.push(createDecision(stats, [], production));
    }

    addStatsToDecision(root, stats);
  } else {
    const previous = { ...root };
    delete previous.bot;

    root.actions = [];
    root.decisions = [
      previous,
      createDecision(stats, [], production),
    ];

    addStatsToDecision(root, stats);
  }

  return root;
}

function createDecision(stats, buildorder, production) {
  for (const one of buildorder) {
    const line = production[one.build];

    if (line) {
      line.count++;
      line.end = one.loop;
    } else {
      production[one.build] = { start: one.loop, count: 1, end: one.loop };
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

function addTimeToAction(action, time) {
  action.after = Math.min(action.after, time);
  action.before = Math.max(action.before, time);
}

function isSameAction(a, b) {
  return (a.build === b.build);
}
