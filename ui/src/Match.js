import * as React from "react";
import { useAsyncValue } from "react-router-dom";
import Link from "@mui/material/Link";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;
const MILITARY_COEFFICIENT = 100 / 16000;
const ECONOMY_COEFFICIENT = 100 / 100;
const WARRIORS = MILITARY_COEFFICIENT / 100;
const WORKERS = ECONOMY_COEFFICIENT / 100;

export default function Match({ bot }) {
  const match = useAsyncValue();
  const playerMap = createPlayerMap(bot, match);
  const ref = React.useRef(null);
  const [width, setWidth] = React.useState({ width: 0, height: 0 });
  const infos = [];
  const elements = [];

  React.useEffect(() => setWidth(ref.current ? ref.current.offsetWidth : 0), [ref.current]);

  infos.push(<BotInfo key="player1-info" info={ { ...match.player1.ranking, ...match.overview.players[1] } } winner={ match.winner } reverse={ !playerMap.reverse } />);
  infos.push(<BotInfo key="player2-info" info={ { ...match.player2.ranking, ...match.overview.players[2] } } winner={ match.winner } reverse={ playerMap.reverse } />);
  if (playerMap.reverse) infos.reverse();

  if (width > 0) {
    elements.push(<h3 key="heading-timeline">Timeline</h3>);
    elements.push(<Timeline key="timeline" match={ match } playerMap={ playerMap } width={ width } />);
  }

  return (
    <div ref={ ref } width="100%">
      <div style={{ width: "100%", textAlign: "center", padding: "5px" }}>
        Match: { match.match } &nbsp;
        Time: { new Date(match.time).toLocaleString() } &nbsp;
        Map: { match.map } &nbsp;
        <Link href={ "https://aiarena.net/matches/" + match.match } target="_blank" rel="noopener">Download replay</Link>
      </div>

      <div width="100%">
        { infos }
      </div>

      { elements }
    </div>
  );
}

