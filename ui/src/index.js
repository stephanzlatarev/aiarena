import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Route, RouterProvider, Outlet, createBrowserRouter, createRoutesFromElements, defer } from "react-router-dom";
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

const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={ <Frame /> }>
    <Route index element={ <Rankings /> } loader={ () => defer({ info: Api.get("rankings") }) } />

    <Route path="bot/:bot">
      <Route index element={ <Bot /> } loader={ ({ params }) => defer({ info: Api.get("bot/" + params.bot) }) } />
      <Route path="match/:match" element={ <Match /> } loader={ ({ params }) => defer({ info: Api.get("match/" + params.match) }) } />
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
