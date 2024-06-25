import Event from "./event.js";
import Unit from "./unit.js";

export default function readTrackerEvents(replay, decoder) {
  let loop = 0;

  while (decoder.seek((a, b) => (a === 0x03) && ((b === 0x00) || (b === 0x02)), 2)) {
    decoder.skip(2); // 03 00

    loop += decoder.read();

    const type = decoder.read();
    const data = decoder.read();
    const event = readTrackerEvent(replay, loop, type, data);

    if (event) {
      console.log(event.toString());
    }
  }
}

function readTrackerEvent(replay, loop, type, data) {
  switch (type) {
    case 0: return readPlayerStatsEvent(loop, data);
    case 1: return readUnitBornEvent(replay, data);
    case 2: return readUnitDiedEvent();
    case 3: return readUnitOwnerChangeEvent();
    case 4: return readUnitTypeChangeEvent();
    case 5: return readUpgradeCompleteEvent(data, loop);
    case 6: return readUnitInitEvent(replay, data);
    case 7: return readUnitDoneEvent();
    case 8: return readUnitPositionsEvent();
    case 9: return readPlayerSetupEvent();
  }
}

function readPlayerStatsEvent(loop, data) {
  const player = data["0"];
  const stats = data["1"];
  const minerals = Math.max(stats["0"], 0);
  const vespene = Math.max(stats["1"], 0);
  const foodUsed = Math.max(stats["29"], 0) / 4096.0;
  const foodMade = Math.max(stats["30"], 0) / 4096.0;

  return new Event({
    type: Event.Stats,
    loop: loop,
    player: player,
    minerals: minerals,
    vespene: vespene,
    foodUsed: foodUsed,
    foodMade: foodMade,
  });
}

function readUnitBornEvent(replay, data) {
  const owner = data["3"];
  const type = data["2"].toString("utf8");
  const id = data["0"] << 18 | data["1"];
  const x = data["5"] * 4;
  const y = data["6"] * 4;

  replay.units.set(id, new Unit(owner, type, id, x, y));
}

function readUnitDiedEvent() {
}

function readUnitOwnerChangeEvent() {
}

function readUnitTypeChangeEvent() {
}

function readUpgradeCompleteEvent(data, loop) {
  const player = data["0"];
  const upgrade = data["1"].toString("utf8");

  if (upgrade === "SprayProtoss") return;
  if (upgrade === "SprayTerran") return;
  if (upgrade === "SprayZerg") return;

  return new Event({
    type: Event.UpgradeComplete,
    loop: loop,
    player: player,
    research: upgrade,
  });
}

function readUnitInitEvent(replay, data) {
  const owner = data["3"];
  const type = data["2"].toString("utf8");
  const id = data["0"] << 18 | data["1"];
  const x = data["5"];
  const y = data["6"];

  replay.units.set(id, new Unit(owner, type, id, x, y));
}

function readUnitDoneEvent() {
}

function readUnitPositionsEvent() {
}

function readPlayerSetupEvent() {
  // Player setup in AI Arena is always the same
}
