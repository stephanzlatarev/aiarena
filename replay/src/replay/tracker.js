import Unit from "./unit.js";

export default function readTrackerEvents(replay, decoder) {
  const bytes = [];

  decoder.readBits(8 * 2); // 03 00

  // TODO: Seek to next 03 00 sequence

  while (!decoder.done()) {
    const frames = decoder.read();
    const type = decoder.read();
    const data = decoder.read();

    if (type === 1) {
      handleUnitBornEvent(replay, data);
    } else if (type === 9) {
      console.log(getPlayerSetupEvent(data));
    }

    while (!decoder.done()) {
      bytes.push(decoder.readBits(8));

      if (bytes.slice(bytes.length - 2).join(" ") === "3 0") {
        bytes.length = 0;
        break;
      }
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
