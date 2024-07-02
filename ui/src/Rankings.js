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

const DivisionHeader = { border: 0, backgroundImage: "linear-gradient(#556cd6, white)", fontWeight: "bold", color: "white", textAlign: "center", textTransform: "uppercase" };

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

  for (const one of rankings) {
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

    rows.push(
      <TableRow key={ bot }>
        <TableCell>{ rank }</TableCell>
        <TableCell component="th" scope="row">
          <img src={ "/" + one.race + ".png" } width="17" style={{ position: "relative", top: "4px", marginRight: "5px" }} />
          <Link to={ path }>{ bot }</Link>
        </TableCell>
        <TableCell>{ one.winRate.toFixed(2) }%</TableCell>
        <TableCell>{ one.elo }</TableCell>
        <TableCell><Army army={ one.armyBuild } /></TableCell>
        <TableCell><Rating capacity={ one.militaryCapacity } performance={ one.militaryPerformance } /></TableCell>
        <TableCell><Rating capacity={ one.economyCapacity } performance={ one.economyPerformance } /></TableCell>
        <TableCell><Rating capacity={ one.technologyCapacity } performance={ one.technologyPerformance } /></TableCell>
      </TableRow>
    );

    if (one.division) rank++;
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
            <TableCell>Best build</TableCell>
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
