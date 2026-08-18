// src/components/TourGuideBot.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  Stack,
  Chip,
  Fade,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const SEEN_KEY = "careerpilot_home_tour_seen";


const NODES = {
  root: {
    bot: "Hey! I'm your CareerPilot guide 👋 Want a quick tour, or should I get out of your way?",
    options: [
      { label: "What is CareerPilot?", next: "what" },
      { label: "How does it work?", next: "how" },
      { label: "Just let me explore", next: "bye" },
    ],
  },
  what: {
    bot: "CareerPilot compares your resume against any job description using AI — it shows what matches, what's missing, and how to fix it.",
    options: [
      { label: "See the features →", next: "features", action: "scroll-features" },
      { label: "How do I start?", next: "how" },
    ],
  },
  how: {
    bot: "Three steps: upload your resume, paste the job description, and get an instant match score with an action plan.",
    options: [
      { label: "Show me how it works →", next: "steps", action: "scroll-steps" },
      { label: "I'm ready — sign me up", next: "signup", action: "goto-signup" },
    ],
  },
  features: {
    bot: "That's the 'How It Works' section just below — take a look, then come back anytime 🙂",
    options: [{ label: "Got it, thanks!", next: "bye" }],
  },
  steps: {
    bot: "Scrolled you there! Ready to try it for real?",
    options: [
      { label: "Create free account →", next: "signup", action: "goto-signup" },
      { label: "Not yet, just browsing", next: "bye" },
    ],
  },
  signup: {
    bot: "Taking you to sign up — see you on the other side! 🚀",
    options: [],
  },
  bye: {
    bot: "All good — I'll be right here (bottom-right corner) if you need me later.",
    options: [{ label: "Restart tour", next: "root" }],
  },
};

export default function TourGuideBot() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [nodeKey, setNodeKey] = useState("root");
  const [history, setHistory] = useState([NODES.root]);

  // Auto-open once for first-time visitors
  useEffect(() => {
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const markSeen = () => localStorage.setItem(SEEN_KEY, "1");

  const handleOpen = () => {
    setOpen(true);
    markSeen();
  };

  const handleClose = () => {
    setOpen(false);
    markSeen();
  };

  const runAction = (action) => {
    if (action === "scroll-features") {
      document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" });
    }
    if (action === "scroll-steps") {
      document.getElementById("how-it-works-section")?.scrollIntoView({ behavior: "smooth" });
    }
    if (action === "goto-signup") {
      setTimeout(() => navigate("/signup"), 500);
    }
  };

  const handleOption = (opt) => {
    runAction(opt.action);
    const nextNode = NODES[opt.next];
    setNodeKey(opt.next);
    setHistory((h) => [...h, nextNode]);
  };

  const current = NODES[nodeKey];

  return (
    <>
      {/* Floating trigger button */}
      {!open && (
        <Fab
          onClick={handleOpen}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1300,
            background: theme.palette.primary.main,
            color: "#fff",
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
            "&:hover": { background: theme.palette.primary.dark || theme.palette.primary.main },
          }}
          aria-label="Open site guide"
        >
          <ChatBubbleOutlineIcon />
        </Fab>
      )}

      <Fade in={open}>
        <Paper
          elevation={0}
          sx={{
            display: open ? "flex" : "none",
            flexDirection: "column",
            position: "fixed",
            bottom: 24,
            right: 24,
            width: 320,
            maxWidth: "90vw",
            maxHeight: 420,
            borderRadius: "16px",
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default,
            boxShadow: theme.custom.cardShadow,
            zIndex: 1300,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoAwesomeIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: theme.palette.text.primary }}>
                Site Guide
              </Typography>
            </Stack>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Conversation */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2 }}>
            <Stack spacing={2}>
              {history.map((node, i) => (
                <Box key={i}>
                  <Box
                    sx={{
                      backgroundColor: theme.custom.glass,
                      border: `1px solid ${theme.custom.glassBorder}`,
                      borderRadius: "12px",
                      p: 1.5,
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.85rem", color: theme.palette.text.primary }}>
                      {node.bot}
                    </Typography>
                  </Box>
                  {i === history.length - 1 && (
                    <Stack spacing={1} alignItems="flex-start">
                      {node.options.map((opt) => (
                        <Chip
                          key={opt.label}
                          label={opt.label}
                          onClick={() => handleOption(opt)}
                          clickable
                          sx={{
                            backgroundColor: theme.custom.chipBg,
                            color: theme.custom.chipText,
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            justifyContent: "flex-start",
                            "&:hover": { backgroundColor: theme.palette.primary.main, color: "#fff" },
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}