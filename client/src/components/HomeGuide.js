// src/components/HomeGuide.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  useTheme,
  alpha,
  keyframes,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SendIcon from "@mui/icons-material/Send";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { auth } from "../firebase";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000";

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;
const bubbleIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
`;


export function GuideChecklist() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  const [status, setStatus] = useState(null); 
  const [dismissed, setDismissed] = useState(true); 
  const email = auth.currentUser?.email;

  useEffect(() => {
    if (!email) return;
    const key = `guideDismissed:${email}`;
    setDismissed(localStorage.getItem(key) === "true");

    fetch(`${API_BASE}/api/guide/status?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch((err) => console.error("Failed to load guide status:", err));
  }, [email]);

  if (!email || !status || dismissed) return null;

  const items = [
    { key: "resume_done", label: "Upload your resume", sub: "Get it analyzed against a job description", path: "/upload" },
    { key: "job_tracked", label: "Track a job", sub: "Save or apply to a listing from Job Search", path: "/jobsearch" },
    { key: "interview_done", label: "Practice an interview", sub: "Try a live mock interview round", path: "/interview-prep" },
  ];

  const doneCount = items.filter((i) => status[i.key]).length;
  if (doneCount === items.length) return null; 

  const handleDismiss = () => {
    localStorage.setItem(`guideDismissed:${email}`, "true");
    setDismissed(true);
  };

 
  const firstOpenIndex = items.findIndex((i) => !status[i.key]);

  const cardSx = {
    borderRadius: "16px",
    background: theme.custom?.glass || theme.palette.background.paper,
    backdropFilter: "blur(16px)",
    border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.2 : 0.14)}`,
    boxShadow: theme.custom?.cardShadow,
  };

  return (
    <Box sx={{ ...cardSx, p: 2.5, mb: 3, position: "relative", animation: `${fadeSlideUp} 0.4s ease` }}>
      <IconButton size="small" onClick={handleDismiss} sx={{ position: "absolute", top: 8, right: 8, color: theme.palette.text.secondary }}>
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.3 }}>
        Get set up
      </Typography>
      <Typography sx={{ fontSize: "0.8rem", color: theme.palette.text.secondary, mb: 2 }}>
        {doneCount} of {items.length} done
      </Typography>

      <Stack spacing={1}>
        {items.map((item, i) => {
          const done = status[item.key];
          const locked = !done && i !== firstOpenIndex;
          return (
            <Box
              key={item.key}
              onClick={() => !locked && navigate(item.path)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                p: 1.1,
                borderRadius: "10px",
                cursor: locked ? "default" : "pointer",
                opacity: locked ? 0.5 : 1,
                background: !done && i === firstOpenIndex ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                transition: "background 0.15s ease",
                "&:hover": locked ? {} : { background: alpha(theme.palette.primary.main, 0.12) },
              }}
            >
              {done ? (
                <CheckCircleIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
              )}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: "0.86rem", fontWeight: 600, color: theme.palette.text.primary, textDecoration: done ? "line-through" : "none" }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>
                  {item.sub}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}


export function AssistantBubble() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const email = auth.currentUser?.email;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = useCallback(
    async (text) => {
      const trimmed = (text ?? input).trim();
      if (!trimmed || sending) return;

      const nextMessages = [...messages, { role: "user", text: trimmed }];
      setMessages(nextMessages);
      setInput("");
      setSending(true);

      try {
        const res = await fetch(`${API_BASE}/api/assistant/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, message: trimmed, history: nextMessages }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      } catch (err) {
        console.error("Assistant chat failed:", err);
        setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I couldn't respond just now — try again in a moment." }]);
      } finally {
        setSending(false);
      }
    },
    [input, messages, sending, email]
  );

  const suggestions = ["How's my resume looking?", "What should I do next?", "Am I ready for an interview?"];

  const cardSx = {
    borderRadius: "16px",
    background: theme.custom?.glass || theme.palette.background.paper,
    backdropFilter: "blur(16px)",
    border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.2 : 0.14)}`,
    boxShadow: theme.custom?.cardShadow,
  };

  return (
    <>
      {open && (
        <Box
          sx={{
            position: "fixed",
            bottom: 96,
            right: 24,
            width: 340,
            maxWidth: "calc(100vw - 32px)",
            height: 440,
            display: "flex",
            flexDirection: "column",
            zIndex: 1300,
            ...cardSx,
            animation: `${popIn} 0.2s ease`,
            overflow: "hidden",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoAwesomeIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
              <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: theme.palette.text.primary }}>
                Career assistant
              </Typography>
            </Stack>
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
            </IconButton>
          </Stack>

          <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", px: 2, py: 1.5 }}>
            {messages.length === 0 && (
              <Stack spacing={1.5}>
                <Typography sx={{ fontSize: "0.82rem", color: theme.palette.text.secondary }}>
                  Ask me about your resume, job search, or interview prep.
                </Typography>
                <Stack spacing={0.8}>
                  {suggestions.map((s) => (
                    <Button
                      key={s}
                      size="small"
                      onClick={() => send(s)}
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        color: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.08),
                        borderRadius: "10px",
                        px: 1.4,
                        py: 0.9,
                        "&:hover": { background: alpha(theme.palette.primary.main, 0.14) },
                      }}
                    >
                      {s}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            )}

            <Stack spacing={1.2}>
              {messages.map((m, i) => (
                <Box
                  key={i}
                  sx={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    px: 1.5,
                    py: 0.9,
                    borderRadius: "12px",
                    background: m.role === "user" ? alpha(theme.palette.primary.main, 0.14) : isDark ? alpha("#fff", 0.05) : alpha("#000", 0.04),
                    animation: `${bubbleIn} 0.25s ease`,
                  }}
                >
                  <Typography sx={{ fontSize: "0.82rem", color: theme.palette.text.primary }}>{m.text}</Typography>
                </Box>
              ))}
              {sending && (
                <Box sx={{ alignSelf: "flex-start", px: 1.5, py: 0.9 }}>
                  <CircularProgress size={14} sx={{ color: theme.palette.text.secondary }} />
                </Box>
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}` }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask something…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "999px", background: isDark ? alpha("#fff", 0.04) : "#fafaff" },
                "& .MuiInputBase-input": { color: theme.palette.text.primary, fontSize: "0.85rem" },
              }}
            />
            <IconButton onClick={() => send()} disabled={sending || !input.trim()} sx={{ color: theme.palette.primary.main }}>
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </Box>
      )}

      <IconButton
        onClick={() => setOpen((o) => !o)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          zIndex: 1300,
          background: theme.palette.primary.main,
          color: "#fff",
          boxShadow: theme.custom?.cardShadow,
          transition: "transform 0.15s ease",
          "&:hover": { background: theme.palette.primary.main, transform: "translateY(-2px)" },
        }}
      >
        {open ? <CloseIcon /> : <ChatBubbleOutlineIcon />}
      </IconButton>
    </>
  );
}