// src/pages/JobSearch.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { auth } from "../firebase";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000";

const SENIORITY_OPTIONS = [
  { value: "", label: "All levels" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid" },
  { value: "senior", label: "Senior" },
];

function matchLabel(percent) {
  if (percent >= 70) return "Best match";
  if (percent >= 50) return "Good match";
  return "Possible match";
}

export default function JobSearch() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [search, setSearch] = useState("");
  const [seniority, setSeniority] = useState("");
  const [showMatches, setShowMatches] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [trackedIds, setTrackedIds] = useState({});

  const [pendingApplyJob, setPendingApplyJob] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [undoSnackbar, setUndoSnackbar] = useState({
    open: false,
    jobId: null,
    jobTitle: "",
    previousStatus: null,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url;
      const params = new URLSearchParams();

      if (showMatches) {
        const email = auth.currentUser?.email;
        if (!email) {
          setError("Please log in and upload a resume to see your best matches.");
          setJobs([]);
          setLoading(false);
          return;
        }
        params.set("email", email);
        if (seniority) params.set("seniority", seniority);
        url = `${API_BASE}/api/jobs/matches?${params.toString()}`;
      } else {
        if (seniority) params.set("seniority", seniority);
        if (search.trim()) params.set("keyword", search.trim());
        url = `${API_BASE}/api/jobs?${params.toString()}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server returned ${res.status}`);
      }
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Couldn't load jobs right now. Please try again.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [seniority, search, showMatches]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  
  const fetchTrackedStatuses = useCallback(async () => {
    const email = auth.currentUser?.email;
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE}/api/tracker/status?email=${encodeURIComponent(email)}`);
      if (!res.ok) return;
      const statusMap = await res.json(); 
      setTrackedIds((prev) => ({ ...statusMap, ...prev }));
    } catch (err) {
      console.error("Failed to load tracked statuses:", err);
    }
  }, []);

  useEffect(() => {
    fetchTrackedStatuses();
  }, [fetchTrackedStatuses]);

  const updateTrackerStatus = async (jobId, status) => {
    const email = auth.currentUser?.email;
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE}/api/tracker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, job_id: jobId, status }),
      });
      if (res.ok) {
        setTrackedIds((prev) => ({ ...prev, [jobId]: status }));
      }
    } catch (err) {
      console.error("Tracker update failed:", err);
    }
  };

  const untrackJob = async (jobId) => {
    const email = auth.currentUser?.email;
    if (!email) return;
    try {
      await fetch(`${API_BASE}/api/tracker/${jobId}?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      setTrackedIds((prev) => {
        const next = { ...prev };
        delete next[jobId];
        return next;
      });
    } catch (err) {
      console.error("Untrack failed:", err);
    }
  };

  const handleApplyClick = (job) => {
    setPendingApplyJob(job);
  };

  useEffect(() => {
    const handleWindowFocus = () => {
      if (pendingApplyJob) {
        setConfirmDialogOpen(true);
      }
    };
    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, [pendingApplyJob]);

  const handleApplyConfirm = (didApply) => {
    if (didApply && pendingApplyJob) {
      const previousStatus = trackedIds[pendingApplyJob._id] || null;
      updateTrackerStatus(pendingApplyJob._id, "applied");
      setUndoSnackbar({
        open: true,
        jobId: pendingApplyJob._id,
        jobTitle: pendingApplyJob.title,
        previousStatus,
      });
    }
    setConfirmDialogOpen(false);
    setPendingApplyJob(null);
  };

  const handleUndoApply = () => {
    const { jobId, previousStatus } = undoSnackbar;
    if (jobId) {
      if (previousStatus) {
        updateTrackerStatus(jobId, previousStatus);
      } else {
        untrackJob(jobId);
      }
    }
    setUndoSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSnackbarClose = (_event, reason) => {
    if (reason === "clickaway") return;
    setUndoSnackbar((prev) => ({ ...prev, open: false }));
  };

  const seniorityColor = (level) => {
    if (level === "senior") return theme.palette.primary.main;
    if (level === "mid") return theme.palette.warning?.main || "#c8890b";
    if (level === "junior") return theme.palette.success?.main || "#2e7d32";
    return theme.palette.text.secondary;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        py: { xs: 6, md: 8 },
        transition: "background-color 0.3s ease",
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
          left: -160,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, isDark ? 0.14 : 0.09)}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack alignItems="center" textAlign="center" mb={4} spacing={1.2}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ color: theme.palette.primary.main + " !important" }} />}
            label="Job search"
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
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.8rem", md: "2.1rem" },
              color: theme.palette.text.primary,
            }}
          >
            {showMatches ? "Best matches for you" : "Live job openings"}
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.95rem", maxWidth: 480 }}>
            {showMatches
              ? "Jobs ranked against your uploaded resume, best fit first."
              : "Real postings, refreshed automatically — search by role or filter by experience level."}
          </Typography>

          <Stack direction="row" spacing={1} mt={1}>
            {[
              { key: false, label: "All jobs" },
              { key: true, label: "Best matches for you" },
            ].map((opt) => (
              <Chip
                key={opt.label}
                label={opt.label}
                onClick={() => setShowMatches(opt.key)}
                sx={{
                  fontWeight: 700,
                  cursor: "pointer",
                  color: showMatches === opt.key ? "#fff" : theme.palette.text.primary,
                  background:
                    showMatches === opt.key
                      ? theme.palette.primary.main
                      : isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#f0f0f5",
                  border: `1px solid ${
                    showMatches === opt.key ? theme.palette.primary.main : theme.palette.divider
                  }`,
                  "&:hover": {
                    background:
                      showMatches === opt.key
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              />
            ))}
          </Stack>

          {!showMatches && (
            <TextField
              placeholder="Search job title or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                mt: 1.5,
                width: { xs: "100%", sm: 380 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "999px",
                  backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fafaff",
                  "& fieldset": { borderColor: theme.palette.divider },
                  "&:hover fieldset": { borderColor: alpha(theme.palette.primary.main, 0.5) },
                  "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 19, color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              }}
            />
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" mt={1}>
            {SENIORITY_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                onClick={() => setSeniority(opt.value)}
                sx={{
                  fontWeight: 600,
                  cursor: "pointer",
                  color: seniority === opt.value ? "#fff" : theme.palette.text.primary,
                  background:
                    seniority === opt.value
                      ? theme.palette.primary.main
                      : isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#f0f0f5",
                  border: `1px solid ${
                    seniority === opt.value ? theme.palette.primary.main : theme.palette.divider
                  }`,
                  "&:hover": {
                    background:
                      seniority === opt.value
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              />
            ))}
          </Stack>
        </Stack>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {!loading && error && (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography sx={{ color: theme.palette.error?.main || "#c62828", fontWeight: 600 }}>
              {error}
            </Typography>
          </Box>
        )}

        {!loading && !error && jobs.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 7,
              px: 3,
              borderRadius: "18px",
              background: theme.custom?.glass,
              backdropFilter: "blur(16px)",
              border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.16)}`,
              boxShadow: theme.custom?.cardShadow,
              maxWidth: 480,
              mx: "auto",
            }}
          >
            <BusinessOutlinedIcon sx={{ fontSize: 36, color: theme.palette.text.secondary, mb: 1.5 }} />
            <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
              No jobs found
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.88rem" }}>
              Try a different keyword or filter.
            </Typography>
          </Box>
        )}

        {!loading && !error && jobs.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: 2.4,
            }}
          >
            {jobs.map((job) => {
              const trackedStatus = trackedIds[job._id];
              return (
                <Box
                  key={job._id}
                  sx={{
                    p: 2.8,
                    borderRadius: "16px",
                    background: theme.custom?.glass,
                    backdropFilter: "blur(16px)",
                    border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.2 : 0.14)}`,
                    boxShadow: theme.custom?.cardShadow,
                    display: "flex",
                    flexDirection: "column",
                    transition:
                      "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                      boxShadow: `${theme.custom?.cardShadow}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Chip
                      label={job.seniority || "unrated"}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        textTransform: "capitalize",
                        color: seniorityColor(job.seniority),
                        background: alpha(seniorityColor(job.seniority), 0.14),
                        border: `1px solid ${alpha(seniorityColor(job.seniority), 0.3)}`,
                      }}
                    />
                    {typeof job.match_percent === "number" && (
                      <Chip
                        label={`${job.match_percent}% · ${matchLabel(job.match_percent)}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          color: "#15803d",
                          background: alpha("#16a34a", 0.14),
                          border: `1px solid ${alpha("#16a34a", 0.3)}`,
                        }}
                      />
                    )}
                  </Stack>

                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: theme.palette.text.primary,
                      mb: 0.5,
                      lineHeight: 1.35,
                    }}
                  >
                    {job.title}
                  </Typography>

                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.88rem", mb: 0.4 }}>
                    {job.company}
                  </Typography>

                  {job.location && (
                    <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                      <LocationOnOutlinedIcon sx={{ fontSize: 15, color: theme.palette.text.secondary }} />
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
                        {job.location}
                      </Typography>
                    </Stack>
                  )}

                  {job.missing_skills && job.missing_skills.length > 0 && (
                    <Typography sx={{ fontSize: "0.78rem", color: "#c2410c", mb: 1, fontWeight: 600 }}>
                      Missing: {job.missing_skills.join(", ")}
                    </Typography>
                  )}

                  {job.skills && job.skills.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.6} mb={2}>
                      {job.skills.slice(0, 5).map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            height: 22,
                            background: isDark ? "rgba(255,255,255,0.05)" : "#f0f0f5",
                            color: theme.palette.text.secondary,
                          }}
                        />
                      ))}
                    </Stack>
                  )}

                  {/* Save + Apply row */}
                  <Stack direction="row" spacing={1} mt="auto" alignItems="center">
                    <Box
                      component="button"
                      type="button"
                      onClick={() => updateTrackerStatus(job._id, "saved")}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.5,
                        cursor: "pointer",
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        background:
                          trackedStatus === "saved"
                            ? alpha(theme.palette.primary.main, 0.14)
                            : "transparent",
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        px: 1.8,
                        py: 0.85,
                        borderRadius: "999px",
                        transition: "background 0.2s ease",
                        "&:hover": { background: alpha(theme.palette.primary.main, 0.12) },
                      }}
                    >
                      {trackedStatus === "saved" ? "✓ Saved" : "Save"}
                    </Box>

                    <Box
                      component="a"
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleApplyClick(job)}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.6,
                        textDecoration: "none",
                        color:
                          trackedStatus === "applied" ? "#fff" : theme.palette.primary.main,
                        background:
                          trackedStatus === "applied" ? theme.palette.primary.main : "transparent",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        px: 2,
                        py: 0.9,
                        borderRadius: "999px",
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                        transition: "background 0.2s ease, color 0.2s ease, transform 0.2s ease",
                        "&:hover": {
                          background: theme.palette.primary.main,
                          color: "#fff",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {trackedStatus === "applied" ? "✓ Applied" : "Apply now"}
                      <ArrowOutwardIcon sx={{ fontSize: 14 }} />
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>

      <Dialog
        open={confirmDialogOpen}
        onClose={() => handleApplyConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.custom?.glass,
            backdropFilter: "blur(16px)",
            border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.16)}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
          Did you apply?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.92rem" }}>
            {pendingApplyJob
              ? `Did you go ahead and apply to ${pendingApplyJob.title} at ${pendingApplyJob.company}?`
              : "Did you go ahead and apply?"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => handleApplyConfirm(false)}
            sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: "none" }}
          >
            No, not yet
          </Button>
          <Button
            onClick={() => handleApplyConfirm(true)}
            variant="contained"
            sx={{
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 700,
              background: theme.palette.primary.main,
              boxShadow: "none",
              "&:hover": { background: theme.palette.primary.main, boxShadow: "none" },
            }}
          >
            Yes, I applied
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={undoSnackbar.open}
        onClose={handleSnackbarClose}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={`Marked "${undoSnackbar.jobTitle}" as applied`}
        action={
          <Button
            onClick={handleUndoApply}
            sx={{ color: theme.palette.primary.light || "#93c5fd", fontWeight: 700, textTransform: "none" }}
          >
            Undo
          </Button>
        }
      />
    </Box>
  );
}