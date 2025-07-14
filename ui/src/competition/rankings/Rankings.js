import * as React from "react";
import { Link } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Army from "../../Army";
import Rating from "../../Rating";
import { SmallScreen } from "../../screen";

const HOUSEBOTS_AUTHOR = 133;

const AUTHOR_ALIAS = new Map();
AUTHOR_ALIAS.set(1029, 698);
AUTHOR_ALIAS.set(698, 1029);

const BOT_REMOVED = new Set();
BOT_REMOVED.add(680);
BOT_REMOVED.add(691);
BOT_REMOVED.add(696);
BOT_REMOVED.add(707);
BOT_REMOVED.add(716);
BOT_REMOVED.add(717);
BOT_REMOVED.add(746);

const AUTHOR_REMOVED = new Set();
AUTHOR_REMOVED.add(1711);
AUTHOR_REMOVED.add(1804);
AUTHOR_REMOVED.add(1858);

const DivisionHeader = { border: 0, backgroundImage: "linear-gradient(#556cd6, white)", fontWeight: "bold", color: "white", textAlign: "center", textTransform: "uppercase" };
const ProBotsHeader = { border: 0, backgroundImage: "linear-gradient(white, #9fcc9f)", fontWeight: "bold", color: "white", textAlign: "center", textTransform: "uppercase" };
const ProBotsDisqualified = { textDecoration: "line-through", textDecorationThickness: "2px", textDecorationColor: "#9fcc9f" };
const AuthorRemoved = {     fontSize: "0.6rem", paddingLeft: "0.5rem", color: "#9fcc9f", textTransform: "uppercase", fontWeight: "bold", whiteSpace: "nowrap" };

export default function Rankings({ rankings }) {
  rankings = rankings
  .map(function(one) {
    if (BOT_REMOVED.has(one.id)) one.division = 0;
    return one;
  })
  .sort(function(a, b) {
    if (!a.division && !b.division) return a.bot.localeCompare(b.bot);
    if (!a.division) return 1;
    if (!b.division) return -1;

    return (a.division !== b.division) ? a.division - b.division : b.elo - a.elo;
  });

  const cols = SmallScreen ? 4 : 8;
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
      const separator = one.division ? "Division " + one.division : "Inactive";

      rows.push(
        <TableRow key={ one.division }>
          <TableCell colSpan={ cols } style={ DivisionHeader }>{ separator }</TableCell>
        </TableRow>
      );

      division = one.division;
    }

    if (!one.division) rank = null;

    const botNameStyle = (!probotsCutoffShown && AUTHOR_REMOVED.has(one.user)) ? ProBotsDisqualified : {};
    const botNameAppendix = (!probotsCutoffShown && AUTHOR_REMOVED.has(one.user)) ? (<span style={ AuthorRemoved }>Author removed</span>) : null;

    const rowCells = [
      <TableCell key="1">{ rank }</TableCell>,
      <TableCell key="2" component="th" scope="row">
        <img src={ "/" + one.race + ".png" } width="17" style={{ position: "relative", top: "4px", marginRight: "5px" }} />
        <Link to={ path } style={ botNameStyle }>{ bot }</Link>
        { botNameAppendix }
      </TableCell>,
      <TableCell key="3">{ one.winRate.toFixed(2) }%</TableCell>,
      <TableCell key="4">{ one.elo }</TableCell>,
    ];
    if (!SmallScreen) {
      rowCells.push(
        <TableCell key="5">
          <div style={{ display: "flex", alignItems: "center", minWidth: "320px" }}>
            <Army army={ one.armyBuild } />
            <div>({ one.armyBuildWins || 0 } { (one.armyBuildWins === 1) ? "win" : "wins" })</div>
          </div>
        </TableCell>,
        <TableCell key="6"><Rating capacity={ one.militaryCapacity } performance={ one.militaryPerformance } /></TableCell>,
        <TableCell key="7"><Rating capacity={ one.economyCapacity } performance={ one.economyPerformance } /></TableCell>,
        <TableCell key="8"><Rating capacity={ one.technologyCapacity } performance={ one.technologyPerformance } /></TableCell>
      );
    }

    rows.push(
      <TableRow key={ bot }>
        { rowCells }
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

  const headerCells = [
    <TableCell key="1">Rank</TableCell>,
    <TableCell key="2">Name</TableCell>,
    <TableCell key="3">Wins</TableCell>,
    <TableCell key="4">ELO</TableCell>,
  ];
  if (!SmallScreen) {
    headerCells.push(
      <TableCell key="5">Best army composition</TableCell>,
      <TableCell key="6">Military score</TableCell>,
      <TableCell key="7">Economy score</TableCell>,
      <TableCell key="8">Technology score</TableCell>,
    );
  }

  return (
    <TableContainer component={ Paper }>
      <Table>
        <TableHead>
          <TableRow>
            { headerCells }
          </TableRow>
        </TableHead>
        <TableBody>
          { rows }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
