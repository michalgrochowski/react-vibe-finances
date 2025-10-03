"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PaletteMode, Theme } from "@mui/material";
import { getTheme } from "@/theme";

type ThemeContextType = {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

type Props = { children: React.ReactNode };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({ children }: Props) {
  const [mode, setMode] = useState<PaletteMode>("light");

  useEffect(() => {
    // Load saved theme preference or fall back to system preference
    const savedMode = localStorage.getItem("theme") as PaletteMode;
    if (savedMode && (savedMode === "light" || savedMode === "dark")) {
      setMode(savedMode);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  const handleSetMode = (newMode: PaletteMode) => {
    setMode(newMode);
    localStorage.setItem("theme", newMode);
  };

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    handleSetMode(newMode);
  };

  const theme: Theme = useMemo(() => getTheme(mode), [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      setMode: handleSetMode,
      toggleMode,
    }),
    [mode]
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeContext.Provider value={contextValue}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </ThemeContext.Provider>
      </QueryClientProvider>
    </SessionProvider>
  );
}


