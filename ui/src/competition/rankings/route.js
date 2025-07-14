import * as React from "react";
import { Await, defer, useLoaderData } from "react-router-dom";
import Api from "../../Api";
import Rankings from "./Rankings";

export function RankingsLoader() {
  return defer({
    rankings: Api.get("rankings"),
  });
}

export function RankingsPage() {
  const data = useLoaderData();

  return (
    <React.Suspense fallback={ <div>Loading rankings...</div> } >
      <Await resolve={ data.rankings } errorElement={ <div>Error loading rankings!</div> }>
        { (rankings) => (<Rankings rankings={ rankings } />) }
      </Await>
    </React.Suspense>
  );
}
