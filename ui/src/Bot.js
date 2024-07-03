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
import Rating from "./Rating";

export default function Bot() {
  const { bot, matches } = useAsyncValue();
  const [tab, setTab] = React.useState("1");

  const worstMatches = matches.map((match) => addScore(bot, match)).filter(match => (match.score < 0)).sort(orderByScore);
  worstMatches.length = 30;

  return (
    <Paper elevation={ 3 }>
      <Tabs value={ tab } onChange={ (_, value) => setTab(value) }>
        <Tab label="Rounds" value="1" />
        <Tab label="Worst matches" value="2" />
      </Tabs>
      <TabPanel tab={ tab } index="1">Rounds</TabPanel>
      <TabPanel tab={ tab } index="2">
        <MatchList bot={ bot } matches={ worstMatches } />
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

function MatchList({ bot, matches }) {
  const rows = matches.map(match => (
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
  if (match.warnings.length) {
    match.score = 0;
  } else if (match.winner === bot) {
    match.score = 1;
  } else if (match.overview) {
    const overview = (match.player1 === bot) ? match.overview.players[1] : match.overview.players[2];

    if (overview) {
      const opponent = (match.player1 === bot) ? match.overview.players[2] : match.overview.players[1];

      overview.score = (overview.militaryPerformance + overview.economyPerformance) / 2;
      match.opponent = (match.player1 === bot) ? match.player2 : match.player1;
      match.overview.own = overview;
      match.overview.opponent = opponent;
      match.score = overview.score - 100;
    }
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
