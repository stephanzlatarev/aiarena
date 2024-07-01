import * as React from "react";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Paper from "@mui/material/Paper";
import Api from "./Api";

export default function Feedback() {
  const [message, setMessage] = React.useState(null);

  Api.listen(function(update) {
    if (update !== message) {
      setMessage(update);
  }});

  if (message === "Loading...") {
    return (<LinearProgress color="secondary" />);
  } else if (message) {
    return (<Paper elevation={3}> <Alert severity="warning">{ message }</Alert></Paper>);
  }

  return null;
}

