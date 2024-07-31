import * as React from "react";
import { Link, useAsyncValue, useNavigate } from "react-router-dom";
import List from "@mui/material/List";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Army from "./Army";
import MatchCell from "./MatchCell";
import Rating from "./Rating";
import { SmallScreen } from "./screen";
import displayTime from "./time";

export default function Bot({ tab }) {
  tab = tab ? tab : "rounds";

  const { bot, matches, ranking, opponents } = useAsyncValue();
  const navigate = useNavigate();

  for (const match of matches) {
    addScore(bot, match);
  }

  return (
    <Paper elevation={ 3 }>
      <Tabs value={ tab } onChange={ (_, tab) => navigate("/bot/" + bot + "/" + tab) }>
        <Tab label="Rounds" value="rounds" />
        <Tab label="Sparring" value="sparring" />
        <Tab label="Worst matches" value="worst" />
      </Tabs>
      <TabPanel tab={ tab } index="rounds">
        <Rounds bot={ bot } matches={ matches } />
      </TabPanel>
      <TabPanel tab={ tab } index="sparring">
        <Sparring bot={ bot } matches={ matches } ranking={ ranking } opponents={ opponents } />
      </TabPanel>
      <TabPanel tab={ tab } index="worst">
        <MatchList bot={ bot } matches={ matches } />
      </TabPanel>
    </Paper>
  );
}

function TabPanel({ children, tab, index }) {
  if (tab === index) {
    return (
      <div role="tabpanel">
        { children }
      </div>
    );
  }

  return null;
}

