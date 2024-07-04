
const armyStyle = { position: "relative", display: "flex", alignItems: "center" };
const iconStyle = { border: "solid goldenrod", borderRadius: "6px", marginRight: "3px" };
const countStyle = { fontSize: "28px" };
const crossStyle = { position: "absolute", left: "0px", top: "0px", width: "100%", height: "100%" };

export default function Army({ army, loss }) {
  if (!army) return null;

  const elements = [];
  let key = 1;

  if (Array.isArray(army)) {
    for (const unit of army) {
      elements.push(<UnitIcon key={ key++ } unit={ unit } />);
    }
  } else {
    const types = Object.keys(army).sort((a, b) => (army[b] - army[a]));

    for (const unit of types) {
      elements.push(<span key={ key++ } style={ countStyle }>{ army[unit] }</span>);
      elements.push(<UnitIcon key={ key++ } unit={ unit } />);
    }
  }

  if (loss) {
    elements.push(<Cross key={ key++ } size={ elements.length } />);
  }

  return (<div style={ armyStyle }>{ elements }</div>);
}

function UnitIcon({ unit }) {
  let icon = unit;

  if (unit.endsWith("Burrowed")) icon = unit.substring(0, unit.length - 8);
  if (unit.startsWith("Changeling")) icon = "Changeling";
  if (unit.endsWith("Flying")) icon = unit.substring(0, unit.length - 6);

  return (
    <img src={ "/unit/" + icon + ".webp" } title={ unit } alt={ unit } width="28" style={ iconStyle } />
  );
}

function Cross({ size }) {
  const width = size * 10;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={ "0 0 " + width + " 10" } style={ crossStyle }>
      <line x1="0" y1="10" x2={ width } y2="0" stroke="red" />
    </svg>
  );
}
