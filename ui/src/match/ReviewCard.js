import "./style.css";

export default function ReviewCard({ review }) {
  if (!review || !review.summary) return (<div />);

  const narrative = [];
  const scores = [];

  let index = 1;

  if (review.narrative) {
    for (const one of review.narrative) {
      narrative.push(
        <div key={ index++ }>
          <strong>[{ one.start }-{ one.end }]: { one.phase }</strong><br />
          <div className="match-review-card-details">{ one.description }<br />Aggressor: { one.aggressor }<br />{ one.evidence }</div>
        </div>
      );
    }
  }

  const scorecard = review.scorecard || review;

  for (const key in scorecard) {
    const one = scorecard[key];
    if (!one.score) continue;

    const label = key.charAt(0).toUpperCase() + key.slice(1);

    scores.push(
      <div key={ index++ }>
        <strong>{ label }: { one.score }</strong><br />
        <div className="match-review-card-details">{ one.observations }<br />{ one.conclusion }</div>
      </div>
    );
  }

  return (
    <div className="match-review-card">
      { review.summary }

      <span className="match-review-card-model"
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
        <h5>{ review.title }</h5>
        <p>{ review.teaser }</p>
        { narrative }
      </div>

      <span style={{ fontSize: "80%", color: "gray" }}>
        { review.tokens || "?" } tokens
        &nbsp;
        { review.millis || "?" } millis
      </span>

      <div style={{ clear: "both" }}></div>
    </div>
  );
}
