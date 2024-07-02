import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Route, RouterProvider, Outlet, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { Await, defer, useAsyncValue, useLoaderData } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@mui/material/styles";
import Api from "./Api";
import Bot from "./Bot";
import Feedback from "./Feedback";
import Header from "./Header";
import Match from "./Match";
import Rankings from "./Rankings";
import theme from "./theme";

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

function Frame() {
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

  return (
    <React.Suspense fallback={ <div>Loading info...</div> } >
      <Await resolve={ data.info } errorElement={ <div>Error loading info!</div> }>
        { props.children }
      </Await>
    </React.Suspense>
  );
}

const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={ <Frame /> }>
    <Route index element={ <Loader><Rankings /></Loader> } loader={ () => defer({ info: Api.get("rankings") }) } />

    <Route path="bot/:bot">
      <Route index element={ <Loader><Bot /></Loader> } loader={ ({ params }) => defer({ info: Api.get("bot/" + params.bot) }) } />
      <Route path="match/:match" element={ <Loader><Match /></Loader> } loader={ ({ params }) => defer({ info: Api.get("match/" + params.match) }) } />
      <Route path="*" element={ <div>How did you get here?</div> } />
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
