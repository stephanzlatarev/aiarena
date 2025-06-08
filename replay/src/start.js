import fs from "fs";
import https from "https";
import { deleteRanking, readBuildOrder, readProgress, storeBuildOrder, storeMatch, storeProgress, storeRanking, traverseMatches } from "./mongo.js";
import Replay from "./replay/replay.js";
import { default as getMatchBuildOrder, addBuildOrder } from "./timeline/buildorder.js";
import getOverview from "./timeline/overview.js";
import getTimeline from "./timeline/timeline.js";

import AbyssalReefAIE from "./map/AbyssalReefAIE.js";
import AcropolisAIE from "./map/AcropolisAIE.js";
import AutomatonAIE from "./map/AutomatonAIE.js";
import EphemeronAIE from "./map/EphemeronAIE.js";
import Equilibrium513AIE from "./map/Equilibrium513AIE.js";
import GoldenAura513AIE from "./map/GoldenAura513AIE.js";
import Gresvan513AIE from "./map/Gresvan513AIE.js";
import HardLead513AIE from "./map/HardLead513AIE.js";
import InterloperAIE from "./map/InterloperAIE.js";
import Oceanborn513AIE from "./map/Oceanborn513AIE.js";
import PersephoneAIE from "./map/PersephoneAIE.js";
import PylonAIE from "./map/PylonAIE.js";
import SiteDelta513AIE from "./map/SiteDelta513AIE.js";
import ThunderbirdAIE from "./map/ThunderbirdAIE.js";
import TorchesAIE from "./map/TorchesAIE.js";

const MAP_INFO = {
  AbyssalReefAIE: AbyssalReefAIE,
  AcropolisAIE: AcropolisAIE,
  AutomatonAIE: AutomatonAIE,
  EphemeronAIE: EphemeronAIE,
  Equilibrium513AIE: Equilibrium513AIE,
  GoldenAura513AIE: GoldenAura513AIE,
  Gresvan513AIE: Gresvan513AIE,
  HardLead513AIE: HardLead513AIE,
  InterloperAIE: InterloperAIE,
  Oceanborn513AIE: Oceanborn513AIE,
  PersephoneAIE: PersephoneAIE,
  PylonAIE: PylonAIE,
  SiteDelta513AIE: SiteDelta513AIE,
  ThunderbirdAIE: ThunderbirdAIE,
  TorchesAIE: TorchesAIE,
};

const VERSION = 9;
const COMPETITION = 33;
const COMPETITION_IS_ACTIVE = true;

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
          if (TRACE) {
            console.log("<<", response.headers);
            console.log(error);
          }

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

  console.log(new Date().toISOString(), "Reading bots info...");
  const bots = (await call("GET", "/api/bots/?limit=1000")).results;

  console.log(new Date().toISOString(), "Updating rankings...");
  await processRankings(COMPETITION, bots);

  console.log(new Date().toISOString(), "Updating matches...");
  await processRounds(COMPETITION, bots);

  console.log(new Date().toISOString(), "Updating overviews...");
  await processOverviews(COMPETITION);

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

// Pick at most 3 rounds to process in this iteration of the job
// The ladder usually has 2 rounds open with only a few new matches completed in the last 10 minutes
// We pick the 2 rounds and 1 more with previous parsing version prioritizing the later rounds by number
async function pickRoundsInProgress(competition, progress) {
  const rounds = await getRounds(competition);
  const picks = [];

  rounds.sort((a, b) => (b.number - a.number));

  for (const round of rounds) {
    if (progress.rounds[round.number] !== VERSION) {
      picks.push(round);
    }

    if (picks.length >= 3) break;
  }

  return picks;
}

async function getMatches(round) {
  return (await call("GET", "/api/matches/?limit=1000&round=" + round)).results
    .filter(match => (match.result && match.result.replay_file))
    .map(function(match) {
      let winner;

      // Check for win of one player
      if (match.result.type === "Player1Win") winner = match.result.bot1_name;
      if (match.result.type === "Player2Win") winner = match.result.bot2_name;

      if (!winner) {
        // Check for crash, timeout, race mismatch, or surrender of the other player
        if (match.result.type.startsWith("Player1")) winner = match.result.bot2_name;
        if (match.result.type.startsWith("Player2")) winner = match.result.bot1_name;
      }

      return {
        id: match.id,
        time: match.started,
        map: match.map,
        player1: match.result.bot1_name,
        player2: match.result.bot2_name,
        duration: match.result.game_steps,
        winner: winner,
        status: match.result.type,
        replay: match.result.replay_file,
      };
    });
}

