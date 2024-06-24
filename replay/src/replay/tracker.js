import Unit from "./unit.js";

export default function readTrackerEvents(replay, decoder) {
  let loop = 0;

  while (!decoder.done() && decoder.seek([0x03, 0x00])) {
    decoder.skip(2); // 03 00

    loop += decoder.read();

    const type = decoder.read();

    readTrackerEvent(replay, loop, type, decoder);
  }
}

function readTrackerEvent(replay, loop, type, decoder) {
  const data = decoder.read();

  switch (type) {
    case 0: return readPlayerStatsEvent(loop, data);
    case 1: return readUnitBornEvent(replay, data);
    case 2: return readUnitDiedEvent();
    case 3: return readUnitOwnerChangeEvent();
    case 4: return readUnitTypeChangeEvent();
    case 5: return readUpgradeCompleteEvent(data);
    case 6: return readUnitInitEvent();
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

  console.log("loop:", loop, "player:", player, "minerals:", minerals, "vespene:", vespene, "food:", foodUsed, "/", foodMade);
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
  console.log("ignoring unit died event");
}

function readUnitOwnerChangeEvent() {
  console.log("ignoring unit owner changed event");
}

function readUnitTypeChangeEvent() {
  console.log("ignoring player unit type changed event");
}

function readUpgradeCompleteEvent(data) {
  const player = data["0"];
  const upgrade = data["1"].toString("utf8");

  console.log("player:", player, "upgrade:", upgrade);
}

function readUnitInitEvent() {
  console.log("ignoring unit init event");
}

function readUnitDoneEvent() {
  console.log("ignoring unit done event");
}

function readUnitPositionsEvent() {
  console.log("ignoring unit position event");
}

function readPlayerSetupEvent() {
  // Player setup in AI Arena is always the same
}
