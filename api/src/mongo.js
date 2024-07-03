import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://mongo:27017");

async function connect(collection) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB.");
  }

  return client.db("aiarena").collection(collection);
}

export async function getBotInfo(bot) {
  if (!bot || !bot.length) return;

  const info = { bot: bot, ranking: {}, matches: [] };

  const rankings = await connect("rankings");
  info.ranking = await rankings.findOne({ bot: bot });

  const matches = await connect("matches");
  const matchProjection = { _id: 0, round: 1, match: 1, time: 1, map: 1, player1: 1, player2: 1, winner: 1, replay: 1, warnings: 1, overview: 1 };

  const cursor = matches.find({ player1: bot }).project(matchProjection);
  while (await cursor.hasNext()) {
    info.matches.push(await cursor.next());
  }

  return info;
}

export async function getMatchInfo(match) {
  if (!match || !match.length) return;

  const matches = await connect("matches");
  const matchProjection = { _id: 0, round: 1, match: 1, time: 1, map: 1, player1: 1, player2: 1, duration: 1, winner: 1, replay: 1, warnings: 1, overview: 1, timeline: 1 };
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
    history: [...(await listMatches(matches, matchInfo.map, matchInfo.player1, matchInfo.player2)), ...(await listMatches(matches, matchInfo.map, matchInfo.player2, matchInfo.player1))],
  };
}

async function listMatches(matches, map, player1, player2) {
  const list = [];
  const projection = { _id: 0, round: 1, match: 1, time: 1, map: 1, winner: 1, warnings: 1 };
  const cursor = matches.find({ map: map, player1: player1, player2: player2 }).project(projection);

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
