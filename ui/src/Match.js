import * as React from "react";
import { useAsyncValue } from "react-router-dom";

export default function Match() {
  const match = useAsyncValue();

  return (
    <div>Match { match.match } on { match.map }</div>
  );
}
