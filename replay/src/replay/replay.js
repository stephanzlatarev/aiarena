import MpqFile from "./mpq/MpqFile.js";
import readGameEvents from "./game.js";
import readTrackerEvents from "./tracker.js";

export default class Replay {

  events = [];
  units = new Map();

  constructor(file) {
    const mpq = new MpqFile(file);

    readTrackerEvents(this, mpq.read("replay.tracker.events"));
    readGameEvents(this, mpq.read("replay.game.events"));

    this.events.sort((a, b) => (a.loop - b.loop));
  }

  add(event) {
    if (event) {
      this.events.push(event);
    }
  }

}
