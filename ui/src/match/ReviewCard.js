import "./style.css";

export default function ReviewCard({ review }) {
  if (!review || !review.summary) return (<div />);

  const scores = [];

  for (const key in review) {
    const one = review[key];
    const label = key.charAt(0).toUpperCase() + key.slice(1);

    if (!one.score) continue;

    scores.push(
      <div key={ key }>
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
      </div>
    </div>
  );
}
