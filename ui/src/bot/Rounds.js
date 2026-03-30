import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import MatchCell from "../MatchCell";
import { SmallScreen } from "../screen";

export default function Rounds({ bot, matches, ranking, opponents }) {
  const [isFlipped, setIsFlipped] = useState(() => {
    return (window && window.localStorage) && (window.localStorage.getItem("rounds.flip") === "true");
  });

  useEffect(() => {
    if (window && window.localStorage) {
      window.localStorage.setItem("rounds.flip", String(isFlipped));
    }
  }, [isFlipped]);

  const style = { margin: "0px", padding: "1px", textAlign: "center" };
  const bots = new Map();

  let rounds = 0;
  let key = 1;

  for (const opponent of opponents) {
    if ((opponent.bot !== bot) && (!SmallScreen || (opponent.division === ranking.division))) {
      bots.set(opponent.bot, { opponent: opponent.bot, elo: opponent.elo, cells: [], count: 0, results: [], wins: 0 });
    }
  }

  for (const match of matches) {
    const info = bots.get(match.opponent);

    if (info) {
      rounds = Math.max(match.round, rounds);

      info.count++;

      if (match.winner === bot) {
        info.wins++;
        info.results[match.round] = 1;
      } else {
        info.results[match.round] = -1;
      }

      info.cells[match.round] = (<MatchCell bot={ bot } match={ match } />);
    }
  }

  const opponentNames = [...bots.values()].filter(info => (info.count > 0)).sort((a, b) => (a.elo - b.elo)).map(info => info.opponent);
  if (!SmallScreen) opponentNames.reverse();

  const roundsList = [];

  for (let i = rounds - 1; i >= 0; i--) {
    const round = i + 1;
    const cells = [];
    let hasOpponentsInThisRound = false;

    for (const opponent of opponentNames) {
      const info = bots.get(opponent);

      if (info && info.cells[round]) {
        cells.push(info.cells[round]);
        hasOpponentsInThisRound = true;
      } else {
        cells.push("");
      }
    }

    if (hasOpponentsInThisRound) {
      roundsList.push({ number: round, style, cells });
    }
  }

  const cols = [];
  const rows = [];

  if (SmallScreen || isFlipped) {
    // Rows are rounds. Columns are opponents.
    for (const round of roundsList) {
      rows.push(
        <TableRow key={ key++ }>
          <TableCell style={ round.style }>{ round.number }</TableCell>
          { round.cells.map(one => (<TableCell key={ key++ } style={ { margin: "0px", padding: "1px", textAlign: "center" } }>{ one }</TableCell>)) }
        </TableRow>
      );
    }

    const verticalTextStyle = { ...style, writingMode: "vertical-lr", textOrientation: "sideways", textAlign: "right", paddingBottom: "0.5rem" };
    for (const opponent of opponentNames) {
      cols.push(<TableCell key={ key++ } style={ verticalTextStyle }>{ opponent }</TableCell>);
    }
  } else {
    // Rows are opponents. Columns are rounds.
    const rightTextStyle = { ...style, textAlign: "right" };

    for (let i = 0; i < opponentNames.length; i++) {
      const name = opponentNames[i];
      const cells = roundsList.map(round => round.cells[i]);

      rows.push(
        <TableRow key={ key++ }>
          <TableCell style={ { ...rightTextStyle, margin: "0px", padding: "1px", paddingRight: "5px" } }>{ name }</TableCell>
          { cells.map(one => (<TableCell key={ key++ } style={ { margin: "0px", padding: "1px", textAlign: "center" } }>{ one }</TableCell>)) }
        </TableRow>
      );
    }

    for (const round of roundsList) {
      cols.push(<TableCell key={ key++ } style={ style }>{ round.number }</TableCell>);
    }
  }

  const headerCellStyle = isFlipped
    ? { ...style, textAlign: "left", verticalAlign: "top", writingMode: "vertical-lr", textOrientation: "sideways" }
    : { ...style, textAlign: "left", verticalAlign: "top" };
  const headerButtonStyle = isFlipped
    ? { display: "inline-block", transform: "rotate(45deg)" }
    : { display: "inline-block", transform: "rotate(-45deg)" };
  const headerCell = SmallScreen
    ? (
      <TableCell style={ style }>
        Round
      </TableCell>
    )
    : (
      <TableCell style={ headerCellStyle }>
        <button type="button" title="Flip table" aria-pressed={ isFlipped } onClick={ () => setIsFlipped(value => !value) }>
          <span style={ headerButtonStyle }>⇄</span>
        </button>
        &nbsp;
        Round
      </TableCell>
    );

  return (
    <TableContainer component={ Paper }>
      <Table>
        <TableHead>
          <TableRow>
            { headerCell }
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
