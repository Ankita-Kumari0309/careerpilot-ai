// src/theme/ThemeContext.js
import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ColorModeContext = createContext({ mode: "light", toggleColorMode: () => {} });
export const useColorMode = () => useContext(ColorModeContext);


export const gradients = {
  primary: "linear-gradient(90deg, #0d9488, #10b981)",
  primaryText: "linear-gradient(90deg, #0d9488, #0ea5e9)",
  accentGlow: "linear-gradient(135deg, #2dd4bf, #10b981, #0ea5e9)",
};

function getDesignTokens(mode) {
  const isDark = mode === "dark";
  return {
    palette: {
      mode,
      primary: { main: "#10b981" },
      secondary: { main: "#0ea5e9" },
      background: {
        default: isDark ? "#0a1412" : "#f7fbfa",
        paper: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.75)",
      },
      text: {
        primary: isDark ? "#f0fdf9" : "#0f1e1b",
        secondary: isDark ? "#9cb8b0" : "#5c6f6a",
      },
      divider: isDark ? "rgba(255,255,255,0.08)" : "#e6f2ee",
    },
    custom: {
      glass: isDark
        ? "rgba(255,255,255,0.05)"
        : "rgba(255,255,255,0.7)",
      glassBorder: isDark ? "rgba(255,255,255,0.10)" : "rgba(15,30,27,0.06)",
      chipBg: isDark ? "rgba(45,212,191,0.14)" : "#e6f7f2",
      chipText: isDark ? "#a7f3d0" : "#0f766e",
      navBg: isDark ? "rgba(10,20,18,0.7)" : "rgba(255,255,255,0.75)",
      glow1: isDark ? "rgba(16,185,129,0.28)" : "rgba(16,185,129,0.18)",
      glow2: isDark ? "rgba(14,165,233,0.20)" : "rgba(14,165,233,0.12)",
      cardShadow: isDark
        ? "0 20px 50px rgba(0,0,0,0.45)"
        : "0 20px 45px rgba(15,30,27,0.10)",
    },
    typography: {
      fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    },
    shape: { borderRadius: 14 },
  };
}

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem("careerpilot-theme") || "light");

  useEffect(() => {
    localStorage.setItem("careerpilot-theme", mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [mode]
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}