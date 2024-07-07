import { Link } from "react-router-dom";

const COLOR_GRAY = "gray";
const COLOR_GREEN = "#00AA00";
const COLOR_RED = "#AA0000";

export default function MatchCell({ bot, match, text }) {
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
    const linkStyle = { color: status, textDecoration: "none" };

    if (text) {
      linkStyle.backgroundColor = status;
      linkStyle.color = "white";
      linkStyle.padding = (String(text).length > 1) ? "3px" : "3px 7px";
      linkStyle.borderRadius = "3px";

      return (
        <Link to={ path } style={ linkStyle }>{ text }</Link>
      );
    } else {
      linkStyle.color = status;
      linkStyle.padding = "0px 3px";

      return (
        <Link to={ path } style={ linkStyle }>&#11044;</Link>
      );
    }
  }

  return (
    <span>{ text ? text : "-" }</span>
  );
}
