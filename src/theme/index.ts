import { createTheme } from "@mui/material/styles";
import type { PaletteMode, Theme } from "@mui/material";

const lightBackground = {
  default: "#EEE8DE", // warm parchment from dobrywebdev
  paper: "#F6F2EA",
};

const darkBackground = {
  default: "#262B34", // deep slate from dobrywebdev
  paper: "#2E3440",
};

const lightText = {
  primary: "#232323", // dark text for light theme
  secondary: "#494949",
};

const darkText = {
  primary: "#E5E2DA", // light text for dark theme
  secondary: "#CFCABF",
};

const brand = {
  primary: "#2F3B46", // muted ink
  accent: "#9C8B72", // subtle bronze accent
};

// Border colors - contrasting with background
const lightBorder = "#232323"; // dark border for light theme
const darkBorder = "#E5E2DA"; // light border for dark theme

export function getTheme(mode: PaletteMode): Theme {
  const isLight = mode === "light";
  return createTheme({
    palette: {
      mode,
      primary: {
        main: brand.primary,
        contrastText: isLight ? "#F6F2EA" : "#E5E2DA",
      },
      secondary: {
        main: brand.accent,
      },
      background: isLight ? lightBackground : darkBackground,
      text: isLight ? lightText : darkText,
      divider: isLight ? "#D6D0C6" : "#3A404B",
    },
    typography: {
      fontFamily: "var(--font-geist-sans), system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      h1: { fontWeight: 700, letterSpacing: 0.2 },
      h2: { fontWeight: 700, letterSpacing: 0.2 },
      button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isLight ? lightBackground.default : darkBackground.default,
            color: isLight ? lightText.primary : darkText.primary,
          },
          "#__next": {
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: isLight ? lightBackground.default : darkBackground.default,
          },
          ".theme-wrapper": {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            border: `8px solid ${isLight ? lightBorder : darkBorder}`,
            margin: "8px",
            borderRadius: "4px",
            overflow: "hidden",
            minHeight: "calc(100vh - 16px)",
            backgroundColor: isLight ? lightBackground.paper : darkBackground.paper,
          },
          ".main-content": {
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: isLight ? lightBackground.paper : darkBackground.paper,
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: `1px solid ${isLight ? lightBorder : darkBorder}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderBottom: `1px solid ${isLight ? lightBorder : darkBorder}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
    },
  });
}


