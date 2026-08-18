// src/pages/Upload.js
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../firebase";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Chip,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import BarChartIcon from "@mui/icons-material/BarChart";

const experienceLevels = ["Beginner", "Mid-Level", "Experienced"];
const MAX_FILE_MB = 10;

const analysisSteps = [
  "Reading your resume…",
  "Extracting your skills and experience…",
  "Comparing against the job description…",
  "Scoring your match…",
  "Spotting gaps and missing keywords…",
  "Putting together your action plan…",
];

export default function Upload() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  
  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(interval);
  }, [loading]);

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fafaff",
      "& fieldset": { borderColor: theme.palette.divider },
      "&:hover fieldset": { borderColor: alpha(theme.palette.primary.main, 0.5) },
      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.primary.main },
  };

  const pickFile = (file) => {
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setErrorMsg("Please upload a .pdf or .docx file.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setErrorMsg(`That file is over ${MAX_FILE_MB}MB — try a smaller one.`);
      return;
    }
    setErrorMsg("");
    setResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!resumeFile || !jobDescription || !jobTitle || !experienceLevel) {
      setErrorMsg("Please fill in all fields and attach your resume.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jobDescription);
    formData.append("jobTitle", jobTitle);
    formData.append("experienceLevel", experienceLevel);
    formData.append("email", auth.currentUser?.email || "unknown");

    try {
      const response = await axios.post("http://localhost:5000/upload_resume", formData);
      const { llmAnalysis, resumeText, jobDescription: jd } = response.data;

      navigate("/result", {
        state: { llmAnalysis, resumeText, jobDescription: jd, jobTitle, experienceLevel },
      });
    } catch (error) {
      console.error("Error uploading resume:", error);
      setErrorMsg("Something went wrong while analyzing your resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        position: "relative",
        py: { xs: 6, md: 9 },
        transition: "background-color 0.3s ease",
      }}
    >
      
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
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
          }}
        />
      </Box>

      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(18px)",
          transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <Stack alignItems="center" textAlign="center" mb={4} spacing={1.2}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ color: theme.palette.primary.main + " !important" }} />}
            label="Step 1 of 2 — Resume analysis"
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
            Upload your resume
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.95rem", maxWidth: 420 }}>
            Add the role you're targeting and we'll match your resume against it in seconds.
          </Typography>
        </Stack>

        <Box
          sx={{
            background: theme.custom?.glass,
            backdropFilter: "blur(16px)",
            borderRadius: "18px",
            border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.16)}`,
            boxShadow: theme.custom?.cardShadow,
            p: { xs: 3, sm: 4 },
            transition: "box-shadow 0.3s ease",
            "&:hover": {
              boxShadow: `${theme.custom?.cardShadow}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.12)}`,
            },
          }}
        >
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Job Title + Experience side by side on desktop */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Job Title"
                fullWidth
                margin="normal"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                sx={fieldSx}
                placeholder="e.g. Senior Frontend Engineer"
                InputProps={{
                  startAdornment: (
                    <WorkOutlineIcon sx={{ fontSize: 19, color: theme.palette.text.secondary, mr: 1 }} />
                  ),
                }}
              />

              <FormControl fullWidth margin="normal" required sx={fieldSx}>
                <InputLabel>Experience Level</InputLabel>
                <Select
                  value={experienceLevel}
                  label="Experience Level"
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  startAdornment={
                    <BarChartIcon sx={{ fontSize: 19, color: theme.palette.text.secondary, mr: 1 }} />
                  }
                >
                  {experienceLevels.map((lvl) => (
                    <MenuItem key={lvl} value={lvl}>
                      {lvl}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Job Description"
              fullWidth
              margin="normal"
              multiline
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              sx={fieldSx}
              placeholder="Paste the job description here…"
            />
            <Typography
              sx={{
                textAlign: "right",
                fontSize: "0.72rem",
                color: theme.palette.text.secondary,
                mt: -1.2,
                mb: 0.5,
              }}
            >
              {jobDescription.length} characters
            </Typography>

            {/* Drag & drop resume upload */}
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: theme.palette.text.secondary, mb: 1 }}>
                Resume (PDF or DOCX)
              </Typography>

              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                sx={{
                  cursor: "pointer",
                  borderRadius: "14px",
                  border: `1.5px dashed ${
                    dragActive
                      ? theme.palette.primary.main
                      : alpha(theme.palette.primary.main, isDark ? 0.35 : 0.3)
                  }`,
                  backgroundColor: dragActive
                    ? alpha(theme.palette.primary.main, isDark ? 0.12 : 0.06)
                    : isDark
                    ? "rgba(255,255,255,0.02)"
                    : "#fafaff",
                  py: 4,
                  px: 2,
                  textAlign: "center",
                  transition: "background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease",
                  transform: dragActive ? "scale(1.01)" : "scale(1)",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.05),
                  },
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept=".pdf,.docx"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />

                {resumeFile ? (
                  <Stack direction="row" spacing={1.2} alignItems="center" justifyContent="center">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        background: theme.custom?.chipBg,
                        flexShrink: 0,
                      }}
                    >
                      <InsertDriveFileOutlinedIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                    </Box>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography sx={{ fontSize: "0.88rem", fontWeight: 700, color: theme.palette.text.primary }}>
                        {resumeFile.name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>
                        {(resumeFile.size / 1024).toFixed(0)} KB — tap to replace
                      </Typography>
                    </Box>
                    <Box
                      role="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        color: theme.palette.text.secondary,
                        transition: "color 0.15s ease, background 0.15s ease",
                        "&:hover": { color: "#dc2626", background: alpha("#dc2626", 0.08) },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </Box>
                  </Stack>
                ) : (
                  <Stack spacing={0.8} alignItems="center">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 52,
                        height: 52,
                        borderRadius: "14px",
                        background: theme.custom?.chipBg,
                        mb: 0.5,
                      }}
                    >
                      <CloudUploadOutlinedIcon sx={{ fontSize: 26, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: theme.palette.text.primary }}>
                      Drop your resume here, or click to browse
                    </Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: theme.palette.text.secondary }}>
                      PDF or DOCX, up to {MAX_FILE_MB}MB
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Box>

            {errorMsg && (
              <Typography
                sx={{
                  mt: 2.5,
                  p: 1.2,
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  textAlign: "center",
                  color: "#dc2626",
                  background: alpha("#dc2626", 0.08),
                  border: `1px solid ${alpha("#dc2626", 0.2)}`,
                }}
              >
                {errorMsg}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={!loading && <ArrowForwardIcon />}
              sx={{
                mt: 3.5,
                py: 1.3,
                background: theme.palette.primary.main,
                color: "#fff",
                fontWeight: 700,
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  background: theme.palette.primary.dark || theme.palette.primary.main,
                  boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.45)}`,
                },
                "&.Mui-disabled": {
                  background: alpha(theme.palette.primary.main, 0.5),
                  color: "#fff",
                },
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Submit for analysis"}
            </Button>
          </Box>
        </Box>
      </Container>

      {/* ---------- Full-screen AI analysis loader ---------- */}
      {loading && (
        <Box
          role="status"
          aria-live="polite"
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDark ? "rgba(10,10,18,0.72)" : "rgba(248,248,252,0.82)",
            backdropFilter: "blur(6px)",
            px: 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: 380,
              textAlign: "center",
              background: theme.custom?.glass || theme.palette.background.paper,
              backdropFilter: "blur(16px)",
              borderRadius: "20px",
              border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.25 : 0.16)}`,
              boxShadow: theme.custom?.cardShadow,
              p: { xs: 4, sm: 5 },
            }}
          >
            
            <Box sx={{ position: "relative", width: 76, height: 76, mx: "auto", mb: 3 }}>
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.14),
                  animation: "careerPilotLoaderPulse 1.8s ease-in-out infinite",
                  "@keyframes careerPilotLoaderPulse": {
                    "0%": { transform: "scale(0.85)", opacity: 0.6 },
                    "50%": { transform: "scale(1.15)", opacity: 0.15 },
                    "100%": { transform: "scale(0.85)", opacity: 0.6 },
                  },
                }}
              />
              <CircularProgress
                size={76}
                thickness={3}
                sx={{ color: theme.palette.primary.main, position: "relative" }}
              />
              <AutoAwesomeIcon
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: 26,
                  color: theme.palette.primary.main,
                }}
              />
            </Box>

            <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", color: theme.palette.text.primary, mb: 0.8 }}>
              Analyzing your resume
            </Typography>

            <Typography
              key={loadingStep}
              sx={{
                fontSize: "0.9rem",
                color: theme.palette.text.secondary,
                minHeight: "1.4em",
                animation: "careerPilotLoaderFade 0.4s ease",
                "@keyframes careerPilotLoaderFade": {
                  from: { opacity: 0, transform: "translateY(4px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              {analysisSteps[loadingStep]}
            </Typography>

            
            <Stack direction="row" spacing={0.8} justifyContent="center" mt={3}>
              {analysisSteps.map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: i === loadingStep ? 18 : 6,
                    height: 6,
                    borderRadius: "999px",
                    backgroundColor:
                      i <= loadingStep
                        ? theme.palette.primary.main
                        : alpha(theme.palette.primary.main, isDark ? 0.2 : 0.15),
                    transition: "width 0.3s ease, background-color 0.3s ease",
                  }}
                />
              ))}
            </Stack>

            <Typography sx={{ mt: 3, fontSize: "0.75rem", color: theme.palette.text.secondary, opacity: 0.8 }}>
              This usually takes just a few seconds — please don't close this tab.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}