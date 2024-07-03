import { Link } from "react-router-dom";
import TableCell from "@mui/material/TableCell";

const COLOR_GRAY = "gray";
const COLOR_GREEN = "#00AA00";
const COLOR_RED = "#AA0000";

export default function MatchCell({ bot, match, style }) {
  const cellStyle = style ? { ...style, textAlign: "center" } : { textAlign: "center" };

  if (!match) {
    return (<TableCell style={ cellStyle }>-</TableCell>);
  }

  const path = "/bot/" + bot + "/match/" + match.match;
  const decoration = match.warnings.length ? "line-through" : "none";

  let status = COLOR_GRAY;

  if (bot === match.winner) {
    status = COLOR_GREEN;
  } else if (match.winner && match.winner.length) {
    status = COLOR_RED;
  }

  const linkStyle = { color: status, textDecoration: decoration, textDecorationColor: "white", textDecorationStyle: "wavy", textDecorationThickness: "1.8px" };

  return (
    <TableCell style={ cellStyle }>
      <Link to={ path } style={ linkStyle }>&#11044;</Link>
    </TableCell>
  );
}
