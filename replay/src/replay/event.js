
export default class Event {

  static Stats = 1;
  static Build = 2;
  static Research = 3;
  static UpgradeComplete = 4;

  constructor(data) {
    this.data = data;
  }

  toString() {
    return clock(this.data.loop) + " " + JSON.stringify(this.data);
  }
}

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;

function clock(loop) {
  const minutes = Math.floor(loop / LOOPS_PER_MINUTE);
  const seconds = Math.floor(loop / LOOPS_PER_SECOND) % 60;
  const mm = (minutes >= 10) ? minutes : "0" + minutes;
  const ss = (seconds >= 10) ? seconds : "0" + seconds;

  return `${mm}:${ss}/${loop}`;
}
