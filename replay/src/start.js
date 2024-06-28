import fs from "fs";
import https from "https";
import { readProgress, storeMatch, storeProgress } from "./mongo.js";
import Replay from "./replay/replay.js";

const COMPETITION = 27;

const TRACE = false;
const SECRETS = JSON.parse(fs.readFileSync("./secrets/secrets.json"));
const COOKIES = [];

function call(method, path, data) {
  const json = JSON.stringify(data ? data : "");
  const options = {
    hostname: "aiarena.net",
    port: 443,
    path: path,
    method: method,
    headers: {
      "Cookie": COOKIES.join("; "),
      "Content-Type": "application/json",
      "Content-Length": json.length,
    },
  };

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      response.setEncoding("utf8");
      let body = "";

      response.on("data", (chunk) => {
        body += chunk;
      });

      response.on("end", () => {
        if (TRACE) console.log("<<", response.statusCode);
        const cookies = response.headers["set-cookie"];
        if (cookies && cookies.length) for (const cookie of cookies) COOKIES.push(cookie);

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          resolve(undefined);
        }
      });
    });

    request.on("error", (error) => {
      reject(error);
    });

    if (TRACE) console.log(">>", method, path);
    if (TRACE) console.log(">>", json);
    request.write(json);
    request.end();
  });
}

async function go() {
  console.log("Browsing arena matches...");
  await call("POST", "/api/auth/login/", SECRETS);

  const maps = await getMaps();
  let progress = await readProgress(COMPETITION);

  if (!progress) {
    progress = { competition: COMPETITION, rounds: {} };
  }

  for (const round of await getRounds(COMPETITION)) {
    if (progress.rounds[round.number]) continue;

    let isRoundComplete = true;

    for (const match of await getMatches(round.id)) {
      let warnings;
      let events;

      if (match.replay) {
        try {
          const replay = await Replay.load(match.replay);
  
          warnings = [...replay.warnings];
          events = replay.events;

          console.log("Match:", match.id);
        } catch (error) {
          console.log(error.message);

          warnings = ["Failed to parse replay file."];
        }
      } else {
        isRoundComplete = false;
      }

      storeMatch({
        competition: COMPETITION,
        round: round.number,
        match: match.id,
        time: match.time,
        map: maps.get(match.map),
        player1: match.player1,
        player2: match.player2,
        winner: match.winner,
        replay: match.replay,
        warnings: warnings,
        events: events,
      });
    }

    if (isRoundComplete) {
      progress.rounds[round.number] = true;

      await storeProgress(progress);

      console.log("Round", round.number);
    }
  }
}

async function getMaps() {
  const maps = new Map();
  const list = (await call("GET", "/api/maps/?limit=1000")).results;

  for (const item of list) {
    maps.set(item.id, item.name);
  }

  return maps;
}

async function getRounds(competition) {
  return (await call("GET", "/api/rounds/?limit=1000&competition=" + competition)).results.sort((a, b) => (a.number - b.number));
}

async function getMatches(round) {
  return (await call("GET", "/api/matches/?limit=1000&round=" + round)).results
    .filter(match => (match.result && match.result.replay_file))
    .map(function(match) {
      let winner;
      if (match.result.type === "Player1Win") winner = match.result.bot1_name;
      if (match.result.type === "Player2Win") winner = match.result.bot2_name;

      return {
        id: match.id,
        time: match.started,
        map: match.map,
        player1: match.result.bot1_name,
        player2: match.result.bot2_name,
        winner: winner,
        replay: match.result.replay_file,
      };
    });
}

go();
