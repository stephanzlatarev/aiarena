import MpqFile from "./mpq/MpqFile.js";
import readGameEvents from "./game.js";
import readTrackerEvents from "./tracker.js";

export default class Replay {

  units = new Map();

  constructor(file) {
    const mpq = new MpqFile(file);

    readTrackerEvents(this, mpq.read("replay.tracker.events"));
    readGameEvents(this, mpq.read("replay.game.events"));
  }

}
