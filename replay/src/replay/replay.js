import Event from "./event.js";
import MpqFile from "./mpq/MpqFile.js";
import readGameEvents from "./game.js";
import readTrackerEvents from "./tracker.js";

export default class Replay {

  events = [];
  units = new Map();
  warnings = new Set();

  async parse(mpq) {
    const collector = new EventCollector(this);

    try {
      readTrackerEvents(collector.source(), this, mpq.read("replay.tracker.events"));

      try {
        // Read the file first so that in case of error the source is not added to the collector
        const events = mpq.read("replay.game.events");
        const source = collector.source();

        readGameEvents(source, this, events);
      } catch (error) {
        this.warnings.add("Unable to read some of the game events!");
        console.log("Error when reading game events file:", error.message);
      }

      await collector.collect();

      if (collector.bases && collector.bases.player1 && collector.bases.player2) {
        this.side = (collector.bases.player1.x < collector.bases.player2.x) ? 1 : 2;
      } else {
        this.side = 0;
      }
    } finally {
      collector.close();
    }
  }

  unit(tag) {
    return this.units.get(tag);
  }

  warning(log) {
    this.warnings.add(log);
  }

  static async load(file) {
    const replay = new Replay();
    const mpq = await MpqFile.load(file);

    await replay.parse(mpq);

    return replay;
  }

}

class EventCollector {

  bases = { player1: null, player2: null };
  sources = new Map();
  tick = new Map();

  constructor(replay) {
    this.replay = replay;
  }

  source() {
    const sources = this.sources;
    const index = this.sources.size;
    const tick = this.tick;
    const input = async function(event) {
      if (!event) return;
      if (event === Event.MutedEvent) return;
      if (event === Event.UnknownEvent) return;

      const source = this;

      if (!sources.has(source)) return;
      if (tick.has(source)) {
        console.log("Ooops! Source", source, "is overwriting events!");
      }

      if (event === Event.EndEvent) {
        sources.delete(source);
        tick.delete(source);
        return;
      }

      event.source = source;
      tick.set(source, event);

      return new Promise(async function(resolve) {
        while (tick.has(source)) {
          await queue();
        }

        resolve();
      });
    }.bind(index);

    sources.set(index, input);

    return input;
  }

  async collect() {
    while (this.sources.size) {
      // Wait for sources to push events
      await queue();

      // Check if all sources pushed an event
      if (this.tick.size && (this.tick.size >= this.sources.size)) {
        const events = [...this.tick.values()].sort((a, b) => (a.loop - b.loop));
        const event = events[0];

        event.resolve(this.replay);

        if (!this.bases.player1 && (event.type === Event.Enter) && (event.pid === 1)) this.bases.player1 = this.replay.unit(event.sid);
        if (!this.bases.player2 && (event.type === Event.Enter) && (event.pid === 2)) this.bases.player2 = this.replay.unit(event.sid);

        this.replay.events.push(event);
        this.tick.delete(event.source);
      }
    }

    this.replay.events.sort((a, b) => (a.loop - b.loop));
  }

  close() {
    this.sources.clear();
    this.tick.clear();
  }
}

async function queue() {
  await new Promise(function(resolve) { resolve(); });
}
