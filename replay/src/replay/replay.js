import Event from "./event.js";
import MpqFile from "./mpq/MpqFile.js";
import readGameEvents from "./game.js";
import readTrackerEvents from "./tracker.js";

export default class Replay {

  events = [];
  units = new Map();
  warnings = new Set();

  constructor(mpq) {
    readTrackerEvents(this, mpq.read("replay.tracker.events"));
    readGameEvents(this, mpq.read("replay.game.events"));

    this.events.sort((a, b) => (a.loop - b.loop));
  }

  add(event) {
    if (event && (event !== Event.MutedEvent)) {
      this.events.push(event);
    }
  }

  unit(tag) {
    const unit = this.units.get(tag);
    return unit ? unit : { id: "Unknown", type: "Unknown" };
  }

  warning(log) {
    this.warnings.add(log);
  }

  static async load(file) {
    return new Replay(await MpqFile.load(file));
  }

}
