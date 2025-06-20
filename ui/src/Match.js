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
import { UnitIcon } from "./Army";
import MatchCell from "./MatchCell";
import Rating from "./Rating";
import { SmallScreen } from "./screen";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;
const MILITARY_COEFFICIENT = 100 / 16000;
const ECONOMY_COEFFICIENT = 100 / 100;
const WARRIORS = MILITARY_COEFFICIENT / 100;
const WORKERS = ECONOMY_COEFFICIENT / 100;

const MAP_SIZE = {
  AbyssalReefAIE: [152, 136],
  AcropolisAIE: [140, 136],
  AutomatonAIE: [148, 148],
  Equilibrium513AIE: [172, 116],
  EphemeronAIE: [132, 148],
  GoldenAura513AIE: [140, 140],
  Gresvan513AIE: [160, 116],
  HardLead513AIE: [132, 132],
  InterloperAIE: [132, 140],
  Oceanborn513AIE: [140, 132],
  PersephoneAIE: [124, 146],
  PylonAIE: [132, 136],
  SiteDelta513AIE: [136, 148],
  ThunderbirdAIE: [140, 140],
  TorchesAIE: [128, 144],
};

const IMG_SIZE = {
  AbyssalReefAIE: [600, 536],
  AcropolisAIE: [600, 582],
  AutomatonAIE: [600, 600],
  Equilibrium513AIE: [800, 540],
  EphemeronAIE: [600, 672],
  GoldenAura513AIE: [600, 600],
  Gresvan513AIE: [800, 580],
  HardLead513AIE: [600, 600],
  InterloperAIE: [600, 635],
  Oceanborn513AIE: [636, 600],
  PersephoneAIE: [600, 706],
  PylonAIE: [600, 618],
  SiteDelta513AIE: [551, 599],
  ThunderbirdAIE: [600, 600],
  TorchesAIE: [600, 675],
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
    infos.push(<BotInfo key="player1-info" info={ { ...match.player1.ranking, ...match.overview.players[1] } } winner={ match.winner } />);
    infos.push(<BotInfo key="player2-info" info={ { ...match.player2.ranking, ...match.overview.players[2] } } winner={ match.winner } />);
    if (playerMap.reverse) infos.reverse();
  }

  if (match.overview && match.overview.players[1].buildOrder && match.overview.players[2].buildOrder) {
    elements.push(<h3 key="heading-buildorder">Build order</h3>);
    elements.push(<p key="description-buildorder">
      Shows the build order of the bot for this match.
      Time denotes the moment when units appear on map and can be detected by the opponent.
      For units this is usually after the unit is ordered and the resources are consumed.
      For buildings this is usually before the building becomes operational.
    </p>);

    const buildorders = [
      <BuildOrder key="player1-build" buildorder={ prepareBuildOrder(match.overview.players[1].buildOrder) } />,
      <BuildOrder key="player2-build" buildorder={ prepareBuildOrder(match.overview.players[2].buildOrder) } />
    ];
    if (playerMap.reverse) buildorders.reverse();
    elements.push(<div key="builds" width="100%" style={{ display: "flex", flexDirection: "row" }}>{ buildorders }</div>);
  }

  if (match.timeline && (width > 0)) {
    elements.push(<h3 key="heading-timeline">Timeline</h3>);
    elements.push(<p key="description-timeline">
      Shows economy and military comparison between the opponents, and the main battles in this match.
      Green line shows value of resource harvest.
      Red line shows value of army units.
      Dotted lines mirror the same for the opponent for easy comparison.
      Green crosses on map show where { bot } killed units.
      Red crosses on map show where { bot } lost units.
    </p>);
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

      <div width="100%" style={{ display: "flex", flexDirection: "row" }}>
        { infos }
      </div>

      <h3 key="heading-history">History</h3>
      <p key="description-history">
        Shows history of matches between the two bots ordered by competition round. 
        Green ones were won by { bot } and red ones were lost.
      </p>
      <History bot={ bot } match={ match } />

      { elements }
    </div>
  );
}

