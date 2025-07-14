import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

export default function CompetitionTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = (location.pathname === "/recent") ? "/recent" : "/rankings";

  return (
    <Paper elevation={ 3 }>
      <Tabs value={ tab } onChange={ (_, tab) => navigate(tab) }>
        <Tab label="Rankings" value="/rankings" />
        <Tab label="Recent" value="/recent" />
      </Tabs>
      <Outlet />
    </Paper>
  );
}
