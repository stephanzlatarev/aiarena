import * as React from "react";
import { Await, defer, useLoaderData } from "react-router-dom";
import Api from "../Api";
import Match from "../Match";

export function MatchLoader({ params }) {
  return defer({
    bot: params.bot,
    match: Api.get("match/" + params.match),
  });
}

export function MatchPage() {
  const data = useLoaderData();

  return (
    <React.Suspense fallback={ <div>Loading info...</div> } >
      <Await resolve={ Promise.all([data.bot, data.match]) } errorElement={ <div>Error loading info!</div> }>
        { ([bot, match]) => (<Match bot={ bot } match={ match } />) }
      </Await>
    </React.Suspense>
  );
}
