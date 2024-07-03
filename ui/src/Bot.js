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

export default function Bot() {
  const { bot, matches } = useAsyncValue();
  const [tab, setTab] = React.useState("1");

  for (const match of matches) {
    addScore(bot, match);
  }

  return (
    <Paper elevation={ 3 }>
      <Tabs value={ tab } onChange={ (_, value) => setTab(value) }>
        <Tab label="Rounds" value="1" />
        <Tab label="Worst matches" value="2" />
      </Tabs>
      <TabPanel tab={ tab } index="1">
        <Rounds bot={ bot } matches={ matches } />
      </TabPanel>
      <TabPanel tab={ tab } index="2">
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
    list[match.round] = (<MatchCell key={ key++ } bot={ bot } match={ match } style={ style } />);
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

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ONE_HOUR = 2 * 60 * 60 * 1000;
const TWO_HOURS = 2 * ONE_HOUR;
const ONE_DAY = 24 * ONE_HOUR;
const TWO_DAYS = 2 * ONE_DAY;
const ONE_MONTH = 30 * ONE_DAY;

function displayTime(time) {
  if (!time) return "";

  const date = new Date(time);
  const diff = Date.now() - date.getTime();

  if (diff < TWO_HOURS) return "just now";
  if (diff < TWO_DAYS) return Math.floor(diff / ONE_HOUR) + " hours ago";
  if (diff < ONE_MONTH) return Math.floor(diff / ONE_DAY) + " days ago";

  return MONTHS[date.getMonth()] + " " + date.getDate();
}
