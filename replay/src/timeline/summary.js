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

  const minutes = [];
  const winnerId = (match.winner === match.player1) ? "1" : "2";
  const opponentId = (winnerId === "1") ? "2" : "1";

  let statsWinner = {};
  let statsOpponent = {};

  for (const event of timeline) {
    if (event.type === "stats") {
      statsWinner = event.players[winnerId].resources;
      statsOpponent = event.players[opponentId].resources;
    } else if (event.type === "fight") {
      minutes.push({
        minute: minutes.length + 1,
        winner: {
          resources: statsWinner,
          units: statsUnits(event.players[winnerId].units),
        },
        opponent: {
          resources: statsOpponent,
          units: statsUnits(event.players[opponentId].units),
        },
      });
    }
  }

  if ((minutes.length <= 5) || (minutes.length >= 35)) return;

  const date = new Date(match.time);
  const data = JSON.stringify({
    match: String(match.id),
    map: map,
    duration: clock(match.duration),
    winner: match.winner,
    opponent: (match.winner === match.player1) ? match.player2 : match.player1,
    timeline: minutes,
    version: 1,
    time: date.getTime(),
    day: date.getDay(),
    random: Math.floor(Math.random() * 1000000),
  });

  let review;

  for (const model of models) {
    try {
      review = await getReview(model, data);
    } catch (error) {
      console.log(error.message);
    }

    if (review && review.summary) break;
  }

  console.log("Review:", JSON.stringify(review));

  return review;
}

async function getReview(model, data) {
  const response = await gemini.models.generateContent({
    model,
    contents: [
      { role: "model", parts: [{ text: prompt }] },
      { role: "user", parts: [{ text: data }] },
    ],
  });

  const review = extractJsonResponse(response.text);

  return { ...review, model };
}

function statsUnits(units) {
  const stats = {};

  if (units) {
    for (const type in units) {
      const unit = units[type];
      if (!unit) continue;

      stats[type] = {
        count: unit.count,
        born: unit.born,
        died: unit.died,
      };
    }
  }

  return stats;
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
