import Replay from "./replay/replay.js";

const replay = new Replay("./test.SC2Replay");

console.log(replay.events.map(a => a.toString()).join("\r\n"));
console.log("player 1:", [...replay.units.values()].filter(unit => (unit.owner === 1)).map(unit => unit.type + " " + unit.id).join());
console.log("player 2:", [...replay.units.values()].filter(unit => (unit.owner === 2)).map(unit => unit.type + " " + unit.id).join());
