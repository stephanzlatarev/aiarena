import { MpqFile, Replay, getTimeline } from "@robobays/replay-timeline";
import { getArmyCount, getArmyValue } from "./army.js";
import { calculateMilitaryRating } from "./rating.js";
import Event from "../replay/event.js";
import requestSummary from "./summary.js";

const STATS_LOOPS = 160;
const FIGHT_LOOPS = 60 * 22.4;
const IS_BASE = {
  CommandCenter: true, CommandCenterFlying: true, OrbitalCommand: true, OrbitalCommandFlying: true, PlanetaryFortress: true,
  Hatchery: true, Hive: true, Lair: true,
  Nexus: true,
};
const IS_TEMPORARY = {
  AdeptPhaseShift: true, Egg: true, InvisibleTargetDummy: true, KD8Charge: true,
  LocustMP: true, LocustMPPrecursor: true, LurkerMPEgg: true,
  MULE: true, WarpPrismPhasing: true
};

async function extractV2Timeline(file) {
  try {
    const mpq = await MpqFile.load(file);
    const replay = new Replay(mpq);

    for (const warning of replay.warnings) {
      console.error(warning);
    }

    return getTimeline(replay);
  } catch (error) {
    console.error("Unable to extract timeline:", error.message);
    return {};
  }
}

export default async function timeline(replay, map, match) {
  const timeline = [];

  const replayFile = match.replay;
  const v2timeline = await extractV2Timeline(replayFile);

  timeline.push(v2timeline);
  requestSummary(match, v2timeline);

  let stats = { type: "stats", loop: 0, events: [], end: STATS_LOOPS };
  let fight = { type: "fight", loop: 0, events: [], end: FIGHT_LOOPS, value: 0, loss: 0 };

  for (const event of replay.events) {
    if (event.loop >= stats.end) {
      timeline.push(processStats(stats));

      stats = { type: "stats", loop: stats.end, events: [], end: stats.end + STATS_LOOPS };
    }

    if (event.loop >= fight.end) {
      timeline.push(processFight(replay, map, fight));

      fight = { type: "fight", loop: fight.end, events: [], end: fight.end + FIGHT_LOOPS };
    }

    if ((event.type !== Event.Count) && (event.type !== Event.Enter) && (event.type !== Event.Exit)) continue;

    stats.events.push(event);
    fight.events.push(event);
  }

  if (stats.events.length) timeline.push(processStats(stats));
  if (fight.events.length) timeline.push(processFight(replay, map, fight));

  return timeline;
}

function processStats(stats) {
  const players = {
    1: { resources: {} },
    2: { resources: {} },
  };

  for (const event of stats.events) {
    if (event.type === Event.Count) {
      players[event.pid].resources[event.stype] = event.out;
    }
  }

  stats.players = players;
  delete stats.events;

  return stats;
}

function processFight(replay, map, fight) {
  const players = {
    1: { army: getArmyCount(replay, fight.loop, fight.end, 1), born: {}, died: {}, value: 0, loss: 0, bases: [], zones: [] },
    2: { army: getArmyCount(replay, fight.loop, fight.end, 2), born: {}, died: {}, value: 0, loss: 0, bases: [], zones: [] },
  };

  for (const event of fight.events) {
    if (event.type === Event.Enter) {
      addUnit(players[event.pid].born, event.stype, 1);
    } else if (event.type === Event.Exit) {
      if (IS_TEMPORARY[event.stype]) continue;
      if (event.stype.indexOf("Egg") >= 0) continue;
      if (hasDroneBuiltStructure(event, replay)) continue;

      addUnit(players[event.pid].died, event.stype, 1);

      const unit = replay.unit(event.sid);
      const zone = map.zones[unit.y][unit.x];
      addZone(players[event.pid].zones, zone);
    }
  }

  for (const pid in players) {
    const army = players[pid].army;

    players[pid].value = getArmyValue(army, army);
    players[pid].loss = getArmyValue(players[pid].died, army);
  }

  for (const unit of replay.units.values()) {
    if (IS_BASE[unit.type] && (unit.exit > fight.loop) && (unit.enter <= fight.end)) {
      const zone = map.zones[unit.borny][unit.bornx];
      addZone(players[unit.owner].bases, zone);
    }
  }

  fight.players = players;

  for (const pid in players) {
    players[pid].rating = {
      ...calculateMilitaryRating(fight, pid),
    };
  }

  fight.value = players[1].value + players[2].value;
  fight.loss = players[1].loss + players[2].loss;
  delete fight.events;

  return fight;
}

function addUnit(collection, type, count) {
  if (collection[type]) {
    collection[type] += count;
  } else {
    collection[type] = count;
  }
}

function addZone(list, zone) {
  if (zone && (list.indexOf(zone) < 0)) {
    list.push(zone);
  }
}

function hasDroneBuiltStructure(event, replay) {
  if (event.stype !== "Drone") return false;

  const drone = replay.unit(event.sid);
  let out;

  for (const op of replay.events) {
    if ((op.sid === event.sid) && (op.type === Event.Make)) out = op.out;

    if ((op.type === Event.Enter) && (op.stype === out)) {
      const structure = replay.unit(op.sid);

      if ((Math.abs(drone.x - structure.x) <= 1) && (Math.abs(drone.y - structure.y) <= 1)) {
        return true;
      }
    }
  }
}
