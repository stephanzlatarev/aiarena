import Replay from "../src/replay/replay.js";
import timeline from "../src/timeline/timeline.js";
import overview from "../src/timeline/overview.js";

const file = "./test/test.SC2Replay";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;

function clock(loop) {
  const minutes = Math.floor(loop / LOOPS_PER_MINUTE);
  const seconds = Math.floor(loop / LOOPS_PER_SECOND) % 60;
  const mm = (minutes >= 10) ? minutes : "0" + minutes;
  const ss = (seconds >= 10) ? seconds : "0" + seconds;

  return `${mm}:${ss}/${loop}`;
}

function three(value) {
  if (value < 10)  return "  " + value;
  if (value < 100) return " " + value;
  return "" + value;
}

function five(value) {
  if (value < 10)    return "    " + value;
  if (value < 100)   return "   " + value;
  if (value < 1000)  return "  " + value;
  if (value < 10000) return " " + value;
  return "" + value;
}

function show(point) {
  if (point.type === "fight") {
    console.log(JSON.stringify(point, null, 2));
  } else {
    let food = { '1': 0, '2': 0 };
    let workers = { '1': 0, '2': 0 };
    let army = { '1': 0, '2': 0 };
    let kill = { '1': 0, '2': 0 };
    let losses = 0;

    for (const one in point.players) {
      const player = point.players[one];

      food[one] = player.resources.foodUsed;
      workers[one] = player.resources.activeWorkers;
      army[one] = player.resources.activeForces;
      kill[one] = player.resources.valueKilled;
  
      for (const loss in player.losses) {
        losses += player.losses[loss];
      }
    }
  
    const dots = [];
    for (let i = 0; i < losses; i++) dots.push("@");
    console.log(
      clock(point.loop), "\t",
      "food:", three(food['1']), three(food['2']), "\t",
      "workers:", three(workers['1']), three(workers['2']), "\t",
      "army:", five(army['1']), five(army['2']), "\t",
      "kill:", five(kill['1']), five(kill['2']), "\t",
      dots.join("")
    );
  }
}

async function go() {
  try {
    const replay = await Replay.load(file);
    const points = timeline(replay);

    for (const point of points) {
      show(point);
    }

    console.log("overview:", JSON.stringify(overview(replay, points), null, 2));
  } catch (error) {
    console.log(error);
  }
}

go();
