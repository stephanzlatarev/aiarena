import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;

const models = [
  "gemini-3.1-flash-lite-preview",
  "gemma-3-27b-it",
  "gemma-3-12b-it",
  "gemma-3-4b-it",
  "gemma-3-2b-it",
  "gemma-3-1b-it",
];
const gemini = new GoogleGenAI({ apiKey: fs.readFileSync("./secrets/GOOGLE_API_KEY", "utf8") });
const prompt = fs.readFileSync("./src/timeline/summary.prompt", "utf8");

export default async function(match, map, timeline) {
  console.log("Request review for match:", match ? match.id : "unknown", "with", timeline ? timeline.length : "no", "timeline events");
  if (!match || !timeline || !timeline.length) return;

  const digest = digestTimeline(match, map, timeline);
  if (!digest) return;

  let review;

  for (const model of models) {
    try {
      review = await getReview(model, digest);
    } catch (error) {
      console.log(error.message);
    }

    if (review && review.summary) break;
  }

  return review;
}

function digestTimeline(match, map, timeline) {
  const lines = [];

  lines.push(
    "# Metadata",
    "Map: " + map,
    "Duration: " + clock(match.duration),
    "Player 1: " + match.player1,
    "Player 2: " + match.player2,
    "Winner: " + match.winner,
  );
  lines.push("");

  lines.push("# Timeline");
  lines.push("");

  let minute = 1;
  let stats = { "1": {}, "2": {} };

  for (const event of timeline) {
    if (event.type === "stats") {
      stats = event.players;
    } else if (event.type === "fight") {
      lines.push("## Minute " + minute);
      lines.push(statsPlayer(match.player1, event.players[1], stats[1], event.players[2]));
      lines.push(statsPlayer(match.player2, event.players[2], stats[2], event.players[1]));
      lines.push("");

      minute++;
    }
  }

  if ((minute <= 5) || (minute >= 35)) return;

  return lines.join("\r\n");
}

function statsPlayer(name, ownData, ownStats, opponentData) {
  const lines = [];

  lines.push(name + ":");
  lines.push("  Bases: " + ownData.bases.length);
  lines.push("  Minerals: " + ownStats.minerals);
  lines.push("  Vespene: " + ownStats.vespene);
  lines.push("  Supply: " + ownStats.foodMade + " (" + ownStats.foodUsed + " in use)");
  lines.push("  Value: " + ownData.value);
  if (ownData.outposts) {
    lines.push("  Outpost:");
    for (const outpost of ownData.outposts) {
      lines.push(statsOutpost(outpost, ownData.bases, opponentData.bases));
    }
  }
  lines.push("  Units:");
  for (const type in ownData.units) {
    lines.push(statsUnit(type, ownData.units[type]));
  }
  lines.push("  Lost value: " + ownData.loss);
  for (const zone of ownData.zones) {
    lines.push(statsLosses(zone, ownData.bases, opponentData.bases));
  }

  return lines.join("\r\n");
}

function statsUnit(type, unit) {
  const changes = [];

  if (unit.born) changes.push(unit.born + " created");
  if (unit.died) changes.push(unit.died + " died");

  const appendix = changes.length ? " (" + changes.join(", ") + ")" : "";

  return `  - ${type}: ${unit.count}${appendix}`;
}

function statsLosses(zone, ownBases, enemyBases) {
  const types = zone.types.join(", ");
  const area = statsDistance(zone, ownBases, enemyBases);

  return `  - Lost ${types} units ${area}`;
}

function statsOutpost(outpost, ownBases, enemyBases) {
  const types = outpost.types.join(", ");
  const area = statsDistance(outpost, ownBases, enemyBases);

  return `  - Placed ${types} units ${area}`;
}

function statsDistance(zone, ownBases, enemyBases) {
  const distanceToOwnBases = getDistance(zone, ownBases);
  const distanceToEnemyBases = getDistance(zone, enemyBases);

  if (distanceToOwnBases < distanceToEnemyBases) {
    if (distanceToOwnBases < 15) {
      return "very close to own bases";
    } else if (distanceToOwnBases < 30) {
      return "close to own bases";
    } else if (distanceToOwnBases < 45) {
      return "at short distance to own bases";
    } else {
      return "at medium distance to own bases";
    }
  } else {
    if (distanceToEnemyBases < 15) {
      return "very close to enemy bases";
    } else if (distanceToEnemyBases < 30) {
      return "close to enemy bases";
    } else if (distanceToEnemyBases < 45) {
      return "at short distance to enemy bases";
    } else {
      return "at medium distance to enemy bases";
    }
  }
}

function getDistance(zone, bases) {
  let closest = Infinity;

  for (const base of bases) {
    const dx = (zone.x - base.x);
    const dy = (zone.y - base.y);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < closest) {
      closest = distance;
    }
  }

  return closest;
}

async function getReview(model, input) {
  const time = Date.now();
  const response = await gemini.models.generateContent({
    model,
    contents: [
      { role: "model", parts: [{ text: prompt }] },
      { role: "user", parts: [{ text: input }] },
    ],
  });
  const elapsed = (Date.now() - time);

  const review = extractJsonResponse(response.text);
  const tokens = response.usageMetadata.totalTokenCount;

  return { ...review, model, tokens, millis: elapsed };
}

function clock(loop) {
  if (loop >= 0) {
    const minutes = Math.floor(loop / LOOPS_PER_MINUTE);
    const seconds = Math.floor(loop / LOOPS_PER_SECOND) % 60;
    const mm = (minutes >= 10) ? minutes : "0" + minutes;
    const ss = (seconds >= 10) ? seconds : "0" + seconds;

    return `${mm}:${ss}`;
  }

  return "Unknown";
}

function extractJsonResponse(text) {
  const json = extractFromText(text, "{", 0, "}", 1);

  if (json) {
    try {
      return JSON.parse(json);
    } catch (error) {
      console.error("Error parsing JSON:", error);

      return { error: error.message };
    }
  }

  return { error: "Empty response"};
}

function extractFromText(text, begin, bo, end, eo) {
  const beginIndex = text.indexOf(begin);
  const endIndex = text.lastIndexOf(end);

  if ((beginIndex >= 0) && (endIndex > beginIndex)) {
    return text.substring(beginIndex + bo, endIndex + eo);
  }
}
