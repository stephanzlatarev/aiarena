import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://mongo:27017");

async function connect(collection) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB.");

    const aiarena = client.db("aiarena");
    const matchIndexes = await aiarena.collection("matches").listIndexes().toArray();

    if (matchIndexes.length < 4) {
      console.log("Competition index created:", await aiarena.collection("progress").createIndex({ competition: 1 }));
      console.log("Rankings index by id created:", await aiarena.collection("rankings").createIndex({ id: 1 }));
      console.log("Rankings index by name created:", await aiarena.collection("rankings").createIndex({ bot: 1 }));
      console.log("Match index by id created:", await aiarena.collection("matches").createIndex({ match: 1 }));
      console.log("Match index by player1 created:", await aiarena.collection("matches").createIndex({ player1: 1 }));
      console.log("Match index by player2 created:", await aiarena.collection("matches").createIndex({ player2: 1 }));
      console.log("Match index by map and players created:", await aiarena.collection("matches").createIndex({ map: 1, player1: 1, player2: 1 }));
    }
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
  await (await connect("rankings")).updateOne({ bot: ranking.bot }, { $set: ranking }, { upsert: true });
}

export async function traverseMatches(projection, handle) {
  const matches = await connect("matches");
  const cursor = matches.find({}).project({ ...projection, _id: 0 });

  while (await cursor.hasNext()) {
    handle(await cursor.next());
  }
}
