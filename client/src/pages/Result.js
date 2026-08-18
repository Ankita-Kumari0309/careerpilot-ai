// src/pages/Result.js
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { db, auth } from "../firebase";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import html2pdf from "html2pdf.js";
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import WorkHistoryOutlinedIcon from "@mui/icons-material/WorkHistoryOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";


const paper = {
  bg: "#ffffff",
  card: "#f8f8fc",
  border: "#ececf5",
  text: "#1f1f2e",
  textMuted: "#5c5c70",
  primary: "#4e54c8",
};

const scoreColor = (score) => {
  if (score >= 80) return "#16a34a";
  if (score >= 55) return "#d97706";
  return "#dc2626";
};

function ScoreMeter({ label, value }) {
  const color = scoreColor(value);
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 150,
        background: paper.card,
        border: `1px solid ${paper.border}`,
        borderRadius: "14px",
        p: 2.4,
      }}
    >
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: paper.textMuted, mb: 0.6 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, color, lineHeight: 1 }}>
        {value}
        <Typography component="span" sx={{ fontSize: "1rem", fontWeight: 700, color: paper.textMuted }}>
          /100
        </Typography>
      </Typography>
      <Box sx={{ height: 6, borderRadius: 4, background: "#e9e9f4", mt: 1.2, overflow: "hidden" }}>
        <Box sx={{ height: "100%", width: `${value}%`, background: color, borderRadius: 4 }} />
      </Box>
    </Box>
  );
}

function SectionHeading({ icon, title }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" mb={1.4}>
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: "8px",
          background: alpha(paper.primary, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: paper.text }}>{title}</Typography>
    </Stack>
  );
}

