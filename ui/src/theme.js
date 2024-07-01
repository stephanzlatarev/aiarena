import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "0.4rem",
        },
      },
    },
  },
});

export default theme;
