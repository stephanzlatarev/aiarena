import Unit from "./unit.js";

export default function readTrackerEvents(replay, decoder) {
  while (!decoder.done() && decoder.seek([0x03, 0x00])) {
    decoder.skip(2); // 03 00

    const frames = decoder.read();
    const type = decoder.read();
    const data = decoder.read();

    if (type === 1) {
      handleUnitBornEvent(replay, data);
    } else if (type === 9) {
      console.log(getPlayerSetupEvent(data));
    }
  }
}

function getPlayerSetupEvent(data) {
  const TYPE = ["", "human", "cpu", "neutral", "hostile"];

  return {
    playerId: data["0"],
    playerType: TYPE[data["1"]],
    userId: data["2"],
    slotId: data["3"],
  };
}

function handleUnitBornEvent(replay, data) {
  const owner = data["3"];
  const type = data["2"].toString("utf8");
  const id = data["0"] << 18 | data["1"];
  const x = data["5"] * 4;
  const y = data["6"] * 4;

  replay.units.set(id, new Unit(owner, type, id, x, y));
}
