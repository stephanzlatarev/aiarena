import * as React from "react";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import ReplayTimeline from "@robobays/replay-timeline";
import Army from "./Army";
import { UnitIcon } from "./Army";
import MatchCell from "./MatchCell";
import Rating from "./Rating";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;

export default function Match({ bot, match, summary }) {
  const playerMap = createPlayerMap(bot, match);
  const ref = React.useRef(null);
  const [width, setWidth] = React.useState({ width: 0, height: 0 });
  const infos = [];
  const elements = [];
  const highlights = [];

  React.useEffect(() => setWidth(ref.current ? ref.current.offsetWidth : 0), [ref.current]);

  if (match.overview) {
    infos.push(<BotInfo key="player1-info" info={ { ...match.player1.ranking, ...match.overview.players[1] } } winner={ match.winner } />);
    infos.push(<BotInfo key="player2-info" info={ { ...match.player2.ranking, ...match.overview.players[2] } } winner={ match.winner } />);
    if (playerMap.reverse) infos.reverse();
  }

  if (summary && summary.summary && summary.summary.summary) {
    highlights.push(<div key="description-summary">{ summary.summary.summary }</div>);
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

      { highlights }

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

function Timeline(data) {
  const [svgTimeline, setSvgTimeline] = React.useState(null);

  React.useEffect(() => {
    async function createSvgTimeline({ match, playerMap, width }) {
      const timeline = Array.isArray(match.timeline[0]) ? match.timeline[0] : match.timeline;

      if (playerMap.reverse) {
        for (const point of timeline) {
          if (point.players) {
            const p1 = point.players[1];
            const p2 = point.players[2];
            point.players[1] = p2;
            point.players[2] = p1;
          }
        }
      }

      setSvgTimeline(await ReplayTimeline.from(timeline).format("svg", { map: match.map, width }).to("string"));
    }
    createSvgTimeline(data);
  }, [data]);

  return (
    <div style={{ width: "100%" }}  dangerouslySetInnerHTML={{ __html: svgTimeline }} />
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