async function processRounds(competition, bots) {
  const maps = await getMaps();
  const progress = (await readProgress(competition)) || { competition: competition, rounds: {} };
  const rounds = await pickRoundsInProgress(competition, progress);
  const botRace = new Map();

  for (const bot of bots) {
    botRace.set(bot.name, bot.plays_race.label);
  }

  for (const round of rounds) {
    console.log("Round", round.number);

    const matches = await getMatches(round.id);
    let tracker = progress.rounds[round.number];
    let isRoundComplete = round.complete;

    if (!tracker || (tracker.version !== VERSION)) {
      tracker = { version: VERSION, matches: [] };
    }

    for (const match of matches) {
      if (tracker.matches.indexOf(match.id) >= 0) continue;

      console.log("Match:", match.id);

      const map = maps.get(match.map);
      const mapInfo = MAP_INFO[map];
      let side = 0;
      let warnings;
      let timeline;
      let overview;

      if (match.replay && mapInfo) {
        try {
          const replay = await Replay.load(match.replay);

          side = replay.side;
          warnings = [...replay.warnings];
          timeline = getTimeline(replay, mapInfo);
          overview = getOverview(replay, timeline);

          await storeBuildOrder(match.player1, addBuildOrder(
            match.player1, map, botRace.get(match.player2), match.player2, match.winner,
            await readBuildOrder(match.player1), getMatchBuildOrder(replay, mapInfo, 1)
          ));
          await storeBuildOrder(match.player2, addBuildOrder(
            match.player2, map, botRace.get(match.player1), match.player1, match.winner,
            await readBuildOrder(match.player2), getMatchBuildOrder(replay, mapInfo, 2)
          ));
        } catch (error) {
          console.log(error.message);

          warnings = ["Failed to parse replay file."];
        }
      } else if (!mapInfo) {
        warnings = ["Unknown map " + map];
      } else {
        isRoundComplete = false;
        warnings = ["No replay file."];
      }

      await storeMatch({
        competition: COMPETITION,
        round: round.number,
        match: match.id,
        time: match.time,
        map: map,
        side: side,
        player1: match.player1,
        player2: match.player2,
        duration: match.duration,
        winner: match.winner,
        replay: match.replay,
        warnings: warnings,
        overview: overview,
        timeline: timeline,
      });

      tracker.matches.push(match.id);
    }

    progress.rounds[round.number] = isRoundComplete ? VERSION : tracker;

    await storeProgress(progress);
  }
}

async function processRankings(competition, bots) {
  const rank = (await call("GET", "/api/competition-participations/?limit=1000&competition=" + competition)).results;

  for (const one of rank) {
    const bot = bots.find(bot => (bot.id === one.bot));

    if (one.active || !COMPETITION_IS_ACTIVE) {
      await storeRanking({
        id: bot.id,
        bot: bot.name,
        race: bot.plays_race.label,
        competition: competition,
        elo: one.elo,
        winRate: one.win_perc,
        division: one.division_num,
        lastUpdate: bot.bot_zip_updated,
        user: bot.user,
      });
    } else {
      await deleteRanking(competition, bot.name);
    }
  }
}

function findOverview(overviews, player, key, empty) {
  let overview = overviews.get(player);

  if (!overview) {
    overview = {};
    overviews.set(player, overview);
  }

  let collection = overview[key];

  if (!collection) {
    collection = empty;
    overview[key] = collection;
  }

  return collection;
}

function addRatingOverview(overviews, player, key, value) {
  if (value >= 0) {
    findOverview(overviews, player, key, []).push(value);
  }
}

function findAverageRating(list) {
  if (!list) return 0;

  let sum = 0;

  for (const one of list) {
    sum += one;
  }

  return sum / list.length;
}

function addArmyBuildOverview(overviews, player, key, build, win, score) {
  if (Array.isArray(build)) {
    const builds = findOverview(overviews, player, key, {});
    const buildKey = build.join("|");
    const buildInfo = builds[buildKey];

    if (buildInfo) {
      if (win) {
        buildInfo.score += score;
        buildInfo.wins++;
      } else {
        buildInfo.score -= score;
      }
    } else {
      builds[buildKey] = {
        army: build,
        score: win ? score : -score,
        wins: win ? 1 : 0,
      }
    }
  }
}

function findBestArmyBuild(builds) {
  let best = { army: [], score: -Infinity, wins: 0 };

  if (builds) {
    for (const key in builds) {
      const build = builds[key];

      if (!best) {
        // Any army build is better than no army build
        best = build;
      } else if (best.wins > 0) {
        // An army build is better than another army build with wins only if it has wins too
        if (build.wins > 0) {
          const isScoreHigher = build.score > best.score;
          const hasSignificantlyMoreWins = (build.wins > best.wins * 2);
          const hasSignificantlyLessWins = (best.wins > build.wins * 2);

          if (hasSignificantlyMoreWins) {
            // An army build with wins is better than another army build with wins if it has significantly more wins
            best = build;
          } else if (isScoreHigher && !hasSignificantlyLessWins) {
            // An army build with wins is better than another army build with wins if its score is higher but the other doesn't have significantly more wins
            best = build;
          }
        }
      } else if (build.wins > 0) {
        // An army build with wins is better than another army build without wins
        best = build;
      } else if (build.score > best.score) {
        // An army build without wins is better than another army build without wins if its score is higher
        best = build;
      }
    }
  }

  return best;
}

async function processOverviews(competition) {
  const overviews = new Map();
  const ratings = [
    "militaryCapacity", "militaryPerformance",
    "economyCapacity", "economyPerformance",
    "technologyCapacity", "technologyPerformance"
  ];

  await traverseMatches({ competition: competition }, { round: 1, player1: 1, player2: 1, winner: 1, overview: 1 }, function(match) {
    if (match.overview) {
      for (const rating of ratings) {
        addRatingOverview(overviews, match.player1, rating, match.overview.players[1][rating]);
        addRatingOverview(overviews, match.player2, rating, match.overview.players[2][rating]);
      }

      addArmyBuildOverview(overviews, match.player1, "armyBuild", match.overview.players[1].armyBuild, (match.winner === match.player1), match.round);
      addArmyBuildOverview(overviews, match.player2, "armyBuild", match.overview.players[2].armyBuild, (match.winner === match.player2), match.round);
    }
  });

  for (const [player, overview] of overviews) {
    for (const rating of ratings) {
      overview[rating] = findAverageRating(overview[rating]);
    }

    const bestArmyBuild = findBestArmyBuild(overview.armyBuild);
    overview.armyBuild = bestArmyBuild.army;
    overview.armyBuildWins = bestArmyBuild.wins;

    await storeRanking({ ...overview, competition: competition, bot: player });
  }
}

go();