function BotInfo({ info, winner, reverse }) {
  const infos = [];
  let resultColor;
  let resultText;

  if (info.bot === winner) {
    resultText = "WIN";
    resultColor = "#00AA00";
  } else if (!winner) {
    resultText = "TIE";
    resultColor = "black";
  } else {
    resultText = "LOSS";
    resultColor = "#AA0000";
  }
  infos.push(
    <div key="1" style={{ display: "inline-block", verticalAlign: "top", width: "50%", padding: "1rem" }}>
      <div style={{ textAlign: "center" }}><img src={ "/" + info.race + ".png" } width="17" style={{ position: "relative", top: "2px", marginRight: "5px" }} /> { info.bot }</div>
      <div style={{ color: resultColor, fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>{ resultText }</div>
      Military: <Rating capacity={ info.militaryCapacity } performance={ info.militaryPerformance } /> <br />
      Economy: <Rating capacity={ info.economyCapacity } performance={ info.economyPerformance } /> <br />
      Best army: { info.armyBuild.join(" ") }
    </div>
  );

  infos.push(
    <div key="2" style={{ display: "inline-block", verticalAlign: "top", width: "50%", padding: "1rem" }}>
      Elo: { info.elo } <br />
      Last update: { new Date(info.lastUpdate).toLocaleString() } <br />
    </div>
  );

  if (reverse) infos.reverse();

  return (
    <div style={{ display: "inline-block", verticalAlign: "top", width: "50%", padding: "1rem" }}>
      { infos }
    </div>
  );
}

function Timeline({ match, playerMap, width }) {
  let key = 1;

  const grid = [];
  const divs = { left: [], center: [], right: [] };
  const lines = [
    // Military
    { key: key++, player: 1, resource: "activeForces", coef: WARRIORS * playerMap.side1, path: [], style: { fill: "none", stroke: "red", strokeWidth: 2 } },
    { key: key++, player: 1, resource: "activeForces", coef: WARRIORS * playerMap.side2, path: [], style: { fill: "none", stroke: "red", strokeWidth: 1, strokeDasharray: "5,5" } },
    { key: key++, player: 2, resource: "activeForces", coef: WARRIORS * playerMap.side2, path: [], style: { fill: "none", stroke: "red", strokeWidth: 2 } },
    { key: key++, player: 2, resource: "activeForces", coef: WARRIORS * playerMap.side1, path: [], style: { fill: "none", stroke: "red", strokeWidth: 1, strokeDasharray: "5,5" } },

    // Economy
    { key: key++, player: 1, resource: "activeWorkers", coef: WORKERS * playerMap.side1, path: [], style: { fill: "none", stroke: "green", strokeWidth: 2 } },
    { key: key++, player: 1, resource: "activeWorkers", coef: WORKERS * playerMap.side2, path: [], style: { fill: "none", stroke: "green", strokeWidth: 1, strokeDasharray: "5,5" } },
    { key: key++, player: 2, resource: "activeWorkers", coef: WORKERS * playerMap.side2, path: [], style: { fill: "none", stroke: "green", strokeWidth: 2 } },
    { key: key++, player: 2, resource: "activeWorkers", coef: WORKERS * playerMap.side1, path: [], style: { fill: "none", stroke: "green", strokeWidth: 1, strokeDasharray: "5,5" } },
  ];

  const midx = width / 2;
  let height = 0;
  let minute = 0;
  let pathop = "M";

  for (const event of match.timeline) {
    if (event.type === "stats") {
      for (const line of lines) {
        const x = midx + event.players[line.player].resources[line.resource] * line.coef * midx;
        line.path.push(`${pathop}${x},${height}`);
      }

      if (event.loop > minute) {
        grid.push(<line key={ key++ } x1="0" y1={ height } x2={ width } y2={ height } style={{ stroke: "lightGray", strokeWidth: 1 }} />);
        divs.center.push(<div top={ height }>{ clock(minute) }</div>);
        minute += 1344;
      }

      pathop = "L";
      height += 4;
    }

    if (event.type === "fight") {
      const leftPlayer = playerMap[1];
      const rightPlayer = playerMap[2];
      const color = (event.players[1].kill > event.players[2].kill) ? playerMap.color1 : playerMap.color2;

      divs.center.push(
        <div top={ height } style={{ color: color, fontSize: "3rem" }}>
          &#9876;
        </div>
      );

      const leftPlayerScore = score(event, leftPlayer);
      divs.left.push(
        <div top={ height }>
          Army: <Army army={ event.players[leftPlayer].army } /> <br />
          Military score: <Rating capacity={ leftPlayerScore.capacity } performance={ leftPlayerScore.performance } /> <br />
          Losses: <Army army={ event.players[leftPlayer].losses } />
        </div>
      );

      const rightPlayerScore = score(event, rightPlayer);
      divs.right.push(
        <div top={ height }>
          Army: <Army army={ event.players[rightPlayer].army } /> <br />
          Military score: <Rating capacity={ rightPlayerScore.capacity } performance={ rightPlayerScore.performance } /> <br />
          Losses: <Army army={ event.players[rightPlayer].losses } />
        </div>
      );

      pathop = "M";
      height += 80;
    }
  }

  return (
    <div width="100%" style={{ position: "relative" }}>
      { divs.left.map(div => (<div key={ key++ } style={{ position: "absolute", top: div.props.top, left: 0, width: "40%", display: "flex", justifyContent: "right", marginRight: "60%" }}>{ div }</div>)) }
      { divs.center.map(div => (<div key={ key++ } style={{ position: "absolute", top: div.props.top, left: 0, width: "100%", display: "flex", justifyContent: "center" }}>{ div }</div>)) }
      { divs.right.map(div => (<div key={ key++ } style={{ position: "absolute", top: div.props.top, left: 0, width: "40%", display: "flex", justifyContent: "left", marginLeft: "60%" }}>{ div }</div>)) }

      <svg width={ width } height={ height } xmlns="http://www.w3.org/2000/svg">
        <line x1={ midx } y1="0" x2={ midx } y2={ height } style={{ stroke: "lightGray", strokeWidth: 3 }} />
        { grid }
        { lines.map(line => (<path key={ line.key } d={ line.path.join(" ") } style={ line.style } />)) }
      </svg>
    </div>
  );
}

function Rating({ capacity, performance }) {
  capacity = (capacity > 0) ? Math.min(capacity, 100) : 0;
  performance = (performance > 0) ? Math.min(performance, 100) : 0;

  const dcolor = (performance > capacity) ? "#55D66C" : "#D6556C";

  return (
    <svg width="133" height="10" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="5" x2="100" y2="5"  style={{ stroke: "#CCCCDD", strokeWidth: 10, strokeDasharray: "9,1" }} />
      <line x1="0" y1="5" x2={ Math.max(capacity, performance) } y2="5"  style={{ stroke: dcolor, strokeWidth: 10, strokeDasharray: "9,1" }} />
      <line x1="0" y1="5" x2={ Math.min(capacity, performance) } y2="5"  style={{ stroke: "#556CD6", strokeWidth: 10, strokeDasharray: "9,1" }} />
      <text x="100" y="8" fill="black" fontSize="10">({performance.toFixed(1)})</text>
    </svg>
  );
}

function Army({ army }) {
  const types = Object.keys(army).sort((a, b) => (army[b] - army[a]));
  return types.map(type => army[type] + " " + type).join(", ");
}

function createPlayerMap(bot, match) {
  if (bot === match.player1.bot) {
    return { 1: 1, 2: 2, side1: -1, side2: +1, color1: "#00AA00", color2: "#AA0000", reverse: false };
  } else {
    return { 1: 2, 2: 1, side1: +1, side2: -1, color1: "#AA00", color2: "#00AA00", reverse: true };
  }
}

function clock(loop) {
  const minutes = Math.floor(loop / LOOPS_PER_MINUTE);
  const seconds = Math.floor(loop / LOOPS_PER_SECOND) % 60;
  const mm = (minutes >= 10) ? minutes : "0" + minutes;
  const ss = (seconds >= 10) ? seconds : "0" + seconds;

  return `${mm}:${ss}`;
}

function score(fight, player) {
  const playerArmyValue = fight.players[player].value;
  const playerKillValue = fight.players[player].kill;
  const opponentArmyValue = fight.players[3 - player].value;
  const opponentKillValue = fight.players[3 - player].kill;
  const capacity = Math.floor(MILITARY_COEFFICIENT * playerArmyValue);
  const performance = Math.min(Math.floor(capacity * opponentArmyValue * playerKillValue / playerArmyValue / opponentKillValue), 100);

  return { capacity, performance };
}
