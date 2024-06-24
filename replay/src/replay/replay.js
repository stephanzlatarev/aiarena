import MpqFile from "./mpq/MpqFile.js";
import readGameEvents from "./game.js";
import readTrackerEvents from "./tracker.js";

export default class Replay {

  units = new Map();

  constructor(file) {
    const mpq = new MpqFile(file);

    for (const entry of mpq.entries.values()) {
      console.log("-", entry.fileSize, "\t", entry.filename);
    }

    readTrackerEvents(this, mpq.read("replay.tracker.events"));
    readGameEvents(this, mpq.read("replay.game.events"));
  }

}
