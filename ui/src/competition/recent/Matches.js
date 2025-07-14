import { Link } from "react-router-dom";
import "./style.css";

export default function Matches({ matches }) {
  const rows = matches.map((match) => (<MatchCard key={ match.time } match={ match } />));

  return (
    <div>
      { rows }
    </div>
  );
}

function MatchCard({ match }) {
  return (
    <Link className="match-card-link" to={ `/bot/${match.winner}/match/${match.match}` }>
      <div className="match-card">
        <span className="match-card-match">Match { match.match }</span>
        <span className="match-card-time">{ new Date(match.time).toLocaleString() }</span>
        <span className="match-card-players"><strong>{ match.winner }</strong> vs <strong>{ match.opponent }</strong></span>

        <div className="match-card-summary">{ match.summary.summary }</div>
      </div>
    </Link>
  );
}
