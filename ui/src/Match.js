import * as React from "react";
import { Await, useAsyncValue, useLoaderData } from "react-router-dom";

export default function() {
  const bot = useLoaderData();

  return (
    <React.Suspense fallback={ <div>Loading match info...</div> } >
      <Await resolve={ bot.info } errorElement={ <div>Error loading match info!</div> }>
        <Match />
      </Await>
    </React.Suspense>
  );
}

function Match() {
  const match = useAsyncValue();

  return (
    <div>Match { match.match } on { match.map }</div>
  );
}
