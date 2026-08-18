// src/pages/InterviewPrep.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  TextField,
  Button,
  CircularProgress,
  useTheme,
  alpha,
  keyframes,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import EditNoteIcon from "@mui/icons-material/EditNote";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LanguageIcon from "@mui/icons-material/Language";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import { auth } from "../firebase";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000";

const DURATIONS = [10, 20, 30]; // minutes


const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function InterviewPrep() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const enter = (delay = 0) => (reduceMotion ? "none" : `${fadeSlideUp} 0.4s ease ${delay}s both`);

  const [mode, setMode] = useState(null); // "job" | "custom"
  const [customSubMode, setCustomSubMode] = useState("paste"); // "paste" | "topic"

  // mode: job
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");

  // mode: custom
  const [jdText, setJdText] = useState("");
  const [topicText, setTopicText] = useState("");
  const [customRole, setCustomRole] = useState("");

  const [duration, setDuration] = useState(20);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "job") return;
    const email = auth.currentUser?.email;
    if (!email) {
      setError("Please log in to prep against an applied job.");
      return;
    }
    setLoadingJobs(true);
    setError("");
    fetch(`${API_BASE}/api/tracker?email=${encodeURIComponent(email)}&status=applied`)
      .then((res) => res.json())
      .then((data) => setAppliedJobs(Array.isArray(data.jobs) ? data.jobs : []))
      .catch((err) => {
        console.error("Failed to load applied jobs:", err);
        setError("Couldn't load your applied jobs. Please try again.");
      })
      .finally(() => setLoadingJobs(false));
  }, [mode]);

  const selectedJob = appliedJobs.find((j) => (j._id || j.job_id) === selectedJobId);

  const canStart =
    !starting &&
    ((mode === "job" && !!selectedJob) ||
      (mode === "custom" &&
        customSubMode === "paste" &&
        jdText.trim().length > 0) ||
      (mode === "custom" &&
        customSubMode === "topic" &&
        topicText.trim().length > 0));

  const handleStart = async () => {
    const email = auth.currentUser?.email;
    if (!email) {
      setError("Please log in first.");
      return;
    }

    let payload;
    if (mode === "job" && selectedJob) {
      payload = {
        email,
        mode: "job",
        context: {
          role: selectedJob.title || selectedJob.job_title || "this role",
          company: selectedJob.company || "",
          jd_text: selectedJob.description || selectedJob.jd_text || selectedJob.job_description || "",
        },
      };
    } else if (mode === "custom" && customSubMode === "paste") {
      payload = {
        email,
        mode: "custom",
        context: {
          role: customRole.trim() || "this role",
          company: "",
          jd_text: jdText.trim(),
        },
      };
    } else if (mode === "custom" && customSubMode === "topic") {
      payload = {
        email,
        mode: "custom",
        context: {
          role: topicText.trim(),
          company: "",
          jd_text: "",
        },
      };
    } else {
      return;
    }

    setStarting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/interview/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server returned ${res.status}`);

      navigate("/interview-room", {
        state: {
          sessionId: data.session_id,
          firstQuestion: data.question,
          complete: data.complete,
          durationMinutes: duration,
        },
      });
    } catch (err) {
      console.error("Failed to start interview:", err);
      setError(err.message || "Couldn't start the interview. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  const cardSx = {
    p: 3,
    borderRadius: "16px",
    background: theme.custom?.glass || theme.palette.background.paper,
    backdropFilter: "blur(16px)",
    border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.2 : 0.14)}`,
    boxShadow: theme.custom?.cardShadow,
  };

  const modeCardSx = (active) => ({
    ...cardSx,
    cursor: "pointer",
    flex: 1,
    textAlign: "center",
    py: 4,
    transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
    borderColor: active ? theme.palette.primary.main : cardSx.border,
    boxShadow: active
      ? `${theme.custom?.cardShadow}, 0 0 0 2px ${alpha(theme.palette.primary.main, 0.35)}`
      : theme.custom?.cardShadow,
    "&:hover": { transform: "translateY(-3px)" },
    "&:hover .prep-mode-icon": { transform: "scale(1.12)" },
  });

  const pillSx = (active, disabled) => ({
    fontWeight: 700,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
    color: active ? "#fff" : theme.palette.text.primary,
    background: active
      ? theme.palette.primary.main
      : isDark
      ? "rgba(255,255,255,0.05)"
      : "#f0f0f5",
    border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
    transition: "background 0.15s ease, transform 0.15s ease",
    "&:hover": {
      background: disabled
        ? undefined
        : active
        ? theme.palette.primary.main
        : alpha(theme.palette.primary.main, 0.12),
      transform: disabled ? "none" : "translateY(-1px)",
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        py: { xs: 6, md: 8 },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -120,
          right: -120,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.custom?.glow1 || alpha(theme.palette.primary.main, 0.18)}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -160,
          left: -140,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, isDark ? 0.1 : 0.08)}, transparent 72%)`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        <Stack alignItems="center" textAlign="center" mb={4} spacing={1.2} sx={{ animation: enter(0) }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ color: theme.palette.primary.main + " !important" }} />}
            label="Interview prep"
            sx={{
              px: 1,
              color: theme.custom?.chipText,
              background: theme.custom?.chipBg,
              border: `1px solid ${theme.palette.divider}`,
              fontWeight: 600,
            }}
          />
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: "-0.02em", color: theme.palette.text.primary }}
          >
            Practice before it counts
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.95rem", maxWidth: 480 }}>
            A live, spoken mock interview — tailored to a job you've applied to, or any topic you want to drill.
          </Typography>
        </Stack>

        {/* Step 1 — mode */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3} sx={{ animation: enter(0.06) }}>
          <Box sx={modeCardSx(mode === "job")} onClick={() => setMode("job")}>
            <WorkOutlineIcon
              className="prep-mode-icon"
              sx={{ fontSize: 30, color: theme.palette.primary.main, mb: 1, transition: "transform 0.2s ease" }}
            />
            <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Prep for an applied job
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: theme.palette.text.secondary, mt: 0.5 }}>
              We'll pull the job description and your resume automatically.
            </Typography>
          </Box>
          <Box sx={modeCardSx(mode === "custom")} onClick={() => setMode("custom")}>
            <EditNoteIcon
              className="prep-mode-icon"
              sx={{ fontSize: 30, color: theme.palette.primary.main, mb: 1, transition: "transform 0.2s ease" }}
            />
            <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
              Custom prep
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: theme.palette.text.secondary, mt: 0.5 }}>
              Paste a JD, or just pick a topic to practice.
            </Typography>
          </Box>
        </Stack>

        {/* Step 2a — job mode */}
        {mode === "job" && (
          <Box sx={{ ...cardSx, mb: 3, animation: enter(0) }}>
            <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1.5 }}>
              Pick an applied job
            </Typography>

            {loadingJobs && (
              <Stack alignItems="center" py={3}>
                <CircularProgress size={26} />
              </Stack>
            )}

            {!loadingJobs && appliedJobs.length === 0 && !error && (
              <Typography sx={{ fontSize: "0.88rem", color: theme.palette.text.secondary }}>
                No applied jobs yet — mark a job as "Applied" from Job Search or My Jobs first, or use Custom prep instead.
              </Typography>
            )}

            {!loadingJobs && appliedJobs.length > 0 && (
              <Stack spacing={1.2}>
                {appliedJobs.map((job, i) => {
                  const id = job._id || job.job_id;
                  const active = id === selectedJobId;
                  return (
                    <Box
                      key={id}
                      onClick={() => setSelectedJobId(id)}
                      sx={{
                        p: 1.6,
                        borderRadius: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                        background: active
                          ? alpha(theme.palette.primary.main, 0.1)
                          : "transparent",
                        transition: "background 0.15s ease, border-color 0.15s ease",
                        animation: enter(Math.min(i, 6) * 0.04),
                        "&:hover": {
                          borderColor: active ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.4),
                        },
                      }}
                    >
                      <BusinessOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: theme.palette.text.primary }}>
                          {job.title || job.job_title}
                        </Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: theme.palette.text.secondary }}>
                          {job.company}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
        )}

        {/* Step 2b — custom mode */}
        {mode === "custom" && (
          <Box sx={{ ...cardSx, mb: 3, animation: enter(0) }}>
            <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 1.5 }}>
              Choose a source
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2.5}>
              <Chip label="Paste job description" onClick={() => setCustomSubMode("paste")} sx={pillSx(customSubMode === "paste")} />
              <Chip label="Custom topic" onClick={() => setCustomSubMode("topic")} sx={pillSx(customSubMode === "topic")} />
              <Chip icon={<LanguageIcon sx={{ fontSize: 16 }} />} label="From article/website · Soon" sx={pillSx(false, true)} />
              <Chip icon={<UploadFileIcon sx={{ fontSize: 16 }} />} label="Upload PDF · Soon" sx={pillSx(false, true)} />
            </Stack>

            {customSubMode === "paste" && (
              <Stack spacing={1.5} sx={{ animation: enter(0) }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Role (optional) — e.g. Backend Engineer"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      background: isDark ? alpha("#fff", 0.03) : "#fafaff",
                    },
                    "& .MuiInputBase-input": { color: theme.palette.text.primary },
                  }}
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={5}
                  placeholder="Paste the job description here…"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      background: isDark ? alpha("#fff", 0.03) : "#fafaff",
                    },
                    "& .MuiInputBase-input": { color: theme.palette.text.primary },
                  }}
                />
              </Stack>
            )}

            {customSubMode === "topic" && (
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. System design, React deep dive, Behavioral questions…"
                value={topicText}
                onChange={(e) => setTopicText(e.target.value)}
                sx={{
                  animation: enter(0),
                  "& .MuiOutlinedInput-root": {
                    background: isDark ? alpha("#fff", 0.03) : "#fafaff",
                  },
                  "& .MuiInputBase-input": { color: theme.palette.text.primary },
                }}
              />
            )}
          </Box>
        )}

        {/* Step 3 — duration */}
        {mode && (
          <Box sx={{ ...cardSx, mb: 3, animation: enter(0.04) }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <TimerOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
              <Typography sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Session length
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              {DURATIONS.map((d) => (
                <Chip
                  key={d}
                  label={`${d} min`}
                  onClick={() => setDuration(d)}
                  sx={pillSx(duration === d)}
                />
              ))}
            </Stack>
          </Box>
        )}

        {error && (
          <Typography sx={{ color: theme.palette.error?.main || "#c62828", fontSize: "0.88rem", mb: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}

        {mode && (
          <Stack alignItems="center" sx={{ animation: enter(0.08) }}>
            <Button
              variant="contained"
              size="large"
              disabled={!canStart}
              onClick={handleStart}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                px: 5,
                py: 1.2,
                background: theme.palette.primary.main,
                boxShadow: "none",
                transition: "transform 0.15s ease",
                "&:hover": { background: theme.palette.primary.main, boxShadow: "none", transform: canStart ? "translateY(-1px)" : "none" },
              }}
            >
              {starting ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Start interview"}
            </Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
}