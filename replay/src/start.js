import fs from "fs";
import https from "https";
import { readProgress, storeMatch, storeProgress, storeRanking, traverseMatches } from "./mongo.js";
import Replay from "./replay/replay.js";
import getOverview from "./timeline/overview.js";
import getTimeline from "./timeline/timeline.js";

const VERSION = 3;
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
  console.log(new Date().toISOString(), "Connecting to AI Arena...");
  await call("POST", "/api/auth/login/", SECRETS);

  console.log(new Date().toISOString(), "Updating rankings...");
  await processRankings(COMPETITION);

  console.log(new Date().toISOString(), "Updating matches...");
  await processRounds(COMPETITION);

  console.log(new Date().toISOString(), "Updating overviews...");
  await processOverviews();

  console.log(new Date().toISOString(), "Done.");
  process.exit(0);
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

async function getRoundInProgress(competition, progress) {
  const rounds = await getRounds(competition);

  for (const round of rounds) {
    if (progress.rounds[round.number] !== true) return round;
  }
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
        duration: match.result.game_steps,
        winner: winner,
        replay: match.result.replay_file,
      };
    });
}

async function processRounds(competition) {
  const maps = await getMaps();

  let progress = await readProgress(competition);
  if (!progress || (progress.version !== VERSION)) progress = { version: VERSION, competition: competition, rounds: {} };

  const round = await getRoundInProgress(competition, progress);

  if (round) {
    console.log("Round", round.number);

    const matches = await getMatches(round.id);
    let isRoundComplete = round.complete;

    if (!Array.isArray(progress.rounds[round.number])) {
      progress.rounds[round.number] = [];
    }

    for (const match of matches) {
      if (progress.rounds[round.number].indexOf(match.id) >= 0) continue;

      console.log("Match:", match.id);

      let warnings;
      let timeline;
      let overview;

      if (match.replay) {
        try {
          const replay = await Replay.load(match.replay);
  
          warnings = [...replay.warnings];
          timeline = getTimeline(replay);
          overview = getOverview(replay, timeline);
        } catch (error) {
          console.log(error.message);

          warnings = ["Failed to parse replay file."];
        }
      } else {
        isRoundComplete = false;
        warnings = ["No replay file."];
      }

      await storeMatch({
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
        overview: overview,
        timeline: timeline,
      });

      progress.rounds[round.number].push(match.id);
    }

    if (isRoundComplete) {
      progress.rounds[round.number] = true;
    }

    await storeProgress(progress);
  }
}

async function processRankings(competition) {
  const bots = (await call("GET", "/api/bots/?limit=1000")).results;
  const rank = (await call("GET", "/api/competition-participations/?limit=1000&competition=" + competition)).results;

  for (const one of rank) {
    const bot = bots.find(bot => (bot.id === one.bot));

    await storeRanking({
      id: bot.id,
      bot: bot.name,
      race: bot.plays_race.label,
      competition: competition,
      elo: one.elo,
      winRate: one.win_perc,
      division: one.division_num,
      lastUpdate: bot.bot_zip_updated,
    });
  }
}

function addToOverview(overviews, player, key, value) {
  if ((value >= 0) || Array.isArray(value)) {
    let overview = overviews.get(player);

    if (!overview) {
      overview = {};
      overviews.set(player, overview);
    }

    let list = overview[key];

    if (!list) {
      list = [];
      overview[key] = list;
    }

    list.push(Array.isArray(value) ? value.join("|") : value);
  }
}

function findAverage(list) {
  if (!list) return 0;

  let sum = 0;

  for (const one of list) {
    sum += one;
  }

  return sum / list.length;
}

function findMostFrequent(list) {
  if (!list.length) return [];

  const counts = new Map();
  const order = [];

  for (const one of list) {
    let count = counts.get(one);

    if (count) {
      counts.set(one, count + 1);
    } else {
      counts.set(one, 1);
    }
  }

  for (const [key, count] of counts) {
    order.push({ key, count });
  }
  order.sort((a, b) => (b.count - a.count));

  return order.map(one => one.key)[0].split("|");
}

async function processOverviews() {
  const overviews = new Map();
  const keys = [
    "armyBuild",
    "militaryCapacity", "militaryPerformance",
    "economyCapacity", "economyPerformance",
    "technologyCapacity", "technologyPerformance"
  ];

  await traverseMatches({ player1: 1, player2: 1, overview: 1 }, function(match) {
    if (match.overview) {
      for (const key of keys) {
        addToOverview(overviews, match.player1, key, match.overview.players[1][key]);
        addToOverview(overviews, match.player2, key, match.overview.players[2][key]);
      }
    }
  });

  for (const [player, overview] of overviews) {
    for (const key of keys) {
      if (key === "armyBuild") {
        overview[key] = findMostFrequent(overview[key]);
      } else {
        overview[key] = findAverage(overview[key]);
      }
    }

    await storeRanking({ ...overview, bot: player });
  }
}

go();
