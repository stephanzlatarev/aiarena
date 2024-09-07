import { UnitIcon } from "./Army";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;

export default function BuildOrderDecisions({ bot, buildorder }) {
  processDecision(buildorder);

  console.log(buildorder);

  return (
    <div style={{ margin: "2rem" }}>
      <p>
        This tab is under construction! It shows partial data.
      </p>
      <Decision decision={ buildorder } />
    </div>
  );
}

function processDecision(decision) {
  const totalMatchCount = decision.win + decision.tie + decision.loss;

  if (!decision.matchRate) decision.matchRate = 100;

  for (const one of decision.decisions) {
    const alternativeMatchCount = one.win + one.tie + one.loss;

    one.matchRate = (100 * alternativeMatchCount / totalMatchCount);
  }

  decision.decisions.sort((a, b) => (b.matchRate - a.matchRate));
}

function Decision({ decision }) {
  let key = 0;

  return (
    <div>
      { decision.map ? (<span>on { decision.map } </span>) : null }
      { decision.opponent ? (<span>vs { decision.opponent } </span>) : null }

      { decision.actions.filter(actionFilter).map(action => (<Action key={ key++ } action={ action } />)) }

      <Alternatives decision={ decision } />

      {
        decision.decisions.length
        ? <Decision decision={ decision.decisions[0] } />
        : null
      }
    </div>
  );
}

function actionFilter(action) {
  if (!action.after) return false;
  if (action.build === "Larva") return false;
  return true;
}

function Action({ action }) {
  return (
    <div style={{ marginRight: "1rem", display: "flex", alignItems: "center" }}>
      { clock(action.after) } &nbsp; <UnitIcon unit={ action.build } />
    </div>
  );
}

function Alternatives({ decision }) {
  const alternatives = [];
  for (const one of decision.decisions) {
    alternatives.push(
      <div>
        Matches: { one.matchRate }%
      </div>
    );
  }

  return (
    <div>
      { alternatives }
    </div>
  );
}

function clock(loop) {
  if (loop >= 0) {
    const minutes = Math.floor(loop / LOOPS_PER_MINUTE);
    const seconds = Math.floor(loop / LOOPS_PER_SECOND) % 60;
    const mm = (minutes >= 10) ? minutes : "0" + minutes;
    const ss = (seconds >= 10) ? seconds : "0" + seconds;

    return `${mm}:${ss}`;
  }

  return "Unknown";
}
