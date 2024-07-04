import { Link } from "react-router-dom";
import TableCell from "@mui/material/TableCell";

const COLOR_GRAY = "gray";
const COLOR_GREEN = "#00AA00";
const COLOR_RED = "#AA0000";

export default function MatchCell({ bot, match, text, style }) {
  const cellStyle = style ? { ...style, textAlign: "center" } : { textAlign: "center" };

  let status = COLOR_GRAY;

  if (match) {
    if (bot === match.winner) {
      status = COLOR_GREEN;
    } else if (match.winner && match.winner.length) {
      status = COLOR_RED;
    }
  }


  if (match) {
    const path = "/bot/" + bot + "/match/" + match.match;
    const decoration = (match.warnings && match.warnings.length) ? "line-through" : "none";
    const linkStyle = { color: status, textDecoration: decoration, textDecorationColor: "white", textDecorationStyle: "wavy", textDecorationThickness: "1.8px" };

    if (text) {
      linkStyle.backgroundColor = status;
      linkStyle.color = "white";
      linkStyle.padding = "3px";
      linkStyle.borderRadius = "3px";

      return (
        <TableCell style={ cellStyle }>
          <Link to={ path } style={ linkStyle }>{ text }</Link>
        </TableCell>
      );
    } else {
      linkStyle.color = status;

      return (
        <TableCell style={ cellStyle }>
          <Link to={ path } style={ linkStyle }>&#11044;</Link>
        </TableCell>
      );
    }
  }

  return (
    <TableCell style={ cellStyle }>{ text ? text : "-" }</TableCell>
  );
}
