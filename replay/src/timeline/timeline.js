import { getArmyCount } from "./army.js";
import Event from "../replay/event.js";

const PART_SIZE = 160;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

function splitInChunks(events) {
  const chunks = [];
  let chunk = [];
  let endLoop = PART_SIZE;

  for (const event of events) {
    if ((event.loop >= endLoop) && (chunk.length)) {
      chunks.push(chunk);
      chunk = [];
      endLoop += PART_SIZE;
    }

    if ((event.type !== Event.Count) && (event.type !== Event.Exit)) continue;

    chunk.push(event);
  }

  if (chunk.length) {
    chunks.push(chunk);
  }

  return chunks;
}

function addLoss(losses, type, count) {
  if (losses[type]) {
    losses[type] += count;
  } else {
    losses[type] = count;
  }
}

function createPart(replay, chunk) {
  let loop = Infinity;
  const players = {};

  players[PLAYER_1] = { army: {}, resources: {}, losses: {} };
  players[PLAYER_2] = { army: {}, resources: {}, losses: {} };

  for (const event of chunk) {
    if (event.loop < loop) loop = event.loop;

    if (event.type === Event.Count) {
      players[event.pid].resources[event.stype] = event.out;
    } else if (event.type === Event.Exit) {
      addLoss(players[event.pid].losses, event.stype, 1);
    }
  }

  for (const one in players) {
    players[one].army = getArmyCount(replay, loop, one);
  }

  return {
    type: "stats",
    loop: loop,
    players: players,
  };
}

function createTimeline(replay, chunks) {
  return chunks.map(chunk => createPart(replay, chunk));
}

function addHighlights(replay, timeline) {
  const highlights = [];

  let previous = null;
  let fight = null;

  for (const part of timeline) {
    if (previous) {
      const currentPlayer1 = part.players[PLAYER_1].resources;
      const previousPlayer1 = previous.players[PLAYER_1].resources;
      const currentPlayer2 = part.players[PLAYER_2].resources;
      const previousPlayer2 = previous.players[PLAYER_2].resources;

      previousPlayer1.valueKilled = currentPlayer1.valueKilled - previousPlayer1.valueKilled;
      previousPlayer2.valueKilled = currentPlayer2.valueKilled - previousPlayer2.valueKilled;

      if (previousPlayer1.valueKilled && previousPlayer2.valueKilled) {
        if (fight) {
          fight.end = part.loop;
        } else {
          fight = {
            type: "fight",
            loop: previous.loop,
            end: part.loop,
            players: {},
          };

          fight.players[PLAYER_1] = { army: {}, losses: {}, value: 0, kill: 0 };
          fight.players[PLAYER_2] = { army: {}, losses: {}, value: 0, kill: 0 };

          for (const one in fight.players) {
            const fightPlayer = fight.players[one];
            const previousPlayer = previous.players[one];

            fightPlayer.value = previousPlayer.resources.activeForces;
            fightPlayer.army = getArmyCount(replay, fight.loop, one);
          }

          highlights.push(fight);
        }

        for (const one in fight.players) {
          const fightPlayer = fight.players[one];
          const previousPlayer = previous.players[one];

          fightPlayer.kill += previousPlayer.resources.valueKilled;

          for (const type in previousPlayer.losses) {
            addLoss(fightPlayer.losses, type, previousPlayer.losses[type]);
          }
        }
      } else {
        fight = null;
      }
    }

    previous = part;
  }

  return [...highlights, ...timeline].sort((a, b) => (a.loop - b.loop));
}

export default function timeline(replay) {
  return addHighlights(replay, createTimeline(replay, splitInChunks(replay.events)));
}
