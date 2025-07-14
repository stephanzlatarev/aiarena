import { Link } from "react-router-dom";
import "./style.css";

export default function Matches({ matches }) {
  const rows = matches.filter((match) => (typeof(match.summary?.summary) === "string")).map((match) => (<MatchCard key={ match.time } match={ match } />));

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
        <span className="match-card-header">Match { match.match }</span>
        <span className="match-card-header italic">{ new Date(match.time).toLocaleString() }</span>
        <span className="match-card-header"><strong>{ match.winner }</strong> vs <strong>{ match.opponent }</strong></span>
        <span className="match-card-header">{ match.map }</span>
        <span className="match-card-header">Duration { match.duration }</span>

        <div className="match-card-summary">{ match.summary.summary }</div>
      </div>
    </Link>
  );
}
