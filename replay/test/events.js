import Replay from "../src/replay/replay.js";

const file = "./test/test.SC2Replay";

async function go() {
  try {
    const replay = await Replay.load(file);

    console.log(replay.events.map(a => a.toString()).join("\r\n"));
    console.log("Player 1:", count(replay.units, 1));
    console.log("Player 2:", count(replay.units, 2));

    if (replay.warnings.size) {
      console.log("Warnings:", [...replay.warnings.values()].sort().join(", "));
    }
  } catch (error) {
    console.log(error);
  }
}

function count(units, owner) {
  const count = new Map();

  for (const unit of units.values()) {
    if (unit.owner !== owner) continue;

    if (count.has(unit.type)) {
      count.set(unit.type, count.get(unit.type) + 1);
    } else {
      count.set(unit.type, 1);
    }
  }

  return [...count.keys()].sort().map(type => (type + ": " + count.get(type))).join(", ");
}

go();
