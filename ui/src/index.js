import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Route, RouterProvider, Outlet, createBrowserRouter, createRoutesFromElements, useLocation } from "react-router-dom";
import { Await, defer, useLoaderData } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@mui/material/styles";
import Api from "./Api";
import Bot from "./Bot";
import Feedback from "./Feedback";
import Header from "./Header";
import { MatchLoader, MatchPage } from "./match/route";
import { CompetitionLoader, CompetitionPage } from "./competition-ranking/route";
import theme from "./theme";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

function Frame() {
  const location = useLocation();
  React.useEffect(() => { window.scrollTo(0,0); }, [location]);

  return (
    <Container maxWidth={ false }>
      <Header />
      <Feedback />

      <Outlet />
    </Container>
  );
}

function Loader(props) {
  const data = useLoaderData();
  const bot = data.bot;
  const tab = data.tab;

  return (
    <React.Suspense fallback={ <div>Loading info...</div> } >
      <Await resolve={ data.info } errorElement={ <div>Error loading info!</div> }>
        { React.cloneElement(props.children, { bot, tab }) }
      </Await>
    </React.Suspense>
  );
}

const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={ <Frame /> }>
    <Route index element={ <CompetitionPage /> } loader={ CompetitionLoader } />

    <Route path="bot/:bot">
      <Route path=":tab?" element={ <Loader><Bot /></Loader> } loader={ ({ params }) => defer({ bot: params.bot, tab: params.tab, info: Api.get("bot/" + params.bot) }) } />
      <Route path="match/:match" element={ <MatchPage /> } loader={ MatchLoader } />
    </Route>

    <Route path="*" element={ <div>How did you get here?</div> } />
  </Route>
));

root.render(
  <ThemeProvider theme={ theme }>
    <CssBaseline />

    <RouterProvider router={ router } />
  </ThemeProvider>
);
