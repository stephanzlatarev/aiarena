import * as React from "react";
import { NavLink, useParams } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const styleNavLink = { color: "white", textDecoration: "none" };
const styleSeparator = { color: "white", marginLeft: "0.5rem", marginRight: "0.5rem" };

export default function Header() {
  const { bot, match } = useParams();
  const links = [(
    <NavLink key="home" to="/" style={ styleNavLink }>
      AI Arena 2024 Season 3
    </NavLink>
  )];

  if (bot) {
    const path = "/bot/" + bot;
    links.push(
      <Typography key="separator-1" style={ styleSeparator }> / </Typography>,
      <NavLink key="bot" to={ path } style={ styleNavLink }>{ bot }</NavLink>
    );
  }

  if (match) {
    const path = "/bot/" + bot + "/match/" + match;
    links.push(
      <Typography key="separator-2" style={ styleSeparator }> / </Typography>,
      <NavLink key="match" to={ path } style={ styleNavLink }>Match { match }</NavLink>
    );
  }

  return (
    <AppBar position="static">
      <Toolbar>
        { links }
      </Toolbar>
    </AppBar>
  );
}
