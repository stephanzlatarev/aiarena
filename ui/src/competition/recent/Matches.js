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
  const reviews = [];

  for (const key in match) {
    if (key === "summary") continue;

    const value = match[key];

    if (value && value.summary) {
      reviews.push(<ReviewCard key={ key } match={ match } review={ value } />);
    }
  }

  return (
    <div className="match-card">
      <Link className="match-card-link" to={ `/bot/${match.winner}/match/${match.match}` }>
        <span className="match-card-header">Match { match.match }</span>
        <span className="match-card-header italic">{ new Date(match.time).toLocaleString() }</span>
        <span className="match-card-header"><strong>{ match.winner }</strong> vs <strong>{ match.opponent }</strong></span>
        <span className="match-card-header">{ match.map }</span>
        <span className="match-card-header">Duration { match.duration }</span>
      </Link>

      { reviews }
    </div>
  );
}

function ReviewCard({ match, review }) {
  const scores = [];

  for (const key in review) {
    const one = review[key];
    const label = key.charAt(0).toUpperCase() + key.slice(1);

    if (!one.score) continue;

    scores.push(
      <div key={ key }>
        <strong>{ label }: { one.score }</strong><br />
        <div className="match-card-details">{ one.observations }<br />{ one.conclusion }</div>
      </div>
    );
  }

  return (
    <div className="match-card-summary">
      <Link className="match-card-link" to={ `/bot/${match.winner}/match/${match.match}` }>
        { review.summary }
      </Link>

      <span className="match-card-model"
        onClick={e => {
          e.stopPropagation();
          const el = e.target.nextSibling;
          if (el) el.style.display = el.style.display === "block" ? "none" : "block";
        }}
      >
        { review.model }
      </span>
      <div style={{ width: "100%", display: "none" }}>
        { scores }

        <span style={{ float: "right" }}>Processing time: { (review.processingTime / 1000).toFixed(2) } seconds</span>
      </div>
    </div>
  );
}
