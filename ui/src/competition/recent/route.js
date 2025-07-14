import * as React from "react";
import { Await, defer, useLoaderData } from "react-router-dom";
import Api from "../../Api";
import Matches from "./Matches";

export function RecentMatchesLoader() {
  return defer({
    matches: Api.get("https://genai.superskill.me/timeline-summary/recent"),
  });
}

export function RecentMatchesPage() {
  const data = useLoaderData();

  return (
    <React.Suspense fallback={ <div>Loading recent matches...</div> } >
      <Await resolve={ data.matches } errorElement={ <div>Error loading recent matches!</div> }>
        { (matches) => (<Matches matches={ matches } />) }
      </Await>
    </React.Suspense>
  );
}
