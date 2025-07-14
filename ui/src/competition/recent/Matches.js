import { Link } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";

export default function Matches({ matches }) {
  const rows = [];

  for (const one of matches) {
    rows.push(
      <TableRow key={ one.time }>
        <TableCell style={{ padding: "1rem" }}><Link to={ `/bot/${one.winner}/match/${one.match}` }>{ one.match }</Link></TableCell>
        <TableCell>{ one.winner } vs { one.opponent }</TableCell>
        <TableCell>{ one.summary.summary }</TableCell>
      </TableRow>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableBody>
          { rows }
        </TableBody>
      </Table>
    </TableContainer>
  );
}
