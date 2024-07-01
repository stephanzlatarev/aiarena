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

export async function readProgress(competition) {
  return await (await connect("progress")).findOne({ competition: competition });
}

export async function storeProgress(progress) {
  await (await connect("progress")).updateOne({ competition: progress.competition }, { $set: progress }, { upsert: true });
}

export async function storeMatch(match) {
  await (await connect("matches")).updateOne({ match: match.match }, { $set: match }, { upsert: true });
}

export async function storeRanking(ranking) {
  await (await connect("rankings")).updateOne({ id: ranking.id }, { $set: ranking }, { upsert: true });
}
