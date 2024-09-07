import map from "../src/map/Equilibrium513AIE.js";
import Replay from "../src/replay/replay.js";

const file = "./test/test.SC2Replay";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;
const LOOPS_4_MINUTES = LOOPS_PER_MINUTE * 4;

function clock(loop) {
  const minutes = Math.floor(loop / LOOPS_PER_MINUTE);
  const seconds = Math.floor(loop / LOOPS_PER_SECOND) % 60;
  const mm = (minutes >= 10) ? minutes : "0" + minutes;
  const ss = (seconds >= 10) ? seconds : "0" + seconds;

  return `${mm}:${ss}/${loop}`;
}

const SECTOR_COLS = ["A", "B", "C", "D", "E", "F", "G", "H"];
function sector(event) {
  if (!event.x || !event.y) return;

  const col = grid((event.x - map.left) / map.width);
  const row = grid((event.y - map.top) / map.height);

  return SECTOR_COLS[col] + (row + 1);
}

function grid(p) {
  if (p < 0) return 0;
  if (p > 1) return 7;
  return Math.floor(8 * p);
}

async function go() {
  try {
    const replay = await Replay.load(file);

    console.log("=== PLAYER 1 ===");
    for (const event of replay.events) {
      if (event.loop > LOOPS_4_MINUTES) break;
      if (!event.loop) continue;
      if (event.type !== "enter") continue;

      if (event.pid === 1) console.log(clock(event.t), "\t", sector(event), "\t", event.stype);
    }

    console.log();
    console.log("=== PLAYER 2 ===");
    for (const event of replay.events) {
      if (event.loop > LOOPS_4_MINUTES) break;
      if (!event.loop) continue;
      if (event.type !== "enter") continue;

      if (event.pid === 2) console.log(clock(event.t), "\t", sector(event), "\t", event.stype, event.t ? "" : event);
    }
  } catch (error) {
    console.log(error);
  }
}

go();
