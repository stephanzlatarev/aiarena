import * as React from "react";
import { useState, useEffect } from "react";
import { SmallScreen } from "./screen";

const LINE_STYLES = {
  A: { color: "black", dashArray: null, label: "Overall" },
  M: { color: "#666666", dashArray: "5,3", label: "Average" },
  P: { color: "#ff9900", dashArray: null, label: "vs Protoss" },
  T: { color: "#3366cc", dashArray: null, label: "vs Terran" },
  Z: { color: "#9933cc", dashArray: null, label: "vs Zerg" },
  R: { color: "#33aa33", dashArray: null, label: "vs Random" },
};

export default function BotElo({ elo }) {
  const [width, setWidth] = useState(window.innerWidth - 48);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth - 48);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!elo) {
    return <p style={{ margin: "1rem" }}>No Elo data available yet</p>;
  }

  const series = ["A", "M", "Z", "T", "P", "R"];
  const height = SmallScreen ? 440 : 420;
  const padding = { top: SmallScreen ? 60 : 40, right: 20, bottom: 40, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find min/max values and round range
  let minElo = Infinity;
  let maxElo = -Infinity;
  let maxRound = 0;

  for (const key of series) {
    const data = elo[key];
    if (!data) continue;
    for (let i = 0; i < data.length; i++) {
      if (data[i] !== null) {
        minElo = Math.min(minElo, data[i]);
        maxElo = Math.max(maxElo, data[i]);
        maxRound = Math.max(maxRound, i);
      }
    }
  }

  // Add padding to Elo range and round to nice numbers
  const eloRange = maxElo - minElo;
  minElo = Math.floor((minElo - eloRange * 0.1) / 50) * 50;
  maxElo = Math.ceil((maxElo + eloRange * 0.1) / 50) * 50;

  const scaleX = (round) => padding.left + (round / maxRound) * chartWidth;
  const scaleY = (value) => padding.top + chartHeight - ((value - minElo) / (maxElo - minElo)) * chartHeight;

  // Generate grid lines and labels
  const gridLines = [];
  const gridStep = 50;
  for (let elo = minElo; elo <= maxElo; elo += gridStep) {
    const y = scaleY(elo);
    gridLines.push(
      <g key={ "grid-" + elo }>
        <line x1={ padding.left } y1={ y } x2={ width - padding.right } y2={ y } stroke="#e0e0e0" strokeWidth="1" />
        <text x={ padding.left - 8 } y={ y + 4 } textAnchor="end" fontSize="12" fill="#666">{ elo }</text>
      </g>
    );
  }

  // Generate round labels on x-axis
  const roundLabels = [];
  const roundStep = Math.max(1, Math.ceil(maxRound / 10));
  for (let r = 0; r <= maxRound; r += roundStep) {
    const x = scaleX(r);
    roundLabels.push(
      <text key={ "round-" + r } x={ x } y={ height - padding.bottom + 20 } textAnchor="middle" fontSize="12" fill="#666">{ r }</text>
    );
  }

  // Generate lines for each series
  const lines = series.map((key) => {
    const data = elo[key];
    if (!data) return null;

    const style = LINE_STYLES[key];
    const points = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i] !== null) {
        points.push({ round: i, value: data[i] });
      }
    }

    if (points.length < 2) return null;

    const pathData = points.map((p, idx) => {
      const x = scaleX(p.round);
      const y = scaleY(p.value);
      return (idx === 0 ? "M" : "L") + x + "," + y;
    }).join(" ");

    return (
      <path
        key={ key }
        d={ pathData }
        fill="none"
        stroke={ style.color }
        strokeWidth="2"
        strokeDasharray={ style.dashArray }
      />
    );
  });

  // Generate legend (horizontal at top, 2 lines on small screens)
  const legendItemWidth = 130;
  const legend = series.map((key, idx) => {
    const style = LINE_STYLES[key];
    const data = elo[key];
    let latestValue = null;
    if (data) {
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i] !== null) {
          latestValue = data[i];
          break;
        }
      }
    }
    let row, col;
    if (SmallScreen) {
      // Row 0: A, M, R (indices 0, 1, 5). Row 1: P, T, Z (indices 2, 3, 4)
      if (idx < 2) {
        row = 0;
        col = idx;
      } else if (idx === 5) {
        row = 0;
        col = 2;
      } else {
        row = 1;
        col = idx - 2;
      }
    } else {
      row = 0;
      col = idx;
    }
    const itemsInRow = SmallScreen ? 3 : 6;
    const rowStartX = (width - itemsInRow * legendItemWidth) / 2;
    const x = rowStartX + col * legendItemWidth;
    const y = 14 + row * 20;
    const label = latestValue !== null ? `${style.label} (${latestValue})` : style.label;
    return (
      <g key={ "legend-" + key }>
        <line
          x1={ x }
          y1={ y }
          x2={ x + 20 }
          y2={ y }
          stroke={ style.color }
          strokeWidth="2"
          strokeDasharray={ style.dashArray }
        />
        <text x={ x + 25 } y={ y + 4 } fontSize="12" fill="#333">{ label }</text>
      </g>
    );
  });

  return (
    <div>
      <p style={{ margin: "1rem" }}>
        Elo rating lines are smoother than those at AI Arena because here we calculate them by round, while AI Arena calculates Elo rating by match.
        Overall rating corresponds to the Elo rating in AI Arena.
        Average rating is the mean of the four race matchup ratings.
      </p>
      <svg width={ width } height={ height }>
        { gridLines }
        { roundLabels }
        <text x={ width / 2 } y={ height - 5 } textAnchor="middle" fontSize="12" fill="#666">Round</text>
        { lines }
        { legend }
      </svg>
    </div>
  );
}
