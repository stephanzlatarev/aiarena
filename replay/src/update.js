import fs from "fs";
import https from "https";
import { MongoClient } from "mongodb";

const COMPETITION = 27;

const TRACE = false;
const SECRETS = JSON.parse(fs.readFileSync("./secrets/secrets.json"));
const COOKIES = [];

const client = new MongoClient("mongodb://mongo:27017");

async function connect(collection) {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB.");
  }

  return client.db("aiarena").collection(collection);
}

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
  console.log("Updating stored data...");

  console.log("Connecting to AI Arena...");
  await call("POST", "/api/auth/login/", SECRETS);

  console.log("Updating rankings...");
  await processRankings();

  console.log("Done.");
  process.exit(0);
}

async function getRounds() {
  return (await call("GET", "/api/rounds/?limit=1000&competition=" + COMPETITION)).results.sort((a, b) => (a.number - b.number));
}

async function getMatches(round) {
  const matches = (await call("GET", "/api/matches/?limit=1000&round=" + round)).results
    .filter(match => (match.result && match.result.replay_file))
    .map(function(match) {
      return {
        id: match.id,
        duration: match.result.game_steps,
      };
    });
  const map = new Map();

  for (const match of matches) {
    map.set(match.id, match.duration);
  }

  return map;
}

async function updateMatchDuration(match, duration) {
  await (await connect("matches")).updateOne({ match: match }, { $set: { duration: duration } });
}

async function processRankings() {
  for (const round of await getRounds()) {
    console.log("Round", round.number);

    for (const [match, duration] of await getMatches(round.id)) {
      console.log("\tMatch", match, "duration:", duration);
      await updateMatchDuration(match, duration);
    }
  }
}

go();
