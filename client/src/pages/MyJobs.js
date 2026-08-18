// src/pages/MyJobs.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  useTheme,
  alpha,
  CircularProgress,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { auth } from "../firebase";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000";
const DEFAULT_FOLLOW_UP_DAYS = 7;

const STATUS_TABS = [
  { key: "saved", label: "Saved" },
  { key: "applied", label: "Applied" },
  { key: "interviewing", label: "Interviewing" },
  { key: "rejected", label: "Rejected" },
  { key: "offer", label: "Offer" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "Newest first" },
  { key: "oldest", label: "Oldest first" },
];

function timeAgo(dateStr) {
  if (!dateStr) return null;
  const then = new Date(dateStr);
  const diffMs = Date.now() - then.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

function followUpInfo(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const diffMs = target.getTime() - Date.now();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: "Follow-up overdue", overdue: true };
  if (days === 0) return { text: "Follow up today", overdue: true };
  return { text: `Follow up in ${days} day${days === 1 ? "" : "s"}`, overdue: false };
}


function toDatetimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function MyJobs() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [activeTab, setActiveTab] = useState("saved");
  const [sortOrder, setSortOrder] = useState("newest");
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [noteDrafts, setNoteDrafts] = useState({});

  const [interviewDialogJob, setInterviewDialogJob] = useState(null);
  const [interviewDateInput, setInterviewDateInput] = useState("");
  const [interviewNotesInput, setInterviewNotesInput] = useState("");

 
  const [followUpDialogJob, setFollowUpDialogJob] = useState(null);
  const [followUpDateInput, setFollowUpDateInput] = useState("");

  const fetchTrackedJobs = useCallback(async (status, sort) => {
    const email = auth.currentUser?.email;
    if (!email) {
      setError("Please log in to see your tracked jobs.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ email, status, sort });
      const res = await fetch(`${API_BASE}/api/tracker?${params.toString()}`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const jobList = data.jobs || [];
      setJobs(jobList);
      setCounts(data.counts || {});
      setNoteDrafts((prev) => {
        const next = { ...prev };
        jobList.forEach((j) => {
          if (next[j._id] === undefined) next[j._id] = j.notes || "";
        });
        return next;
      });
    } catch (err) {
      setError(err.message || "Couldn't load your jobs right now.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrackedJobs(activeTab, sortOrder);
  }, [activeTab, sortOrder, fetchTrackedJobs]);

  const handleStatusChange = async (jobId, newStatus) => {
    const email = auth.currentUser?.email;
    if (!email) return;
    try {
      const res = await fetch(`${API_BASE}/api/tracker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, job_id: jobId, status: newStatus }),
      });
      await res.json().catch(() => ({}));

      const job = jobs.find((j) => j._id === jobId);

      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setCounts((prev) => ({
        ...prev,
        [activeTab]: Math.max((prev[activeTab] || 1) - 1, 0),
        [newStatus]: (prev[newStatus] || 0) + 1,
      }));

      if (newStatus === "interviewing" && job) {
        setInterviewDialogJob(job);
        setInterviewDateInput("");
        setInterviewNotesInput("");
      }

      

      if (newStatus === "applied" && job) {
        const defaultDate = new Date(Date.now() + DEFAULT_FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000);
        setFollowUpDialogJob(job);
        setFollowUpDateInput(toDatetimeLocalValue(defaultDate));
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleRemove = async (jobId) => {
    const email = auth.currentUser?.email;
    if (!email) return;
    try {
      await fetch(`${API_BASE}/api/tracker/${jobId}?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setCounts((prev) => ({
        ...prev,
        [activeTab]: Math.max((prev[activeTab] || 1) - 1, 0),
      }));
    } catch (err) {
      console.error("Remove failed:", err);
    }
  };

  const handleNoteBlur = async (jobId) => {
    const email = auth.currentUser?.email;
    if (!email) return;
    const notes = noteDrafts[jobId] ?? "";
    try {
      await fetch(`${API_BASE}/api/tracker/${jobId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, notes }),
      });
    } catch (err) {
      console.error("Saving note failed:", err);
    }
  };

  const handleSaveInterviewDetails = async () => {
    const email = auth.currentUser?.email;
    if (!email || !interviewDialogJob) return;
    try {
      await fetch(`${API_BASE}/api/tracker/${interviewDialogJob._id}/interview`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          interview_date: interviewDateInput || null,
          interview_notes: interviewNotesInput || null,
        }),
      });
    } catch (err) {
      console.error("Saving interview details failed:", err);
    } finally {
      setInterviewDialogJob(null);
    }
  };

  // NEW — save the (possibly edited) follow-up date, or clear it
  const handleSaveFollowUp = async (clear = false) => {
    const email = auth.currentUser?.email;
    if (!email || !followUpDialogJob) return;
    try {
      await fetch(`${API_BASE}/api/tracker/${followUpDialogJob._id}/followup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          follow_up_date: clear ? null : followUpDateInput || null,
        }),
      });
    } catch (err) {
      console.error("Saving follow-up date failed:", err);
    } finally {
      setFollowUpDialogJob(null);
    }
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
            icon={<BookmarkBorderIcon sx={{ color: theme.palette.primary.main + " !important" }} />}
            label="My jobs"
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
            Track your applications
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.95rem", maxWidth: 480 }}>
            Everything you've saved or applied to, in one place.
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" mt={1}>
            {STATUS_TABS.map((tab) => (
              <Chip
                key={tab.key}
                label={`${tab.label} (${counts[tab.key] || 0})`}
                onClick={() => setActiveTab(tab.key)}
                sx={{
                  fontWeight: 700,
                  cursor: "pointer",
                  color: activeTab === tab.key ? "#fff" : theme.palette.text.primary,
                  background:
                    activeTab === tab.key
                      ? theme.palette.primary.main
                      : isDark
                      ? "rgba(255,255,255,0.05)"
                      : "#f0f0f5",
                  border: `1px solid ${
                    activeTab === tab.key ? theme.palette.primary.main : theme.palette.divider
                  }`,
                  "&:hover": {
                    background:
                      activeTab === tab.key
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, 0.12),
                  },
                }}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1} mt={0.5}>
            {SORT_OPTIONS.map((opt) => (
              <Chip
                key={opt.key}
                label={opt.label}
                size="small"
                onClick={() => setSortOrder(opt.key)}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  color: sortOrder === opt.key ? theme.palette.primary.main : theme.palette.text.secondary,
                  background: "transparent",
                  border: `1px solid ${
                    sortOrder === opt.key ? theme.palette.primary.main : theme.palette.divider
                  }`,
                  "&:hover": { borderColor: alpha(theme.palette.primary.main, 0.5) },
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
            <BookmarkBorderIcon sx={{ fontSize: 36, color: theme.palette.text.secondary, mb: 1.5 }} />
            <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
              Nothing here yet
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.88rem" }}>
              Jobs you save or apply to will show up in this tab.
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
              const followUp = activeTab === "applied" ? followUpInfo(job.follow_up_date) : null;
              const agoLabel = timeAgo(job.tracked_at);

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
                    transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease, border-color 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                      boxShadow: `${theme.custom?.cardShadow}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.6}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: theme.palette.text.primary,
                        lineHeight: 1.35,
                      }}
                    >
                      {job.title}
                    </Typography>

                    {followUp && (
                      <Chip
                        icon={<EventAvailableOutlinedIcon sx={{ fontSize: 14 }} />}
                        label={followUp.text}
                        size="small"
                        onClick={() => {
                          setFollowUpDialogJob(job);
                          setFollowUpDateInput(
                            job.follow_up_date
                              ? toDatetimeLocalValue(new Date(job.follow_up_date))
                              : toDatetimeLocalValue(new Date(Date.now() + DEFAULT_FOLLOW_UP_DAYS * 24 * 60 * 60 * 1000))
                          );
                        }}
                        sx={{
                          fontSize: "0.66rem",
                          fontWeight: 700,
                          height: 22,
                          flexShrink: 0,
                          cursor: "pointer",
                          color: followUp.overdue ? "#dc2626" : "#c8890b",
                          background: alpha(followUp.overdue ? "#dc2626" : "#c8890b", 0.12),
                          border: `1px solid ${alpha(followUp.overdue ? "#dc2626" : "#c8890b", 0.3)}`,
                        }}
                      />
                    )}
                  </Stack>

                  <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.88rem", mb: 0.4 }}>
                    {job.company}
                  </Typography>

                  {job.location && (
                    <Stack direction="row" alignItems="center" spacing={0.5} mb={0.8}>
                      <LocationOnOutlinedIcon sx={{ fontSize: 15, color: theme.palette.text.secondary }} />
                      <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>
                        {job.location}
                      </Typography>
                    </Stack>
                  )}

                  {agoLabel && (
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.76rem", mb: 1 }}>
                      {STATUS_TABS.find((t) => t.key === job.tracker_status)?.label || "Updated"} {agoLabel}
                    </Typography>
                  )}

                  {job.interview_date && (
                    <Typography sx={{ color: theme.palette.primary.main, fontSize: "0.78rem", fontWeight: 600, mb: 0.4 }}>
                      Interview: {new Date(job.interview_date).toLocaleString()}
                    </Typography>
                  )}
                  {job.interview_notes && (
                    <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.78rem", mb: 1 }}>
                      {job.interview_notes}
                    </Typography>
                  )}

                  {job.skills && job.skills.length > 0 && (
                    <Stack direction="row" flexWrap="wrap" gap={0.6} mb={1.5}>
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

                  <TextField
                    placeholder="Add a note…"
                    value={noteDrafts[job._id] ?? ""}
                    onChange={(e) =>
                      setNoteDrafts((prev) => ({ ...prev, [job._id]: e.target.value }))
                    }
                    onBlur={() => handleNoteBlur(job._id)}
                    multiline
                    minRows={1}
                    maxRows={4}
                    size="small"
                    sx={{
                      mb: 1.5,
                      "& .MuiOutlinedInput-root": {
                        fontSize: "0.8rem",
                        borderRadius: "10px",
                        backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fafaff",
                      },
                    }}
                  />

                  <Stack direction="row" spacing={1} alignItems="center" mt="auto">
                    <Select
                      value={job.tracker_status}
                      onChange={(e) => handleStatusChange(job._id, e.target.value)}
                      size="small"
                      sx={{
                        flex: 1,
                        borderRadius: "999px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.divider,
                        },
                      }}
                    >
                      {STATUS_TABS.map((t) => (
                        <MenuItem key={t.key} value={t.key} sx={{ fontSize: "0.85rem" }}>
                          {t.label}
                        </MenuItem>
                      ))}
                    </Select>

                    <Box
                      component="button"
                      type="button"
                      onClick={() => handleRemove(job._id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        border: `1px solid ${theme.palette.divider}`,
                        background: "transparent",
                        borderRadius: "999px",
                        width: 34,
                        height: 34,
                        color: theme.palette.text.secondary,
                        flexShrink: 0,
                        "&:hover": { color: "#dc2626", borderColor: alpha("#dc2626", 0.4) },
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                    </Box>

                    <Box
                      component="a"
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        borderRadius: "999px",
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                        color: theme.palette.primary.main,
                        transition: "background 0.2s ease, color 0.2s ease",
                        "&:hover": { background: theme.palette.primary.main, color: "#fff" },
                      }}
                    >
                      <ArrowOutwardIcon sx={{ fontSize: 15 }} />
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>
        )}
      </Container>


      <Dialog
        open={Boolean(interviewDialogJob)}
        onClose={() => setInterviewDialogJob(null)}
        fullWidth
        maxWidth="xs"
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
          Interview details
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.88rem", mb: 2 }}>
            {interviewDialogJob
              ? `Add a date and any prep notes for ${interviewDialogJob.title} at ${interviewDialogJob.company}. Optional — you can skip and add these later.`
              : ""}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Interview date & time"
              type="datetime-local"
              value={interviewDateInput}
              onChange={(e) => setInterviewDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth
            />
            <TextField
              label="Prep notes"
              placeholder="What to review, who you're meeting…"
              value={interviewNotesInput}
              onChange={(e) => setInterviewNotesInput(e.target.value)}
              multiline
              minRows={2}
              maxRows={4}
              size="small"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setInterviewDialogJob(null)}
            sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: "none" }}
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSaveInterviewDetails}
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
            Save
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog
        open={Boolean(followUpDialogJob)}
        onClose={() => setFollowUpDialogJob(null)}
        fullWidth
        maxWidth="xs"
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
          When should we remind you to follow up?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.88rem", mb: 2 }}>
            {followUpDialogJob
              ? `Defaulted to 7 days after applying to ${followUpDialogJob.title} at ${followUpDialogJob.company}. Adjust it, or clear the reminder entirely.`
              : ""}
          </Typography>
          <TextField
            label="Follow-up date & time"
            type="datetime-local"
            value={followUpDateInput}
            onChange={(e) => setFollowUpDateInput(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => handleSaveFollowUp(true)}
            sx={{ color: theme.palette.text.secondary, fontWeight: 600, textTransform: "none" }}
          >
            No reminder
          </Button>
          <Button
            onClick={() => handleSaveFollowUp(false)}
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}