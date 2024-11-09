import { Link } from "react-router-dom";

const COLOR_GREEN = "#00AA00";
const COLOR_YELLOW = "#FFD700";
const COLOR_RED = "#AA0000";

export default function MatchCell({ bot, match, text, background }) {
  let status = COLOR_YELLOW;

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

      if (status === COLOR_YELLOW) {
        linkStyle.borderRadius = "5px";
      } else if (status === COLOR_GREEN) {
        linkStyle.borderRadius = "10px";
      }

      if (text >= 100) {
        linkStyle.fontSize = "0.66em";
      }

      return (
        <Link to={ path } style={ linkStyle }>{ text }</Link>
      );
    } else {
      linkStyle.backgroundColor = status;
      linkStyle.color = status;
      linkStyle.padding = "0px 0.5em";

      if (status === COLOR_YELLOW) {
        return (
          <div style={{ display: "inline-block", width: "18.5px", transform: "scale(0.75) rotate(45deg)" }}>
            <Link to={ path } style={ linkStyle }>&nbsp;</Link>
          </div>
        );
      } else if (status === COLOR_GREEN) {
        linkStyle.borderRadius = "10px";
      }

      return (
        <Link to={ path } style={ linkStyle }>&nbsp;</Link>
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
