import * as React from "react";
import { Link, useAsyncValue } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Army from "./Army";
import Rating from "./Rating";

const HOUSEBOTS_AUTHOR = 133;

const AUTHOR_ALIAS = new Map();
AUTHOR_ALIAS.set(1029, 698);
AUTHOR_ALIAS.set(698, 1029);

const AUTHOR_REMOVED = new Set();
AUTHOR_REMOVED.add(1711);

const DivisionHeader = { border: 0, backgroundImage: "linear-gradient(#556cd6, white)", fontWeight: "bold", color: "white", textAlign: "center", textTransform: "uppercase" };
const ProBotsHeader = { border: 0, backgroundImage: "linear-gradient(white, #9fcc9f)", fontWeight: "bold", color: "white", textAlign: "center", textTransform: "uppercase" };
const ProBotsDisqualified = { textDecoration: "line-through", textDecorationThickness: "2px", textDecorationColor: "#9fcc9f" };
const AuthorRemoved = {     fontSize: "0.6rem", paddingLeft: "0.5rem", color: "#9fcc9f", textTransform: "uppercase", fontWeight: "bold", whiteSpace: "nowrap" };

export default function Rankings() {
  const rankings = useAsyncValue().sort(function(a, b) {
    if (!a.division && !b.division) return a.bot.localeCompare(b.bot);
    if (!a.division) return 1;
    if (!b.division) return -1;

    return (a.division !== b.division) ? a.division - b.division : b.elo - a.elo;
  });
  const rows = [];
  let division;
  let rank = 1;

  const probots = new Set();
  let probotsCutoffShown = false;

  for (const one of rankings) {
    if (!one.race) continue;

    const bot = one.bot;
    const path = "/bot/" + bot;

    if (one.division !== division) {
      const separator = one.division ? "Division " + one.division : "Joining or leaving";

      rows.push(
        <TableRow key={ one.division }>
          <TableCell colSpan={ 9 } style={ DivisionHeader }>{ separator }</TableCell>
        </TableRow>
      );

      division = one.division;
    }

    if (!one.division) rank = null;

    const botNameStyle = (!probotsCutoffShown && AUTHOR_REMOVED.has(one.user)) ? ProBotsDisqualified : {};
    const botNameAppendix = (!probotsCutoffShown && AUTHOR_REMOVED.has(one.user)) ? (<span style={ AuthorRemoved }>Author removed</span>) : null;

    rows.push(
      <TableRow key={ bot }>
        <TableCell>{ rank }</TableCell>
        <TableCell component="th" scope="row">
          <img src={ "/" + one.race + ".png" } width="17" style={{ position: "relative", top: "4px", marginRight: "5px" }} />
          <Link to={ path } style={ botNameStyle }>{ bot }</Link>
          { botNameAppendix }
        </TableCell>
        <TableCell>{ one.winRate.toFixed(2) }%</TableCell>
        <TableCell>{ one.elo }</TableCell>
        <TableCell>
          <div style={{ display: "flex", alignItems: "center", minWidth: "320px" }}>
            <Army army={ one.armyBuild } />
            <div>({ one.armyBuildWins || 0 } wins)</div>
          </div>
        </TableCell>
        <TableCell><Rating capacity={ one.militaryCapacity } performance={ one.militaryPerformance } /></TableCell>
        <TableCell><Rating capacity={ one.economyCapacity } performance={ one.economyPerformance } /></TableCell>
        <TableCell><Rating capacity={ one.technologyCapacity } performance={ one.technologyPerformance } /></TableCell>
      </TableRow>
    );

    if (one.division) rank++;

    if (!probotsCutoffShown && (one.user !== HOUSEBOTS_AUTHOR) && !probots.has(AUTHOR_ALIAS.get(one.user)) && !AUTHOR_REMOVED.has(one.user)) {
      probots.add(one.user);

      if (probots.size === 16) {
        rows.push(<TableRow key="probots-tournament"><TableCell colSpan={ 9 } style={ ProBotsHeader }>ProBots Tournament Cut-off</TableCell></TableRow>);
        probotsCutoffShown = true;
      }
    }
  }

  return (
    <TableContainer component={ Paper }>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Rank</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Wins</TableCell>
            <TableCell>ELO</TableCell>
            <TableCell>Best army composition</TableCell>
            <TableCell>Military score</TableCell>
            <TableCell>Economy score</TableCell>
            <TableCell>Technology score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { rows }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
