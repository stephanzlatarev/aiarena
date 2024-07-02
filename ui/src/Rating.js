
export default function Rating({ capacity, performance }) {
  capacity = (capacity > 0) ? Math.min(capacity, 100) : 0;
  performance = (performance > 0) ? Math.min(performance, 100) : 0;

  const dcolor = (performance > capacity) ? "#55D66C" : "#D6556C";

  return (
    <svg width="133" height="10" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="5" x2="100" y2="5"  style={{ stroke: "#CCCCDD", strokeWidth: 10, strokeDasharray: "9,1" }} />
      <line x1="0" y1="5" x2={ Math.max(capacity, performance) } y2="5"  style={{ stroke: dcolor, strokeWidth: 10, strokeDasharray: "9,1" }} />
      <line x1="0" y1="5" x2={ Math.min(capacity, performance) } y2="5"  style={{ stroke: "#556CD6", strokeWidth: 10, strokeDasharray: "9,1" }} />
      <text x="100" y="8" fill="black" fontSize="10">({performance.toFixed(1)})</text>
    </svg>
  );
}
