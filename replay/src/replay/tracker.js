import Event from "./event.js";
import Unit from "./unit.js";

export default function readTrackerEvents(replay, decoder) {
  let loop = 0;

  while (decoder.seek((a, b) => (a === 0x03) && ((b === 0x00) || (b === 0x02)), 2)) {
    decoder.skip(2); // 03 00

    loop += decoder.read();

    const type = decoder.read();
    const data = decoder.read();

    readTrackerEvent(replay, loop, type, data);
  }
}

function readTrackerEvent(replay, loop, type, data) {
  switch (type) {
    case 0: return readPlayerStatsEvent(replay, loop, data);
    case 1: return readUnitBornEvent(replay, loop, data);
    case 2: return readUnitDiedEvent();
    case 3: return readUnitOwnerChangeEvent();
    case 4: return readUnitTypeChangeEvent(replay, data);
    case 5: return readUpgradeCompleteEvent(replay, loop, data);
    case 6: return readUnitInitEvent(replay, data);
    case 7: return readUnitDoneEvent(replay, loop, data);
    case 8: return readUnitPositionsEvent();
    case 9: return readPlayerSetupEvent();
  }
}

function readPlayerStatsEvent(replay, loop, data) {
  const player = data["0"];
  const stats = data["1"];
  const minerals = Math.max(stats["0"], 0);
  const vespene = Math.max(stats["1"], 0);
  const foodUsed = Math.max(stats["29"], 0) / 4096.0;
  const foodMade = Math.max(stats["30"], 0) / 4096.0;

  replay.add(new Event(Event.Count, loop, player, "minerals", null, null, Event.Count, minerals));
  replay.add(new Event(Event.Count, loop, player, "vespene", null, null, Event.Count, vespene));
  replay.add(new Event(Event.Count, loop, player, "foodUsed", null, null, Event.Count, foodUsed));
  replay.add(new Event(Event.Count, loop, player, "foodMade", null, null, Event.Count, foodMade));
}

function readUnitBornEvent(replay, loop, data) {
  const owner = data["3"];
  const type = data["2"].toString("utf8");
  const id = data["0"] << 18 | data["1"];
  const x = data["5"] * 4;
  const y = data["6"] * 4;

  if (type.startsWith("Beacon")) return;

  replay.units.set(id, new Unit(owner, type, id, x, y));

  if ((owner === 1) || (owner === 2)) {
    replay.add(new Event(Event.Enter, loop, owner, type, id));
  }
}

function readUnitDiedEvent() {
}

function readUnitOwnerChangeEvent() {
}

function readUnitTypeChangeEvent(replay, data) {
  const id = data["0"] << 18 | data["1"];
  const type = data["2"].toString("utf8");

  replay.unit(id).type = type;
}

function readUpgradeCompleteEvent(replay, loop, data) {
  const player = data["0"];
  const upgrade = data["1"].toString("utf8");

  if (upgrade === "SprayProtoss") return;
  if (upgrade === "SprayTerran") return;
  if (upgrade === "SprayZerg") return;

  replay.add(new Event(Event.Enter, loop, player, upgrade));
}

function readUnitInitEvent(replay, data) {
  const owner = data["3"];
  const type = data["2"].toString("utf8");
  const id = data["0"] << 18 | data["1"];
  const x = data["5"];
  const y = data["6"];

  replay.units.set(id, new Unit(owner, type, id, x, y));
}

function readUnitDoneEvent(replay, loop, data) {
  const id = data["0"] << 18 | data["1"];
  const unit = replay.unit(id);

  replay.add(new Event(Event.Enter, loop, unit.owner, unit));
}

function readUnitPositionsEvent() {
}

function readPlayerSetupEvent() {
  // Player setup in AI Arena is always the same
}
