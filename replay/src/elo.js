import { readElo, storeElo } from "./mongo.js";

const PROGRESS = "___";

async function getBotRaces(call) {
  const bots = (await call("GET", "/api/bots/?limit=2000")).results;
  const races = new Map();

  for (const bot of bots) {
    races.set(bot.name, bot.plays_race.label);
  }

  return races;
}

async function getRounds(call, competition) {
  return (await call("GET", "/api/rounds/?limit=1000&competition=" + competition)).results.sort((a, b) => (a.number - b.number));
}

async function getMatches(call, round) {
  return (await call("GET", "/api/matches/?limit=2000&round=" + round)).results
    .filter(match => (match.started && match.result && match.result.replay_file))
    .map(function({ started, result }) {
      if (result.type === "Tie") {
        return { round, time: started, bot: result.bot1_name, opponent: result.bot2_name, score: 0.5 };
      } else if (result.type === "Player1Win") {
        return { round, time: started, bot: result.bot1_name, opponent: result.bot2_name, score: 1.0 };
      } else if (result.type === "Player2Win") {
        return { round, time: started, bot: result.bot1_name, opponent: result.bot2_name, score: 0.0 };
      } else if (result.type.startsWith("Player2")) {
        return { round, time: started, bot: result.bot1_name, opponent: result.bot2_name, score: 1.0 };
      } else if (result.type.startsWith("Player1")) {
        return { round, time: started, bot: result.bot1_name, opponent: result.bot2_name, score: 0.0 };
      }
    });
}

function calculateEloMeans(tables) {
  for (const bot in tables.A) {
    const sum = getElo(tables.P, bot) + getElo(tables.R, bot) + getElo(tables.T, bot) + getElo(tables.Z, bot);
    tables.M[bot] = Math.round(sum / 4);
  }
}

function getElo(table, bot) {
  const elo = table[bot];

  if (!elo) {
    table[bot] = 1600;
    return 1600;
  }

  return elo;
}

function getEloChange(eloOfPlayer1, eloOfPlayer2, score) {
  const K = 8;
  const expected = 1 / (1 + Math.pow(10, (eloOfPlayer2 - eloOfPlayer1) / 400));
  const change = K * (score - expected);
  return Math.max(-K, Math.min(K, Math.round(change)));
}

function applyEloChange(bot, botStartEloTable, opponent, opponentStartEloTable, score, botNextEloTable) {
  const botElo = getElo(botStartEloTable, bot);
  const opponentElo = getElo(opponentStartEloTable, opponent);
  const change = getEloChange(botElo, opponentElo, score);

  botNextEloTable[bot] = getElo(botNextEloTable, bot) + change;
}

export async function processEloRatings(call, competition) {
  const record = await readElo(competition, PROGRESS);
  const recordRound = record?.round || 0;
  const races = await getBotRaces(call);
  const rounds = await getRounds(call, competition);

  let startElo = record?.elo || {
    A: {},
    M: {},
    P: {},
    R: {},
    T: {},
    Z: {},
  };

  let roundCount = 0;

  for (const round of rounds) {
    if (round.number <= recordRound) continue;

    console.log();
    console.log("Round", round.number);

    const nextElo = {
      A: { ...startElo.A },
      M: {},
      P: { ...startElo.P },
      R: { ...startElo.R },
      T: { ...startElo.T },
      Z: { ...startElo.Z },
    };

    const results = await getMatches(call, round.id);

    for (const result of results) {
      if (!result) continue;

      const bot = result.bot;
      const botRace = races.get(bot);
      const botScore = result.score;
      const opponent = result.opponent;
      const opponentRace = races.get(bot);
      const opponentScore = 1.0 - result.score;

      // Calculate changes for the bot
      applyEloChange(bot, startElo.A, opponent, startElo.A, botScore, nextElo.A);
      applyEloChange(bot, startElo[opponentRace], opponent, startElo[botRace], botScore, nextElo[opponentRace]);

      // Calculate changes for the opponent
      applyEloChange(opponent, startElo.A, bot, startElo.A, opponentScore, nextElo.A);
      applyEloChange(opponent, startElo[botRace], bot, startElo[opponentRace], opponentScore, nextElo[botRace]);
    }

    calculateEloMeans(nextElo);

    startElo = nextElo;

    if (round.complete) {
      await storeElo({ competition, bot: PROGRESS, round: round.number, elo: startElo });

      for (const bot in startElo.A) {
        const botRecord = (await readElo(competition, bot)) || {
          competition,
          bot, 
          A: [],
          M: [],
          P: [],
          R: [],
          T: [],
          Z: [],
        };

        botRecord.A[round.number] = startElo.A[bot];
        botRecord.M[round.number] = startElo.M[bot];
        botRecord.P[round.number] = startElo.P[bot];
        botRecord.R[round.number] = startElo.R[bot];
        botRecord.T[round.number] = startElo.T[bot];
        botRecord.Z[round.number] = startElo.Z[bot];

        await storeElo(botRecord);
      }
    }

    roundCount++;
    if (roundCount >= 3) break;
  }
}

// async function go() {
//   console.log("Connecting to AI Arena...");
//   await call("POST", "/api/auth/login/", SECRETS);

//   console.log("Updating Elo ratings...");
//   await processEloRatings();

//   console.log("Done.");
//   process.exit(0);
// }

// go();
