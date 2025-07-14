import https from "https";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;

export default function(match, map, timeline) {
  console.log("Request summary for match:", match ? match.id : "unknown", "with", timeline ? timeline.length : "no", "timeline events");
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

  const options = {
    method: "POST",
    hostname: "genai.superskill.me",
    path: "/timeline-summary/" + match.id,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
    rejectUnauthorized: false,
  };

  const request = https.request(options, (response) => {
    let body = "";
    response.on("data", (chunk) => {
      body += chunk;
    });
    response.on("end", () => {
      console.log("Response summary:", body);
    });
  });

  request.on("timeout", () => {
    console.error("Request summary timed out");
  });

  request.on("error", (e) => {
    console.error("Request summary error:", e);
  });

  console.log("Sending request summary for match:", match.id);

  request.write(data);
  request.end();
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
