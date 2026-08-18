// src/components/Navbar.js
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  Stack,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Logo from "./Logo";
import { useColorMode } from "../theme/ThemeContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();

  
  const LoginButton = () => (
    <Button
      component={Link}
      to="/login"
      onClick={() => setOpen(false)}
      disableRipple
      sx={{
        position: "relative",
        color: location.pathname === "/login" ? theme.palette.text.primary : theme.palette.text.secondary,
        fontWeight: 600,
        textTransform: "none",
        fontSize: "0.95rem",
        px: 1,
        "&:hover": { background: "transparent", color: theme.palette.text.primary },
        "&::after": {
          content: '""',
          position: "absolute",
          left: 8,
          right: 8,
          bottom: 4,
          height: "2px",
          borderRadius: "2px",
          background: theme.palette.primary.main,
          transform: "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.25s ease",
        },
        "&:hover::after": { transform: "scaleX(1)" },
      }}
    >
      Login
    </Button>
  );

  
  const SignUpButton = () => (
    <Button
      component={Link}
      to="/signup"
      onClick={() => setOpen(false)}
      disableRipple
      endIcon={
        <ArrowForwardIcon
          className="su-arrow"
          sx={{ fontSize: 16, ml: -0.5, opacity: 0, transform: "translateX(-6px)", transition: "opacity 0.25s ease, transform 0.25s ease" }}
        />
      }
      sx={{
        position: "relative",
        color: "#fff",
        fontWeight: 700,
        textTransform: "none",
        fontSize: "0.95rem",
        borderRadius: "999px",
        px: 2.6,
        py: 0.9,
        background: "linear-gradient(90deg, #0d9488, #10b981)",
        boxShadow: "0 6px 16px rgba(16,185,129,0.35)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease, background 0.25s ease",
        "&:hover": {
          background: "linear-gradient(90deg, #0f766e, #059669)",
          transform: "translateY(-2px)",
          boxShadow: `0 0 0 4px ${theme.palette.mode === "dark" ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.18)"}, 0 10px 22px rgba(16,185,129,0.4)`,
        },
        "&:hover .su-arrow": { opacity: 1, transform: "translateX(0)" },
      }}
    >
      Sign Up
    </Button>
  );

  const ThemeToggle = () => (
    <IconButton
      onClick={toggleColorMode}
      sx={{ color: theme.palette.text.primary, border: `1px solid ${theme.palette.divider}`, borderRadius: "10px" }}
      aria-label="Toggle theme"
    >
      {mode === "dark" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
    </IconButton>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: theme.custom.navBg,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
        <Logo size="md" />

        <Stack direction="row" spacing={2} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
          <LoginButton />
          <SignUpButton />
          <ThemeToggle />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ display: { xs: "flex", md: "none" } }}>
          <ThemeToggle />
          <IconButton onClick={() => setOpen(true)} sx={{ color: theme.palette.text.primary }}>
            <MenuIcon />
          </IconButton>
        </Stack>
      </Toolbar>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: "72%", maxWidth: 300, background: theme.palette.background.default, p: 3 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Logo size="sm" />
          <IconButton onClick={() => setOpen(false)} sx={{ color: theme.palette.text.primary }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Stack spacing={2.5} alignItems="flex-start">
          <LoginButton />
          <SignUpButton />
        </Stack>
      </Drawer>
    </AppBar>
  );
}