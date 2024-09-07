import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://mongo:27017");

async function connect(collection) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB.");

    const aiarena = client.db("aiarena");

    console.log("Match index by player1 created:", await aiarena.collection("matches").createIndex({ player1: 1, round: 1 }));
    console.log("Match index by player2 created:", await aiarena.collection("matches").createIndex({ player2: 1, round: 1 }));

    const indexes = await aiarena.collection("matches").listIndexes().toArray();
    console.log("Indexes:", indexes);
  }

  return client.db("aiarena").collection(collection);
}

export async function getBotInfo(bot) {
  if (!bot || !bot.length) return;

  const info = { bot: bot, buildorder: {}, ranking: {}, matches: [], opponents: [] };

  const rankings = await connect("rankings");
  info.ranking = await rankings.findOne({ bot: bot });

  let cursor = rankings.find({}).project({ _id: 0, bot: 1, division: 1, elo: 1, user: 1 });
  while (await cursor.hasNext()) {
    info.opponents.push(await cursor.next());
  }

  const matches = await connect("matches");
  const matchProjection = { _id: 0, round: 1, match: 1, time: 1, map: 1, side: 1, player1: 1, player2: 1, winner: 1, warnings: 1, overview: 1 };

  const player1matches = await matches.find({ player1: bot, round: { $gte: 150 }}).project(matchProjection).toArray();
  const player2matches = await matches.find({ player2: bot, round: { $gte: 150 } }).project(matchProjection).toArray();
  info.matches = [...player1matches, ...player2matches].map(matchWithoutBuildOrders);

  return info;
}

function matchWithoutBuildOrders(match) {
  if (match && match.overview && match.overview.players) {
    for (const player in match.overview.players) {
      delete match.overview.players[player].buildOrder;
    }
  }

  return match;
}

export async function getMatchInfo(match) {
  if (!match || !match.length) return;

  const matches = await connect("matches");
  const matchProjection = { _id: 0, round: 1, match: 1, time: 1, map: 1, side: 1, player1: 1, player2: 1, duration: 1, winner: 1, warnings: 1, overview: 1, timeline: 1 };
  const matchInfo = await matches.findOne({ match: Number(match) }, { projection: matchProjection });

  const rankings = await connect("rankings");

  return {
    ...matchInfo,
    player1: {
      bot: matchInfo.player1,
      ranking: await rankings.findOne({ bot: matchInfo.player1 }),
    },
    player2: {
      bot: matchInfo.player2,
      ranking: await rankings.findOne({ bot: matchInfo.player2 }),
    },
    history: [...(await listMatches(matches, matchInfo.player1, matchInfo.player2)), ...(await listMatches(matches, matchInfo.player2, matchInfo.player1))],
  };
}

async function listMatches(matches, player1, player2) {
  const list = [];
  const projection = { _id: 0, round: 1, match: 1, time: 1, map: 1, side: 1, winner: 1, warnings: 1 };
  const cursor = matches.find({ player1: player1, player2: player2 }).project(projection);

  while (await cursor.hasNext()) {
    list.push(await cursor.next());
  }

  return list;
}

export async function getRankings() {
  const list = [];
  const rankings = await connect("rankings");

  const cursor = rankings.find({});
  while (await cursor.hasNext()) {
    list.push(await cursor.next());
  }

  return list;
}
