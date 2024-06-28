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

  const info = { bot: bot, matches: [] };
  const matches = await connect("matches");
  const matchProjection = { _id: 0, round: 1, match: 1, time: 1, map: 1, player1: 1, player2: 1, winner: 1, replay: 1, warnings: 1 };

  const cursor = matches.find({ player1: bot }).project(matchProjection);
  while (await cursor.hasNext()) {
    info.matches.push(await cursor.next());
  }

  return info;
}
