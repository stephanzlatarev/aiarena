
export default function Army({ army }) {
  if (!army) return null;

  if (Array.isArray(army)) {
    return army.join(", ");
  }

  const types = Object.keys(army).sort((a, b) => (army[b] - army[a]));
  return types.map(type => army[type] + " " + type).join(", ");
}
