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
        <strong>{ match.winner }</strong> vs <strong>{ match.opponent }</strong>

        <div className="match-card-summary">{ match.summary.summary }</div>
      </div>
    </Link>
  );
}