function BotInfo({ info, winner }) {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", verticalAlign: "top", width: "50%", padding: "1rem" }}>
      <div><img src={ "/" + info.race + ".png" } width="17" style={{ position: "relative", top: "2px", marginRight: "5px" }} /> { info.bot }</div>
      <div style={{ color: resultColor, fontSize: "1.5rem", fontWeight: "bold" }}>{ resultText }</div>
      <div>Military: <Rating capacity={ info.militaryCapacity } performance={ info.militaryPerformance } /></div>
      <div>Economy: <Rating capacity={ info.economyCapacity } performance={ info.economyPerformance } /></div>
      <div>Technology: <Rating capacity={ info.technologyCapacity } performance={ info.technologyPerformance } /></div>
      <Army army={ info.armyBuild } />
    </div>
  );
}

function History({ bot, match }) {
  const rounds = new Map();
  const rows = [];
  const cellsPerRow = Math.floor(window.innerWidth / 38);
  let round = 1;
  let count = 0;
  let key = 1;

  for (const one of match.history) {
    rounds.set(one.round, one);
  }

  while (count < match.history.length) {
    const cells = [];
    let countInRound = 0;

    for (let c = 0; c < cellsPerRow; c++, round++) {
      if (rounds.has(round)) {
        count++;
        countInRound++;
      }

      cells.push(
        <TableCell key={ key++ }>
          <MatchCell bot={ bot } match={ rounds.get(round) } text={ round } />
        </TableCell>
      );
    }

    if (countInRound) {
      rows.push(<TableRow key={ key++ }>{ cells }</TableRow>);
    }
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

function BuildOrder({ buildorder }) {
  const rows = [];

  for (const one of buildorder) {
    const card = [];

    card.push(<span key="time">{ clock(one.loop) }</span>);

    if (one.count) {
      card.push(<span key="count" style={{ marginLeft: "0.2rem", marginRight: "0.1rem", fontWeight: "bold" }}>{ one.count }</span>);
    }

    card.push(<UnitIcon key="unit" unit={ one.build } />);

    rows.push(<div key={ rows.length } style={{ marginRight: "1rem", display: "flex", alignItems: "center" }}>{ card }</div>);
  }

  return (<div style={{ width: "50%", padding: "2rem", display: "flex", flexWrap: "wrap" }}>{ rows }</div>);
}

function prepareBuildOrder(buildorder) {
  const order = [];
  let previous;

  for (const one of buildorder) {
    if (!one.loop) continue;

    one.count = 0;

    if (previous && (one.loop === previous.loop) && (one.build === previous.build)) {
      previous.count = previous.count ? previous.count + 1 : 2;
    } else {
      order.push(one);
    }

    previous = one;
  }

  return order;
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
        height += SmallScreen ? 200 : 100;
        
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

  let leftSideStyle;
  let centerSideStyle;
  let rightSideStyle;

  if (SmallScreen) {
    leftSideStyle = { position: "absolute", left: 0, width: "50%", display: "flex", justifyContent: "right", marginTop: "100px", marginLeft: "0" };
    centerSideStyle = { position: "absolute", left: 0, width: "40%", display: "flex", justifyContent: "center", marginLeft: "30%", marginRight: "30%" };
    rightSideStyle = { position: "absolute", left: 0, width: "50%", display: "flex", justifyContent: "left", marginTop: "100px", marginLeft: "50%" };
  } else {
    leftSideStyle = { position: "absolute", left: 0, width: "34%", display: "flex", justifyContent: "right", marginRight: "66%" };
    centerSideStyle = { position: "absolute", left: 0, width: "150px", display: "flex", justifyContent: "center", marginLeft: "calc(50% - 75px)", marginRight: "calc(50% - 75px)" };
    rightSideStyle = { position: "absolute", left: 0, width: "34%", display: "flex", justifyContent: "left", marginLeft: "66%" };
  }

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
  border: "solid darkGray", borderRadius: "12px", padding: "0px 12px", margin: "1px",
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