function Rounds({ bot, matches }) {
  const cols = [];
  const rows = [];
  const style = { margin: "0px", padding: "1px", textAlign: "center" };
  const opponents = new Map();
  let rounds = 0;
  let key = 1;

  for (const match of matches) {
    let info = opponents.get(match.opponent);

    if (!info) {
      info = { opponent: match.opponent, cells: [], count: 0, results: [], wins: 0 };
      opponents.set(match.opponent, info);
    }

    rounds = Math.max(match.round, rounds);

    info.count++;

    if (match.winner === bot) {
      info.wins++;
      info.results[match.round] = 1;
    } else {
      info.results[match.round] = -1;
    }

    info.cells[match.round] = (
      <TableCell key={ key++ } style={ style }>
        <MatchCell bot={ bot } match={ match } />
      </TableCell>
    );
  }

  const opponentNames = getOrderedOpponentsNames(opponents, rounds);

  for (const opponent of opponentNames) {
    cols.push(<TableCell key={ key++ } style={{ ...style, writingMode: "vertical-lr", textOrientation: "sideways", textAlign: "right", paddingBottom: "0.5rem" }}>{ opponent }</TableCell>);
  }

  for (let i = rounds - 1; i >= 0; i--) {
    const round = i + 1;
    const opponentCols = [];
    let hasOpponentsInThisRound = false;

    for (const opponent of opponentNames) {
      const info = opponents.get(opponent);

      if (info && info.cells[round]) {
        opponentCols.push(info.cells[round]);
        hasOpponentsInThisRound = true;
      } else {
        opponentCols.push(<TableCell key={ key++ }></TableCell>);
      }
    }

    if (hasOpponentsInThisRound) {
      rows.push(
        <TableRow key={ key++ }>
          <TableCell style={ style }>{ round }</TableCell>
          { opponentCols }
        </TableRow>
      );
    }
  }

  return (
    <TableContainer component={ Paper }>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={ style }>Round</TableCell>
            { cols }
          </TableRow>
        </TableHead>
        <TableBody>
          { rows }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function getOrderedOpponentsNames(opponents, rounds) {
  const list = [...opponents.values()];

  for (const info of list) {
    info.lastMatches = 0;
    info.lastWins = 0;

    for (let r = rounds - 10; r <= rounds; r++) {
      const result = info.results[r];
      if (result) info.lastMatches++;
      if (result > 0) info.lastWins++;
    }

    info.isInSameDivision = (info.lastMatches >= 8);
  }

  list.sort(function (a, b) {
    if (a.isInSameDivision && b.isInSameDivision) {
      if (a.lastWins !== b.lastWins) {
        return (b.lastWins - a.lastWins);
      } else {
        return (b.wins * a.count - a.wins * b.count);
      }
    } else if (a.isInSameDivision) {
      return -1;
    } else if (b.isInSameDivision) {
      return 1;
    } else if (a.count === b.count) {
      return (b.wins * a.count - a.wins * b.count);
    } else {
      return (b.count - a.count);
    }
  });

  return list.map(info => info.opponent);
}

const MAP_NAMES = ["Equilibrium513AIE", "GoldenAura513AIE", "Gresvan513AIE", "HardLead513AIE", "Oceanborn513AIE", "SiteDelta513AIE"];
const MAP_DESCRIPTION = {
  Equilibrium513AIE: "Find inner balance on this map with expansions in close proximity.",
  GoldenAura513AIE: "Goldenaura is a macro map that features total of 13 blue bases and one golden base...",
  Gresvan513AIE: "A wide macro map designed around control of the center high and low grounds...",
  HardLead513AIE: "Short rush distance and multiple paths will force players to split their armies or...",
  Oceanborn513AIE: "Oceanborn is a standard map set in an underwater world.",
  SiteDelta513AIE: "Site Delta is a macro map designed with a tight choke in the center...",
};

function Sparring({ bot, matches, ranking, opponents }) {
  const cellStyle = { textAlign: "center", whiteSpace: "nowrap" };

  let key = 1;
  let bots = new Map();
  let hasMatchesWithPreviousVersion = false;

  for (const opponent of opponents) {
    if ((opponent.division === ranking.division) && (opponent.bot !== bot)) {
      bots.set(opponent.bot, { opponent: opponent.bot, wins: 0, matches: [] });
    }
  }

  for (const match of matches) {
    const info = bots.get((match.player1 === bot) ? match.player2 : match.player1);

    if (info) {
      if (match.winner === bot) {
        info.wins++;
      } else if (!match.winner) {
        info.wins += 0.5;
      }
  
      info.matches.push(match);
    }
  }

  const list = [...bots.values()];
  for (const info of list) {
    info.winRate = info.wins / info.matches.length;
    info.score = Math.abs(0.5 - info.winRate);
  }
  list.sort((a, b) => (a.score - b.score));
  if (list.length > 12) list.length = 12;

  for (const info of list) {
    info.matches = splitSparringMatchesByMapSideVersion(info.matches, ranking.lastUpdate);
    hasMatchesWithPreviousVersion = info.matches.versioned;
  }

  const hint = (
    <p style={{ paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
      &nbsp; Top 12 sparring opponents in the same division with the last 10 matches per map and side of map.
      { hasMatchesWithPreviousVersion ? " The bot was updated " + displayTime(ranking.lastUpdate) + ". Older matches are grayed." : null }
    </p>
  );

  if (SmallScreen) {
    const bg = {
      width: "110px", height: "72px", marginLeft: "1rem", marginRight: "1rem",
      backgroundSize: "auto 72px", backgroundRepeat: "no-repeat", backgroundPositionX: "center", backgroundColor: "#444444",
    };
    const rows = list.map(info => (
      <div key={ key++ } style={{ borderTop: "solid 1px gray", padding: "1rem" }}>
        <span style={{ fontWeight: "bold" }}>{ info.opponent }</span>
        <span style={{ color: getWinRateColor(info.winRate), fontWeight: "bold", float: "right" }}>{ (info.winRate * 100).toFixed(2) }% wins</span>
        <br />
        <div style={{ float: "right" }}><Army army={ info.matches.armyBuild } /></div>
        <br style={{ clear: "both" }} />

        {
          MAP_NAMES.map(map => (
            <div key={ key++ } style={{ paddingTop: "0.5rem", display: "flex" }}>
              <div style={{ ...bg, backgroundImage: "url('/map/" + map + ".jpg')" }} />
              <div>
                { map }
                <br />
                { info.matches[1][map].map(match => (<MatchCell key={ key++ } bot={ bot } match={ match } background="lightGray" />)) }
                { info.matches[2][map].map(match => (<MatchCell key={ key++ } bot={ bot } match={ match } />)) }
                <br />
                { info.matches[3][map].map(match => (<MatchCell key={ key++ } bot={ bot } match={ match } background="lightGray" />)) }
                { info.matches[4][map].map(match => (<MatchCell key={ key++ } bot={ bot } match={ match } />)) }
              </div>
            </div>
          ))
        }
      </div>
    ));

    return (
      <List>
        { hint }
        { rows }
      </List>
    );
  }

  const rows = list.map(info => (
    <TableRow key={ key++ }>
      <TableCell style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>{ info.opponent }</TableCell>
      <TableCell style={{ color: getWinRateColor(info.winRate), fontWeight: "bold" }}>{ (info.winRate * 100).toFixed(2) + "%" }</TableCell>
      <TableCell style={{ minWidth: "260px" }}><Army army={ info.matches.armyBuild } /></TableCell>
      {
        MAP_NAMES.map(map => (
          <TableCell key={ key++ }>
            { info.matches[1][map].map(match => (<MatchCell key={ key++ } bot={ bot } match={ match } background="lightGray" />)) }
            { info.matches[2][map].map(match => (<MatchCell key={ key++ } bot={ bot } match={ match } />)) }
            <br />
            { info.matches[3][map].map(match => (<MatchCell key={ key++ } bot={ bot } match={ match } background="lightGray" />)) }
            { info.matches[4][map].map(match => (<MatchCell key={ key++ } bot={ bot } match={ match } />)) }
          </TableCell>
        ))
      }
    </TableRow>
  ));

  return (
    <TableContainer component={ Paper }>
      { hint }
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={ cellStyle }>Opponent</TableCell>
            <TableCell style={ cellStyle }>Wins</TableCell>
            <TableCell style={ cellStyle }>Army</TableCell>
            { MAP_NAMES.map(name => (<TableCell key={ key++ } style={ cellStyle }>{ name }</TableCell>)) }
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            {
              MAP_NAMES.map(name => (
                <TableCell key={ key++ } style={ cellStyle }>
                  <img src={ "/map/" + name + ".jpg" } style={{ height: "100px" }} />
                </TableCell>
              ))
            }
          </TableRow>
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            {
              MAP_NAMES.map(name => (
                <TableCell key={ key++ } style={{ ...cellStyle, whiteSpace: "normal" }}>
                  { MAP_DESCRIPTION[name] }
                </TableCell>
              ))
            }
          </TableRow>
          { rows }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function getWinRateColor(rate) {
  if (rate < 0.34) {
    return "#990000";
  } else if (rate < 0.67) {
    return "#999900";
  } else if (rate <= 1.00) {
    return "#009900";
  } else {
    return "white";
  }
}

function splitSparringMatchesByMapSideVersion(matches, lastUpdate) {
  // Side 1 old version in 1. Side 1 new version in 2. Side 2 old version in 3. Side 3 old version in 4.
  const split = { 1: [], 2: [], 3: [], 4: [], armyBuild: [], versioned: false };
  const permap = {};
  let last = null;

  for (const map of MAP_NAMES) {
    permap[map] = [];
    split[1][map] = [];
    split[2][map] = [];
    split[3][map] = [];
    split[4][map] = [];
  }

  for (const match of matches) {
    permap[match.map].push(match);

    if (last) {
      const isMatchLost = (match.opponent === match.winner);
      const isLastLost = (last.opponent === last.winner);
  
      if (isMatchLost) {
        if (isLastLost) {
          if (match.round > last.round) {
            last = match;
          }
        } else {
          last = match;
        }
      } else if (!isLastLost && (match.round > last.round)) {
        last = match;
      }
    } else {
      last = match;
    }
  }

  if (last) {
    split.armyBuild = last.overview.opponent.armyBuild;
  }

  for (const map in permap) {
    const list = permap[map];
    const s1 = [];
    const s2 = [];
    const s3 = [];
    const s4 = [];

    list.sort((a, b) => (b.round - a.round));

    for (const match of list) {
      let leftSide = true;
      if ((match.opponent === match.player1) && (match.side === 1)) leftSide = false;
      if ((match.opponent === match.player2) && (match.side === 2)) leftSide = false;

      if (leftSide) {
        if (match.time < lastUpdate) {
          split.versioned = true;
          if (s1.length < 10) s1.push(match);
        } else {
          if (s2.length < 10) s2.push(match);
        }
      } else {
        if (match.time < lastUpdate) {
          split.versioned = true;
          if (s3.length < 10) s3.push(match);
        } else {
          if (s4.length < 10) s4.push(match);
        }
      }
    }

    const newlimit = Math.max(s2.length, s4.length);
    const oldlimit = 10 - newlimit;

    split[1][map] = sizeAndReverse(s1, oldlimit);
    split[2][map] = sizeAndReverse(s2, newlimit);
    split[3][map] = sizeAndReverse(s3, oldlimit);
    split[4][map] = sizeAndReverse(s4, newlimit);
  }

  return split;
}

function sizeAndReverse(array, length) {
  while (array.length < length) array.push(null);
  array.length = length;
  return array.reverse();
}

function MatchList({ bot, matches }) {
  const worst = matches.filter(match => (match.score < 0)).sort(orderByScore);
  worst.length = 30;

  const rows = worst.map(match => (
    <TableRow key={ match.match }>
      <TableCell><Link to={ "/bot/" + bot + "/match/" + match.match }>{ match.match }</Link></TableCell>
      <TableCell>{ match.round }</TableCell>
      <TableCell>{ displayTime(match.time) }</TableCell>
      <TableCell>{ match.map }</TableCell>
      <TableCell>{ match.opponent }</TableCell>
      <TableCell></TableCell>
      <TableCell>Loss</TableCell>
      <TableCell><Rating performance={ Math.abs(match.overview.own.score) } /></TableCell>
      <TableCell><Rating capacity={ match.overview.own.militaryCapacity } performance={ match.overview.own.militaryPerformance } /></TableCell>
      <TableCell><Rating capacity={ match.overview.own.economyCapacity } performance={ match.overview.own.economyPerformance } /></TableCell>
      <TableCell><Army army={ match.overview.own.armyBuild } /></TableCell>
    </TableRow>
  ));

  return (
    <TableContainer component={ Paper }>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Match</TableCell>
            <TableCell>Round</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Map</TableCell>
            <TableCell>Opponent</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Result</TableCell>
            <TableCell>Overall score</TableCell>
            <TableCell>Military score</TableCell>
            <TableCell>Economy score</TableCell>
            <TableCell>Best army</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { rows }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function addScore(bot, match) {
  match.opponent = (match.player1 === bot) ? match.player2 : match.player1;

  if (match.overview) {
    match.overview.own = (match.player1 === bot) ? match.overview.players[1] : match.overview.players[2];
    match.overview.opponent = (match.player1 === bot) ? match.overview.players[2] : match.overview.players[1];

    if (match.overview.own) {
      match.score = (match.overview.own.militaryPerformance + match.overview.own.economyPerformance) / 2;
    }
  }

  if (!match.winner || match.warnings.length) {
    match.score = 0;
  } else if (match.winner !== bot) {
    match.score = match.score - 100;
  }

  return match;
}

function orderByScore(a, b) {
  return (a.score - b.score);
}
