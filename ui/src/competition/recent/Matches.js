import { useId } from "react";
import { Link } from "react-router-dom";
import "./style.css";

const LOOPS_PER_SECOND = 22.4;
const LOOPS_PER_MINUTE = LOOPS_PER_SECOND * 60;

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
    <div className="match-card">
      <Link className="match-card-link" to={ `/bot/${match.player1}/match/${match.match}` }>
        <h4>{ match.review.title }</h4>
        <StarRating score={ match.review.score || 0 } />

        <span className="match-card-header">Match { match.match }</span>
        <span className="match-card-header italic">{ new Date(match.time).toLocaleString() }</span>
        <span className="match-card-header"><strong>{ match.player1 }</strong> vs <strong>{ match.player2 }</strong></span>
        <span className="match-card-header">{ match.map }</span>
        <span className="match-card-header">Duration { clock(match.duration) }</span>

        <p>{ match.review.teaser }</p>
      </Link>
    </div>
  );
}

function StarRating({ score }) {
  const maxStars = 5;
  const ratingId = useId().replaceAll(":", "");
  const numericScore = Number.isFinite(score) ? score : Number.parseFloat(score);
  const clampedScore = Number.isFinite(numericScore) ? Math.min(Math.max(numericScore, 0), maxStars) : 0;
  const stars = Array.from({ length: maxStars });

  return (
    <div className="star-rating" aria-label={ `${clampedScore.toFixed(1)} out of ${maxStars}` }>
      { stars.map((_, index) => {
        const fill = Math.min(Math.max(clampedScore - index, 0), 1);

        return (
          <svg key={ index } viewBox="0 0 24 24" className="star-rating-star" aria-hidden="true">
            <path className="star-rating-empty" d="M12 2.25l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.15 6.16 20.22l1.11-6.5-4.72-4.6 6.53-.95L12 2.25z" />
            <clipPath id={ `${ratingId}-star-rating-fill-${index}` }>
              <rect x="0" y="0" width={ 24 * fill } height="24" />
            </clipPath>
            <path className="star-rating-fill" clipPath={ `url(#${ratingId}-star-rating-fill-${index})` } d="M12 2.25l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 17.15 6.16 20.22l1.11-6.5-4.72-4.6 6.53-.95L12 2.25z" />
          </svg>
        );
      }) }
    </div>
  );
}

function clock(loop) {
  if (loop >= 0) {
    const minutes = Math.floor(loop / LOOPS_PER_MINUTE);
    const seconds = Math.floor(loop / LOOPS_PER_SECOND) % 60;
    const mm = (minutes >= 10) ? minutes : "0" + minutes;
    const ss = (seconds >= 10) ? seconds : "0" + seconds;

    return `${mm}:${ss}`;
  }

  return "Unknown";
}
