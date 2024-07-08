import * as React from "react";
import { Link, useAsyncValue } from "react-router-dom";
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
import displayTime from "./time";

export default function Bot() {
  const { bot, matches, ranking } = useAsyncValue();
  const [tab, setTab] = React.useState("1");

  for (const match of matches) {
    addScore(bot, match);
  }

  return (
    <Paper elevation={ 3 }>
      <Tabs value={ tab } onChange={ (_, value) => setTab(value) }>
        <Tab label="Rounds" value="1" />
        <Tab label="Sparring" value="2" />
        <Tab label="Worst matches" value="3" />
      </Tabs>
      <TabPanel tab={ tab } index="1">
        <Rounds bot={ bot } matches={ matches } />
      </TabPanel>
      <TabPanel tab={ tab } index="2">
        <Sparring bot={ bot } matches={ matches } ranking={ ranking } />
      </TabPanel>
      <TabPanel tab={ tab } index="3">
        <MatchList bot={ bot } matches={ matches } />
      </TabPanel>
    </Paper>
  );
}

function TabPanel({ children, tab, index }) {
  if (tab === index) {
    return (
      <div role="tabpanel">
        {children}
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
    let list = opponents.get(match.opponent);

    if (!list) {
      list = [];
      opponents.set(match.opponent, list);
    }

    rounds = Math.max(match.round, rounds);
    list[match.round] = (
      <TableCell key={ key++ } style={ style }>
        <MatchCell bot={ bot } match={ match } />
      </TableCell>
    );
  }

  const opponentNames = [...opponents.keys()].sort();

  for (const opponent of opponentNames) {
    cols.push(<TableCell key={ key++ } style={{ ...style, writingMode: "vertical-lr", textOrientation: "sideways", textAlign: "right", paddingBottom: "0.5rem" }}>{ opponent }</TableCell>);
  }

  for (let i = rounds - 1; i >= 0; i--) {
    const round = i + 1;
    const opponentCols = [];
    let hasOpponentsInThisRound = false;

    for (const opponent of opponentNames) {
      const list = opponents.get(opponent);

      if (list && list[round]) {
        opponentCols.push(list[round]);
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

const MAP_NAMES = ["Equilibrium513AIE", "GoldenAura513AIE", "Gresvan513AIE", "HardLead513AIE", "Oceanborn513AIE", "SiteDelta513AIE"];
const MAP_DESCRIPTION = {
  Equilibrium513AIE: "Find inner balance on this map with expansions in close proximity.",
  GoldenAura513AIE: "Goldenaura is a macro map that features total of 13 blue bases and one golden base...",
  Gresvan513AIE: "A wide macro map designed around control of the center high and low grounds...",
  HardLead513AIE: "Short rush distance and multiple paths will force players to split their armies or...",
  Oceanborn513AIE: "Oceanborn is a standard map set in an underwater world.",
  SiteDelta513AIE: "Site Delta is a macro map designed with a tight choke in the center...",
};

function Sparring({ bot, matches, ranking }) {
  const cellStyle = { textAlign: "center", whiteSpace: "nowrap" };

  let key = 1;
  let opponents = new Map();
  let hasMatchesWithPreviousVersion = false;

  for (const match of matches) {
    const opponent = (match.player1 === bot) ? match.player2 : match.player1;
    let info = opponents.get(opponent);

    if (!info) {
      info = { opponent: opponent, wins: 0, matches: [] };
      opponents.set(opponent, info);
    }

    if (match.winner === bot) {
      info.wins++;
    } else if (!match.winner) {
      info.wins += 0.5;
    }

    info.matches.push(match);
  }

  let list = [...opponents.values()];
  for (const info of list) {
    info.winRate = info.wins / info.matches.length;
    info.score = Math.abs(0.5 - info.winRate);
  }
  list.sort((a, b) => (a.score - b.score));
  if (list.length > 12) list.length = 12;

  for (const info of list) {
    info.matches = splitSparringMatchesByMap(info.matches);

    for (const map in info.matches) {
      for (const match of info.matches[map]) {
        if (match.time < ranking.lastUpdate) {
          match.background = "lightGray";
          hasMatchesWithPreviousVersion = true;
        }
      }
    }
  }

  const rows = list.map(info => (
    <TableRow key={ key++ }>
      <TableCell style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>{ info.opponent }</TableCell>
      <TableCell>{ (info.winRate * 100).toFixed(2) + "%" }</TableCell>
      <TableCell><Army army={ getLastArmyBuild(info.matches) } /></TableCell>
      {
        MAP_NAMES.map(map => (
          <TableCell key={ key++ }>
            { info.matches[map].map(match => (<MatchCell key={ key++ } bot={ bot } match={ match } background={ match.background } />)) }
          </TableCell>
        ))
      }
    </TableRow>
  ));

  return (
    <TableContainer component={ Paper }>
      <p>
        &nbsp; &nbsp; Top 12 sparring opponents with the last 10 matches per map.
        { hasMatchesWithPreviousVersion ? " The bot was updated " + displayTime(ranking.lastUpdate) + ". Older matches are grayed." : null }
      </p>
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

function splitSparringMatchesByMap(matches) {
  const split = {};

  for (const map of MAP_NAMES) {
    split[map] = [];
  }

  for (const match of matches) {
    split[match.map].push(match);
  }

  for (const map in split) {
    const list = split[map];
    list.sort((a, b) => (b.round - a.round));
    if (list.length > 10) list.length = 10;
    list.reverse();
  }

  return split;
}

function getLastArmyBuild(matches) {
  let last = null;

  for (const map in matches) {
    for (const match of matches[map]) {
      if (!last) {
        last = match;
      } else {
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
      }
    }
  }

  return last ? last.overview.opponent.armyBuild : [];
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
