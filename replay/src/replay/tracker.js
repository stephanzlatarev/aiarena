import Event from "./event.js";
import Unit from "./unit.js";

export default async function readTrackerEvents(events, replay, decoder) {
  try {
    let loop = 0;

    while (decoder.seek((a, b) => (a === 0x03) && ((b === 0x00) || (b === 0x02)), 2)) {
      decoder.skip(2); // 03 00

      loop += decoder.read();

      const type = decoder.read();
      const data = decoder.read();

      await readTrackerEvent(events, replay, loop, type, data);
    }
  } finally {
    await events(Event.EndEvent);
  }
}

async function readTrackerEvent(events, replay, loop, type, data) {
  switch (type) {
    case 0: return await readPlayerStatsEvent(events, loop, data);
    case 1: return await readUnitBornEvent(events, replay, loop, data);
    case 2: return readUnitDiedEvent();
    case 3: return readUnitOwnerChangeEvent();
    case 4: return await readUnitTypeChangeEvent(events, replay, loop, data);
    case 5: return await readUpgradeCompleteEvent(events, loop, data);
    case 6: return readUnitInitEvent(replay, data);
    case 7: return await readUnitDoneEvent(events, loop, data);
    case 8: return readUnitPositionsEvent();
    case 9: return readPlayerSetupEvent();
  }
}

async function readPlayerStatsEvent(events, loop, data) {
  const player = data["0"];
  const stats = data["1"];
  const minerals = Math.max(stats["0"], 0);
  const vespene = Math.max(stats["1"], 0);
  const foodUsed = Math.max(stats["29"], 0) / 4096.0;
  const foodMade = Math.max(stats["30"], 0) / 4096.0;

  await events(new Event(Event.Count, loop, player, "minerals", minerals));
  await events(new Event(Event.Count, loop, player, "vespene", vespene));
  await events(new Event(Event.Count, loop, player, "foodUsed", foodUsed));
  await events(new Event(Event.Count, loop, player, "foodMade", foodMade));
}

async function readUnitBornEvent(events, replay, loop, data) {
  const owner = data["3"];
  const type = data["2"].toString("utf8");
  const unitTag = data["0"] << 18 | data["1"];
  const x = data["5"] * 4;
  const y = data["6"] * 4;

  if (type.startsWith("Beacon")) return;

  replay.units.set(unitTag, new Unit(owner, type, unitTag, x, y));

  if ((owner === 1) || (owner === 2)) {
    await events(new Event(Event.Enter, loop, owner, unitTag));
  }
}

function readUnitDiedEvent() {
}

function readUnitOwnerChangeEvent() {
}

async function readUnitTypeChangeEvent(events, replay, loop, data) {
  const unitTag = data["0"] << 18 | data["1"];
  const type = data["2"].toString("utf8");
  const unit = replay.unit(unitTag);

  if (unit) {
    unit.type = type;

    await events(new Event(Event.Morph, loop, unit.owner, unitTag));
  }
}

async function readUpgradeCompleteEvent(events, loop, data) {
  const player = data["0"];
  const upgrade = data["1"].toString("utf8");

  if (upgrade === "SprayProtoss") return;
  if (upgrade === "SprayTerran") return;
  if (upgrade === "SprayZerg") return;

  await events(new Event(Event.Enter, loop, player, upgrade));
}

function readUnitInitEvent(replay, data) {
  const owner = data["3"];
  const type = data["2"].toString("utf8");
  const id = data["0"] << 18 | data["1"];
  const x = data["5"];
  const y = data["6"];

  replay.units.set(id, new Unit(owner, type, id, x, y));
}

async function readUnitDoneEvent(events, loop, data) {
  const unitTag = data["0"] << 18 | data["1"];

  await events(new Event(Event.Enter, loop, null, unitTag));
}

function readUnitPositionsEvent() {
}

function readPlayerSetupEvent() {
  // Player setup in AI Arena is always the same
}
