import * as React from "react";
import { Await, Link, useAsyncValue, useLoaderData } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

export default function() {
  const rankings = useLoaderData();

  return (
    <React.Suspense fallback={ <div>Loading rankings...</div> } >
      <Await resolve={ rankings.info } errorElement={ <div>Error loading rankings!</div> }>
        <Rankings />
      </Await>
    </React.Suspense>
  );
}

function Rankings() {
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
      const separator = one.division ? "Division " + one.division : "Awaiting entry";

      rows.push(
        <TableRow key={ one.division }>
          <TableCell colSpan={ 9 } style={{ textAlign: "center" }}>{ separator }</TableCell>
        </TableRow>
      );

      division = one.division;
    }

    rows.push(
      <TableRow key={ bot }>
        <TableCell>{ rank++ }</TableCell>
        <TableCell component="th" scope="row">
          <img src={ one.race + ".png" } width="17" style={{ position: "relative", top: "4px", marginRight: "5px" }} />
          <Link to={ path }>{ bot }</Link>
        </TableCell>
        <TableCell>{ one.winRate.toFixed(2) }%</TableCell>
        <TableCell>{ one.elo }</TableCell>
        <TableCell>-</TableCell>
        <TableCell>-</TableCell>
        <TableCell>-</TableCell>
        <TableCell>-</TableCell>
      </TableRow>
    );
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
