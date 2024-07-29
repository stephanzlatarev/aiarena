import { Link } from "react-router-dom";

const COLOR_GRAY = "gray";
const COLOR_GREEN = "#00AA00";
const COLOR_RED = "#AA0000";

export default function MatchCell({ bot, match, text, background }) {
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

      if (text >= 100) {
        linkStyle.fontSize = "0.66em";
      }

      return (
        <Link to={ path } style={ linkStyle }>{ text }</Link>
      );
    } else {
      linkStyle.backgroundColor = background ? background : "white";
      linkStyle.color = status;
      linkStyle.padding = "0px 3px";

      return (
        <Link to={ path } style={ linkStyle }>&#11044;</Link>
      );
    }
  }

  if (text >= 100) {
    return (
      <span style={{ fontSize: "0.9em" }}>{ text }</span>
    );
  } else if (text) {
    return (<span>{ text }</span>);
  } else {
    const color = background ? background : "white";

    return (
      <span style={{ padding: "0px 3px", color: color, backgroundColor: color }}>&#11044;</span>
    );
  }
}
