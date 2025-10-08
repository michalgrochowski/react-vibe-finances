"use client";

import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { SessionProvider, useSession } from "next-auth/react";
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

function ThemeProviderInner({ children }: Props) {
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<PaletteMode>("light");
  const [isLoadingTheme, setIsLoadingTheme] = useState(true);

  // Load theme from profile when user is authenticated
  useEffect(() => {
    const loadThemeFromProfile = async () => {
      if (status === "loading") return;
      
      if (status === "authenticated" && session?.user?.id) {
        try {
          const response = await fetch("/api/profile");
          if (response.ok) {
            const profile = await response.json();
            const themePref = profile.themePref;
            
            if (themePref === "system") {
              // Use system preference
              const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
              setMode(prefersDark ? "dark" : "light");
            } else if (themePref === "light" || themePref === "dark") {
              setMode(themePref);
            }
          }
        } catch (error) {
          console.error("Failed to load theme preference:", error);
          // Fall back to localStorage or system preference
          const savedMode = localStorage.getItem("theme") as PaletteMode;
          if (savedMode && (savedMode === "light" || savedMode === "dark")) {
            setMode(savedMode);
          } else {
            const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
            setMode(prefersDark ? "dark" : "light");
          }
        } finally {
          setIsLoadingTheme(false);
        }
      } else {
        // Not authenticated - use localStorage or system preference
        const savedMode = localStorage.getItem("theme") as PaletteMode;
        if (savedMode && (savedMode === "light" || savedMode === "dark")) {
          setMode(savedMode);
        } else {
          const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
          setMode(prefersDark ? "dark" : "light");
        }
        setIsLoadingTheme(false);
      }
    };

    loadThemeFromProfile();
  }, [session, status]);

  const handleSetMode = async (newMode: PaletteMode) => {
    setMode(newMode);
    localStorage.setItem("theme", newMode);
    
    // Save to profile if user is authenticated
    if (session?.user?.id) {
      try {
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ themePref: newMode }),
        });
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }
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
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default function Providers({ children }: Props) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProviderInner>{children}</ThemeProviderInner>
      </QueryClientProvider>
    </SessionProvider>
  );
}


