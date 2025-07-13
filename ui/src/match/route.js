import * as React from "react";
import { Await, defer, useLoaderData } from "react-router-dom";
import Api from "../Api";
import Match from "../Match";

export function MatchLoader({ params }) {
  return defer({
    bot: params.bot,
    info: Api.get("match/" + params.match),
    summary: Api.get("https://genai.superskill.me/timeline-summary/" + params.match)
  });
}

export function MatchPage() {
  const data = useLoaderData();
  const bot = data.bot;

  return (
    <React.Suspense fallback={ <div>Loading info...</div> } >
      <Await resolve={ Promise.all([data.info, data.summary]) } errorElement={ <div>Error loading info!</div> }>
        <Match bot={ bot } info={ data.info } summary={ data.summary } />
      </Await>
    </React.Suspense>
  );
}