function ReportBody({ analysis }) {
  const {
    executive_summary,
    resume_score,
    resume_score_comment,
    match_percentage,
    ats_score,
    strengths = [],
    improvements = [],
    profile_review,
    skills = {},
    experience_analysis,
    education_review,
    suggested_projects = [],
    courses = [],
    motivation_tip,
  } = analysis;

  const {
    current_technical = [],
    current_soft = [],
    current_domain = [],
    missing = [],
    proficiency_note,
  } = skills;

  return (
    <>
      {/* Executive summary */}
      <Box sx={{ mb: 3 }}>
        <SectionHeading icon={<AutoAwesomeIcon sx={{ fontSize: 17, color: paper.primary }} />} title="Executive Summary" />
        <Typography sx={{ fontSize: "0.93rem", color: paper.textMuted, lineHeight: 1.75 }}>
          {executive_summary}
        </Typography>
      </Box>

     
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.6} mb={3}>
        <ScoreMeter label="RESUME SCORE" value={resume_score} />
        <ScoreMeter label="JOB MATCH" value={match_percentage} />
        <ScoreMeter label="ATS SCORE" value={ats_score} />
      </Stack>
      {resume_score_comment && (
        <Typography sx={{ fontSize: "0.85rem", color: paper.textMuted, mb: 3, mt: -1.6, fontStyle: "italic" }}>
          {resume_score_comment}
        </Typography>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
        <Box sx={{ background: paper.card, border: `1px solid ${paper.border}`, borderRadius: "14px", p: 2.4 }}>
          <SectionHeading icon={<CheckCircleOutlineIcon sx={{ fontSize: 17, color: "#16a34a" }} />} title="Key Strengths" />
          <Stack spacing={1}>
            {strengths.map((s, i) => (
              <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                <Box sx={{ mt: "6px", width: 5, height: 5, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.86rem", color: paper.textMuted, lineHeight: 1.6 }}>{s}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box sx={{ background: paper.card, border: `1px solid ${paper.border}`, borderRadius: "14px", p: 2.4 }}>
          <SectionHeading icon={<WarningAmberOutlinedIcon sx={{ fontSize: 17, color: "#d97706" }} />} title="Areas to Improve" />
          <Stack spacing={1.4}>
            {improvements.map((item, i) => (
              <Box key={i}>
                <Typography sx={{ fontSize: "0.86rem", fontWeight: 700, color: paper.text }}>{item.point}</Typography>
                <Typography sx={{ fontSize: "0.82rem", color: paper.textMuted, lineHeight: 1.6 }}>
                  {item.why_it_matters}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Profile review */}
      {profile_review && (
        <Box sx={{ mb: 3 }}>
          <SectionHeading icon={<PersonOutlineIcon sx={{ fontSize: 17, color: paper.primary }} />} title="Professional Profile" />
          <Typography sx={{ fontSize: "0.9rem", color: paper.textMuted, lineHeight: 1.75 }}>{profile_review}</Typography>
        </Box>
      )}

      {/* Skills */}
      <Box sx={{ mb: 3, background: paper.card, border: `1px solid ${paper.border}`, borderRadius: "14px", p: 2.4 }}>
        <SectionHeading icon={<BuildOutlinedIcon sx={{ fontSize: 17, color: paper.primary }} />} title="Skills Analysis" />

        {[
          ["Technical", current_technical],
          ["Soft skills", current_soft],
          ["Domain", current_domain],
        ].map(([label, list]) =>
          list.length > 0 ? (
            <Box key={label} sx={{ mb: 1.4 }}>
              <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: paper.textMuted, mb: 0.6 }}>
                {label.toUpperCase()}
              </Typography>
              <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                {list.map((skill, i) => (
                  <Chip
                    key={i}
                    label={skill}
                    size="small"
                    sx={{
                      background: alpha("#16a34a", 0.1),
                      color: "#15803d",
                      fontWeight: 600,
                      fontSize: "0.72rem",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          ) : null
        )}

        {missing.length > 0 && (
          <Box sx={{ mt: 1.8 }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: paper.textMuted, mb: 0.6 }}>
              MISSING / RECOMMENDED
            </Typography>
            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              {missing.map((skill, i) => (
                <Chip
                  key={i}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: alpha("#dc2626", 0.35),
                    color: "#dc2626",
                    fontWeight: 600,
                    fontSize: "0.72rem",
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {proficiency_note && (
          <Typography sx={{ fontSize: "0.84rem", color: paper.textMuted, mt: 1.8, lineHeight: 1.7 }}>
            {proficiency_note}
          </Typography>
        )}
      </Box>

      {/* Experience + Education */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
        {experience_analysis && (
          <Box sx={{ background: paper.card, border: `1px solid ${paper.border}`, borderRadius: "14px", p: 2.4 }}>
            <SectionHeading icon={<WorkHistoryOutlinedIcon sx={{ fontSize: 17, color: paper.primary }} />} title="Experience" />
            <Typography sx={{ fontSize: "0.86rem", color: paper.textMuted, lineHeight: 1.7 }}>
              {experience_analysis}
            </Typography>
          </Box>
        )}
        {education_review && (
          <Box sx={{ background: paper.card, border: `1px solid ${paper.border}`, borderRadius: "14px", p: 2.4 }}>
            <SectionHeading icon={<SchoolOutlinedIcon sx={{ fontSize: 17, color: paper.primary }} />} title="Education & Certifications" />
            <Typography sx={{ fontSize: "0.86rem", color: paper.textMuted, lineHeight: 1.7 }}>
              {education_review}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Suggested projects */}
      {suggested_projects.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionHeading icon={<BuildOutlinedIcon sx={{ fontSize: 17, color: paper.primary }} />} title="Suggested Projects" />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.6 }}>
            {suggested_projects.map((p, i) => (
              <Box key={i} sx={{ background: paper.card, border: `1px solid ${paper.border}`, borderRadius: "12px", p: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: paper.text, mb: 0.5 }}>
                  {p.title}
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: paper.textMuted, lineHeight: 1.6, mb: 1 }}>
                  {p.description}
                </Typography>
                <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                  {(p.tools || []).map((t, j) => (
                    <Chip
                      key={j}
                      label={t}
                      size="small"
                      sx={{ background: alpha(paper.primary, 0.08), color: paper.primary, fontSize: "0.68rem", fontWeight: 600 }}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Courses */}
      {courses.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionHeading icon={<MenuBookOutlinedIcon sx={{ fontSize: 17, color: paper.primary }} />} title="Recommended Courses" />
          <Stack spacing={1.2}>
            {courses.map((c, i) => (
              <Box key={i} sx={{ background: paper.card, border: `1px solid ${paper.border}`, borderRadius: "10px", p: 1.6 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.86rem", color: paper.text }}>
                  {c.name}{" "}
                  <Typography component="span" sx={{ fontWeight: 500, fontSize: "0.78rem", color: paper.textMuted }}>
                    · {c.platform}
                  </Typography>
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: paper.textMuted, lineHeight: 1.6 }}>
                  {c.reason}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Motivation */}
      {motivation_tip && (
        <Box
          sx={{
            borderRadius: "14px",
            p: 2.6,
            background: `linear-gradient(135deg, ${alpha(paper.primary, 0.08)}, ${alpha("#8f94fb", 0.1)})`,
            border: `1px solid ${alpha(paper.primary, 0.18)}`,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={0.8}>
            <FavoriteBorderIcon sx={{ fontSize: 16, color: paper.primary }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: paper.primary }}>
              A note for you
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: "0.9rem", color: paper.text, fontStyle: "italic", lineHeight: 1.7 }}>
            {motivation_tip}
          </Typography>
        </Box>
      )}
    </>
  );
}

export default function Result() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const location = useLocation();
  const navigate = useNavigate();
  const hasSaved = useRef(false);
  const [downloading, setDownloading] = useState(false);

  const analysis = location.state?.llmAnalysis;
  const resumeText = location.state?.resumeText;
  const jobDescription = location.state?.jobDescription;
  const jobTitle = location.state?.jobTitle;
  const experienceLevel = location.state?.experienceLevel;
  const isNewAnalysis = location.state?.isNewAnalysis ?? true;

  
  const isStructured = analysis && typeof analysis === "object" && !analysis.error;
  const hasError = analysis && typeof analysis === "object" && analysis.error;

  useEffect(() => {
    const saveToFirestore = async () => {
      try {
        if (hasSaved.current) return;
        const user = auth.currentUser;

        if (user && isNewAnalysis && analysis && resumeText && jobDescription && !hasError) {
          const userDocRef = doc(db, "users", user.email);

          await setDoc(
            userDocRef,
            { email: user.email, lastLogin: serverTimestamp() },
            { merge: true }
          );

          const reportsCollectionRef = collection(userDocRef, "analysisReports");

          await addDoc(reportsCollectionRef, {
            resumeText,
            jobDescription,
            jobTitle,
            experienceLevel,
            llmAnalysis: analysis,
            createdAt: serverTimestamp(),
          });

          hasSaved.current = true;
        }
      } catch (error) {
        console.error("Error saving to Firestore:", error);
      }
    };

    saveToFirestore();
  }, [analysis, resumeText, jobDescription, jobTitle, experienceLevel, isNewAnalysis, hasError]);

  const handleDownloadPDF = () => {
    const element = document.getElementById("pdf-content");
    setDownloading(true);
    const opt = {
      margin: 0.4,
      filename: "AI_Resume_Analysis.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    };
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => setDownloading(false))
      .catch(() => setDownloading(false));
  };

  if (!analysis) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.palette.background.default,
          px: 2,
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            maxWidth: 420,
            p: { xs: 4, sm: 5 },
            borderRadius: "18px",
            background: theme.custom?.glass,
            backdropFilter: "blur(16px)",
            border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.16)}`,
            boxShadow: theme.custom?.cardShadow,
          }}
        >
          <DescriptionOutlinedIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1.5 }} />
          <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: theme.palette.text.primary, mb: 1 }}>
            No analysis found
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem", mb: 3 }}>
            It looks like you accessed this page directly without uploading a resume.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/upload")}
            sx={{
              background: theme.palette.primary.main,
              color: "#fff",
              fontWeight: 700,
              px: 3.5,
              py: 1.1,
              borderRadius: "10px",
              textTransform: "none",
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              "&:hover": { background: "#4f46e5" },
            }}
          >
            Go back to upload
          </Button>
        </Box>
      </Box>
    );
  }

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

      <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <Stack alignItems="center" textAlign="center" mb={4} spacing={1.2}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ color: theme.palette.primary.main + " !important" }} />}
            label="Analysis complete"
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
            Your resume analysis report
          </Typography>
          {jobTitle && (
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.92rem" }}>
              Matched against <strong>{jobTitle}</strong>
              {experienceLevel ? ` · ${experienceLevel}` : ""}
            </Typography>
          )}
        </Stack>

        {hasError ? (
          <Box
            sx={{
              textAlign: "center",
              p: 4,
              borderRadius: "16px",
              background: alpha("#dc2626", 0.06),
              border: `1px solid ${alpha("#dc2626", 0.2)}`,
            }}
          >
            <Typography sx={{ color: "#dc2626", fontWeight: 600 }}>{analysis.error}</Typography>
          </Box>
        ) : (
          <Box
            id="pdf-content"
            sx={{
              backgroundColor: paper.bg,
              color: paper.text,
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.custom?.cardShadow || "0 12px 32px rgba(0,0,0,0.08)",
              p: { xs: 3, sm: 4.5 },
            }}
          >
            {isStructured ? (
              <ReportBody analysis={analysis} />
            ) : (
              
              <Box
                sx={{
                  lineHeight: 1.75,
                  "& h1, & h2, & h3": { fontWeight: 800, color: paper.text, mt: "1.4em", mb: "0.5em" },
                  "& h1": { fontSize: "1.5rem" },
                  "& h2": { fontSize: "1.25rem" },
                  "& h3": { fontSize: "1.05rem" },
                  "& p": { fontSize: "0.95rem", color: paper.textMuted, mb: "0.9em" },
                  "& ul, & ol": { pl: "1.3em", mb: "0.9em" },
                  "& li": { fontSize: "0.95rem", color: paper.textMuted, mb: "0.4em" },
                  "& strong": { color: paper.text },
                  "& > *:first-of-type": { mt: 0 },
                }}
              >
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </Box>
            )}
          </Box>
        )}

        {/* Actions */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" mt={4.5}>
          <Button
            variant="contained"
            startIcon={<RefreshOutlinedIcon />}
            onClick={() => navigate("/upload")}
            sx={{
              background: theme.palette.primary.main,
              color: "#fff",
              fontWeight: 700,
              px: 3.2,
              py: 1.15,
              borderRadius: "10px",
              textTransform: "none",
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                background: "#4f46e5",
                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            Analyze another resume
          </Button>

          <Button
            variant="outlined"
            startIcon={<DashboardOutlinedIcon />}
            onClick={() => navigate("/welcome")}
            sx={{
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              fontWeight: 700,
              px: 3.2,
              py: 1.15,
              borderRadius: "10px",
              textTransform: "none",
              transition: "transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                background: theme.custom?.glass,
                transform: "translateY(-2px)",
              },
            }}
          >
            Back to dashboard
          </Button>

          {!hasError && (
            <Button
              variant="contained"
              startIcon={<DownloadOutlinedIcon />}
              onClick={handleDownloadPDF}
              disabled={downloading}
              sx={{
                background: "#16a34a",
                color: "#fff",
                fontWeight: 700,
                px: 3.2,
                py: 1.15,
                borderRadius: "10px",
                textTransform: "none",
                boxShadow: "0 8px 20px rgba(22,163,74,0.3)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  background: "#15803d",
                  boxShadow: "0 12px 28px rgba(22,163,74,0.4)",
                },
                "&.Mui-disabled": { background: alpha("#16a34a", 0.5), color: "#fff" },
              }}
            >
              {downloading ? "Preparing PDF…" : "Download PDF"}
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}