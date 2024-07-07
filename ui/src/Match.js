import * as React from "react";
import { useAsyncValue } from "react-router-dom";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Army from "./Army";
import MatchCell from "./MatchCell";
import Rating from "./Rating";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;
const MILITARY_COEFFICIENT = 100 / 16000;
const ECONOMY_COEFFICIENT = 100 / 100;
const WARRIORS = MILITARY_COEFFICIENT / 100;
const WORKERS = ECONOMY_COEFFICIENT / 100;

const MAP_SIZE = {
  Equilibrium513AIE: [172, 116],
  GoldenAura513AIE: [140, 140],
  Gresvan513AIE: [160, 116],
  HardLead513AIE: [132, 132],
  Oceanborn513AIE: [140, 132],
  SiteDelta513AIE: [136, 148],
};

const IMG_SIZE = {
  Equilibrium513AIE: [800, 540],
  GoldenAura513AIE: [600, 600],
  Gresvan513AIE: [800, 580],
  HardLead513AIE: [600, 600],
  Oceanborn513AIE: [636, 600],
  SiteDelta513AIE: [551, 599],
};

export default function Match({ bot }) {
  const match = useAsyncValue();
  const playerMap = createPlayerMap(bot, match);
  const ref = React.useRef(null);
  const [width, setWidth] = React.useState({ width: 0, height: 0 });
  const infos = [];
  const elements = [];

  React.useEffect(() => setWidth(ref.current ? ref.current.offsetWidth : 0), [ref.current]);

  if (match.overview) {
    infos.push(<BotInfo key="player1-info" info={ { ...match.player1.ranking, ...match.overview.players[1] } } winner={ match.winner } reverse={ !playerMap.reverse } />);
    infos.push(<BotInfo key="player2-info" info={ { ...match.player2.ranking, ...match.overview.players[2] } } winner={ match.winner } reverse={ playerMap.reverse } />);
    if (playerMap.reverse) infos.reverse();
  }

  if (match.timeline && (width > 0)) {
    elements.push(<h3 key="heading-timeline">Timeline (military in red, economy in green)</h3>);
    elements.push(<Timeline key="timeline" match={ match } playerMap={ playerMap } width={ width } />);
  }

  return (
    <div ref={ ref } width="100%">
      <div style={{ width: "100%", textAlign: "center", padding: "5px" }}>
        Round: { match.round } &nbsp;
        Match: { match.match } &nbsp;
        Time: { new Date(match.time).toLocaleString() } &nbsp;
        Map: { match.map } &nbsp;
        Duration: { clock(match.duration) } &nbsp;
        <Link href={ "https://aiarena.net/matches/" + match.match } target="_blank" rel="noopener">Download replay</Link> &nbsp;
        { match.warnings.join(" ") } &nbsp;
      </div>

      <div width="100%">
        { infos }
      </div>

      <h3 key="heading-timeline">History by round (wins in green, losses in red)</h3>
      <History bot={ bot } match={ match } />

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
      Technology: <Rating capacity={ info.technologyCapacity } performance={ info.technologyPerformance } />
      <Army army={ info.armyBuild } />
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

function History({ bot, match }) {
  const rounds = new Map();
  const rows = [];
  let round = 1;
  let count = 0;
  let key = 1;

  for (const one of match.history) {
    rounds.set(one.round, one);
  }

  while (count < match.history.length) {
    const cells = [];

    for (let c = 0; c < 50; c++, round++) {
      if (rounds.has(round)) count++;

      cells.push(
        <TableCell key={ key++ }>
          <MatchCell  bot={ bot } match={ rounds.get(round) } text={ round } />
        </TableCell>
      );
    }

    rows.push(<TableRow key={ key++ }>{ cells }</TableRow>);
  }

  return (
    <TableContainer component={ Paper }>
      <Table>
        <TableBody>
          { rows }
        </TableBody>
      </Table>
    </TableContainer>
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
  const midmargin = 100;
  const lanewidth = midx - midmargin;
  let height = 0;
  let minute = 0;
  let pathop = "M";

  for (const event of match.timeline) {
    if (event.type === "stats") {
      for (const line of lines) {
        const value = event.players[line.player].resources[line.resource];

        if (value >= 0) {
          const x = midx + value * line.coef * lanewidth + midmargin * Math.sign(line.coef);
          line.path.push(`${pathop}${x},${height}`);
        }
      }

      if (event.loop > minute) {
        grid.push(<line key={ key++ } x1="0" y1={ height } x2={ width } y2={ height } style={{ stroke: "lightGray", strokeWidth: 1 }} />);
        divs.center.push(<div top={ height }>{ clock(minute) }</div>);
        minute += 1344;
      }

      pathop = "L";
      height += 4;
    }

    //TODO: Support for version 3 and 4
    const isVersion4 = !!event.players[1].rating;
    if ((event.type === "fight") && (!isVersion4 || event.loss)) {
      if (isVersion4) {
        const leftPlayer = playerMap[1];
        const rightPlayer = playerMap[2];

        if (MAP_SIZE[match.map]) {
          divs.center.push(MapCard(height, match.map, event.players[leftPlayer], event.players[rightPlayer]));
        }
        divs.left.push(CombatCard(height, event.players[leftPlayer], score(event, leftPlayer)));
        divs.right.push(CombatCard(height, event.players[rightPlayer], score(event, rightPlayer)));

        pathop = "L";
        height += 100;
        
      } else {
        const leftPlayer = playerMap[1];
        const rightPlayer = playerMap[2];
        const color = (event.players[1].kill > event.players[2].kill) ? playerMap.color1 : playerMap.color2;

        height += 16;

        divs.center.push(
          <div top={ height } style={{ color: color, fontSize: "3rem", backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
            &#9876;
          </div>
        );
        divs.left.push(CombatCard(height, event.players[leftPlayer], score(event, leftPlayer)));
        divs.right.push(CombatCard(height, event.players[rightPlayer], score(event, rightPlayer)));

        pathop = "L";
        height += 80;
      }
    }
  }

  const leftSideStyle = { position: "absolute", left: 0, width: "34%", display: "flex", justifyContent: "right", marginRight: "66%" };
  const centerSideStyle = { position: "absolute", left: 0, width: "150px", display: "flex", justifyContent: "center", marginLeft: "calc(50% - 75px)", marginRight: "calc(50% - 75px)" };
  const rightSideStyle = { position: "absolute", left: 0, width: "34%", display: "flex", justifyContent: "left", marginLeft: "66%" };

  return (
    <div width="100%" style={{ position: "relative" }}>
      { divs.left.map(div => (<div key={ key++ } style={{ ...leftSideStyle, top: div.props.top }}>{ div }</div>)) }
      { divs.center.map(div => (<div key={ key++ } style={{ ...centerSideStyle, top: div.props.top }}>{ div }</div>)) }
      { divs.right.map(div => (<div key={ key++ } style={{ ...rightSideStyle, top: div.props.top }}>{ div }</div>)) }

      <svg width={ width } height={ height } xmlns="http://www.w3.org/2000/svg">
        <line x1={ midx - midmargin } y1="0" x2={ midx - midmargin } y2={ height } style={{ stroke: "lightGray", strokeWidth: 3 }} />
        <line x1={ midx + midmargin } y1="0" x2={ midx + midmargin } y2={ height } style={{ stroke: "lightGray", strokeWidth: 3 }} />
        { grid }
        { lines.map(line => (<path key={ line.key } d={ line.path.join(" ") } style={ line.style } />)) }
      </svg>
    </div>
  );
}

function getMapSvgX(code, scale) {
  return Math.floor(code * scale / 1000);
}

function getMapSvgY(code, scale) {
  return Math.floor((code % 1000) * scale);
}

function MapCard(top, map, leftPlayer, rightPlayer) {
  const [mapWidth, mapHeight] = MAP_SIZE[map];
  const [jpgWidth, jpgHeight] = IMG_SIZE[map];

  const svgHeight = 100;
  const svgWidth = Math.floor(jpgWidth * svgHeight / jpgHeight);

  const points = [];
  const scaleX = jpgWidth / mapWidth;
  const scaleY = jpgHeight / mapHeight;
  let key = 1;

  const spots = new Set();
  const spotRadius = 12 * scaleX;
  for (const zone of leftPlayer.zones) if (zone) spots.add(zone);
  for (const zone of rightPlayer.zones) if (zone) spots.add(zone);
  for (const spot of spots) {
    points.push(
      <circle key={ key++ } r={ spotRadius } cx={ getMapSvgX(spot, scaleX) } cy={ getMapSvgY(spot, scaleY) } fill="rgba(255, 255, 255, 0.5)" />
    );
  }

  const baseHalfWidth = 5 * scaleX;
  const baseHalfHeight = 5 * scaleY;
  const leftBaseStyle = { fill: "#00AA00", strokeWidth: scaleX, stroke: "white" };
  for (const base of leftPlayer.bases) {
    points.push(
      <rect key={ key++ } style={ leftBaseStyle }
        x={ getMapSvgX(base, scaleX) - baseHalfWidth } y={ getMapSvgY(base, scaleY) - baseHalfHeight }
        width={ baseHalfWidth + baseHalfWidth } height={ baseHalfHeight + baseHalfHeight }
      />
    );
  }

  const rightBaseStyle = { fill: "#AA0000", strokeWidth: scaleX, stroke: "white" };
  for (const base of rightPlayer.bases) {
    points.push(
      <rect key={ key++ } style={ rightBaseStyle }
        x={ getMapSvgX(base, scaleX) - baseHalfWidth } y={ getMapSvgY(base, scaleY) - baseHalfHeight }
        width={ baseHalfWidth + baseHalfWidth } height={ baseHalfHeight + baseHalfHeight }
      />
    );
  }

  const fontSize = 20 * scaleY;
  const fontOffsetX = -8 * scaleX;
  const fontOffsetY = +8 * scaleX;
  const leftPlayerOffset = -scaleX;
  const rightPlayerOffset = +scaleX;
  for (const zone of rightPlayer.zones) {
    if (!zone) continue;
    points.push(
      <text key={ key++ } fontSize={ fontSize } fill="#00EE00" style={{ fontWeight: 600 }}
        x={ getMapSvgX(zone, scaleX) + fontOffsetX + rightPlayerOffset } y={ getMapSvgY(zone, scaleY) + fontOffsetY }
      >
        &#9876;
      </text>
    );
  }
  for (const zone of leftPlayer.zones) {
    if (!zone) continue;
    points.push(
      <text key={ key++ } fontSize={ fontSize } fill="#EE0000" style={{ fontWeight: 600 }}
        x={ getMapSvgX(zone, scaleX) + fontOffsetX + leftPlayerOffset } y={ getMapSvgY(zone, scaleY) + fontOffsetY }
      >
        &#9876;
      </text>
    );
  }

  return (
    <svg top={ top } width={ svgWidth } height={ svgHeight } viewBox={ "0 0 " + jpgWidth + " " + jpgHeight } xmlns="http://www.w3.org/2000/svg">
      <image href={ "/map/" + map + ".jpg" } />
      { points }
    </svg>
  );
}

const combatCardStyle = {
  display: "flex", flexDirection: "column", alignItems: "center",
  border: "solid darkGray", borderRadius: "12px", padding: "0px 12px",
  backgroundColor: "rgba(255, 255, 255, 0.9)"
};

//TODO: Support for version 3 and 4 - "fight.died || fight.losses"
function CombatCard(top, fight, score) {
  const died = fight.died || fight.losses;

  return (
    <div top={ top } style={ combatCardStyle }>
      <Army army={ fight.army } />
      <Rating capacity={ score.capacity } performance={ score.performance } />
      <Army army={ died } loss="true" />
    </div>
  );
}

function createPlayerMap(bot, match) {
  if (bot === match.player1.bot) {
    return { 1: 1, 2: 2, side1: -1, side2: +1, color1: "#00AA00", color2: "#AA0000", reverse: false };
  } else {
    return { 1: 2, 2: 1, side1: +1, side2: -1, color1: "#AA0000", color2: "#00AA00", reverse: true };
  }
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

//TODO: Support for version 3 and 4
function score(fight, player) {
  if (fight.players[player].rating) {
    return { capacity: fight.players[player].rating.militaryCapacity, performance: fight.players[player].rating.militaryPerformance };
  } else {
    const playerArmyValue = fight.players[player].value;
    const playerKillValue = fight.players[player].kill;
    const opponentArmyValue = fight.players[3 - player].value;
    const opponentKillValue = fight.players[3 - player].kill;
    const capacity = Math.floor(MILITARY_COEFFICIENT * playerArmyValue);
    const performance = Math.min(Math.floor(capacity * opponentArmyValue * playerKillValue / playerArmyValue / opponentKillValue), 100);
  
    return { capacity, performance };
  }
}
