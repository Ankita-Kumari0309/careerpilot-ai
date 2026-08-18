// src/pages/About.js
import React from "react";
import Navbar from "../components/Navbar";
import {
  Container,
  Typography,
  Button,
  Box,
  Link as MuiLink,
  Chip,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import {
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineArchiveBox,
  HiOutlineBriefcase,
  HiOutlineClipboardDocumentList,
  HiOutlineMicrophone,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowUpTray,
  HiOutlineClipboardDocumentCheck,
  HiOutlineRocketLaunch,
  HiOutlineSparkles,
  HiOutlineBolt,
} from "react-icons/hi2";
import { gradients } from "../theme/ThemeContext";

const steps = [
  { icon: <HiOutlineArrowUpTray size={22} />, title: "Upload your resume", desc: "Paste it or drop a PDF — takes a few seconds." },
  { icon: <HiOutlineClipboardDocumentCheck size={22} />, title: "Add the job description", desc: "We compare your resume against the exact role." },
  { icon: <HiOutlineRocketLaunch size={22} />, title: "Get your action plan", desc: "Matched skills, gaps, and what to fix — instantly." },
];

const platformFeatures = [
  { icon: <HiOutlineDocumentMagnifyingGlass size={22} />, title: "Resume Analysis", desc: "Deep AI comparison of your resume against any job description." },
  { icon: <HiOutlineArchiveBox size={22} />, title: "Report Records", desc: "Every past analysis saved — track how your score improves over time." },
  { icon: <HiOutlineBriefcase size={22} />, title: "Job Search", desc: "Matched listings pulled straight into your dashboard." },
  { icon: <HiOutlineClipboardDocumentList size={22} />, title: "My Jobs Tracker", desc: "Keep tabs on every application — saved, applied, in progress." },
  { icon: <HiOutlineMicrophone size={22} />, title: "Interview Prep", desc: "Practice with mock interviews before the real thing." },
  { icon: <HiOutlineChatBubbleLeftRight size={22} />, title: "Career Assistant", desc: "An AI chat that knows your resume and suggests the next best step." },
];

function Card({ icon, title, desc, theme, isDark }) {
  return (
    <Box
      sx={{
        p: 3,
        borderRadius: "16px",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.custom?.glass || theme.palette.background.paper,
        backdropFilter: "blur(10px)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: theme.custom?.cardShadow,
          borderColor: alpha(theme.palette.primary.main, 0.4),
        },
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
          color: theme.palette.primary.main,
          mb: 2,
        }}
      >
        {icon}
      </Box>
      <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: theme.palette.text.primary, mb: 0.6 }}>{title}</Typography>
      <Typography sx={{ fontSize: "0.87rem", color: theme.palette.text.secondary, lineHeight: 1.55 }}>{desc}</Typography>
    </Box>
  );
}

export default function About() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: theme.palette.background.default }}>
      <Navbar />

      {/* ---------- Back button ---------- */}
      <Container maxWidth="md" sx={{ pt: { xs: 3, md: 4 }, px: 2 }}>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "999px",
            px: 1.5,
            "&:hover": {
              background: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
            },
          }}
        >
          Back
        </Button>
      </Container>

      {/* ---------- Hero ---------- */}
      <Box sx={{ px: 2, pt: { xs: 3, md: 4 }, pb: { xs: 6, md: 7 } }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ color: theme.palette.primary.main + " !important" }} />}
            label="About CareerPilot"
            sx={{ mb: 3, px: 1, color: theme.custom?.chipText, background: theme.custom?.chipBg, border: `1px solid ${theme.palette.divider}`, fontWeight: 600 }}
          />
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: "-0.03em", fontSize: { xs: "2.1rem", sm: "2.6rem", md: "3rem" }, color: theme.palette.text.primary, mb: 2, lineHeight: 1.15 }}>
            Built for the modern{" "}
            <Box component="span" sx={{ color: theme.palette.primary.main }}>job hunt</Box>
          </Typography>
          <Typography sx={{ color: theme.palette.text.secondary, fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 620, mx: "auto" }}>
            CareerPilot exists because most rejections have nothing to do with your skills — they happen because your resume never
            spoke the job description's language in the first place.
          </Typography>
        </Container>
      </Box>

      {/* ---------- Problem / Solution ---------- */}
      <Box sx={{ py: { xs: 6, md: 8 }, backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#f6f5fa" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
            <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, borderRadius: "18px", border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", color: theme.palette.text.secondary, mb: 1.5 }}>
                The Problem
              </Typography>
              <Typography sx={{ color: theme.palette.text.primary, fontSize: "1rem", lineHeight: 1.75 }}>
                Job seekers apply to dozens of roles a day without knowing why they aren't getting shortlisted. Most resumes
                simply don't align with the job description — a fixable problem that's hard to see on your own.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, p: { xs: 3, md: 4 }, borderRadius: "18px", border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, backgroundColor: theme.palette.background.default }}>
              <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", color: theme.palette.primary.main, mb: 1.5 }}>
                The Fix
              </Typography>
              <Typography sx={{ color: theme.palette.text.primary, fontSize: "1rem", lineHeight: 1.75 }}>
                CareerPilot reads both documents the way a recruiter would, scores the match, and tells you exactly what to add,
                remove, or rephrase — before you hit apply.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ---------- How it works ---------- */}
      <Box sx={{ py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" textAlign="center" mb={6} spacing={1.2}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: theme.palette.primary.main }}>
              How It Works
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
              Three steps to a better resume
            </Typography>
          </Stack>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
            {steps.map((s) => (
              <Card key={s.title} icon={s.icon} title={s.title} desc={s.desc} theme={theme} isDark={isDark} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* ---------- Powered by (Gemini + Groq) ---------- */}
      <Box sx={{ py: { xs: 7, md: 9 }, backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#f6f5fa" }}>
        <Container maxWidth="md">
          <Stack alignItems="center" textAlign="center" mb={5} spacing={1.2}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: theme.palette.primary.main }}>
              Under The Hood
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
              Two AI engines, one purpose
            </Typography>
          </Stack>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3 }}>
            <Box sx={{ flex: 1, p: 3.5, borderRadius: "16px", border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default }}>
              <Box sx={{ width: 44, height: 44, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1), color: theme.palette.primary.main, mb: 2 }}>
                <HiOutlineSparkles size={22} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: theme.palette.text.primary, mb: 0.8 }}>Gemini — Resume Analysis</Typography>
              <Typography sx={{ fontSize: "0.9rem", color: theme.palette.text.secondary, lineHeight: 1.65 }}>
                Google's Gemini model reads your resume and the job description side by side, scoring the match and
                generating section-by-section, actionable suggestions.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, p: 3.5, borderRadius: "16px", border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default }}>
              <Box sx={{ width: 44, height: 44, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1), color: theme.palette.primary.main, mb: 2 }}>
                <HiOutlineBolt size={22} />
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: theme.palette.text.primary, mb: 0.8 }}>Groq — Career Assistant</Typography>
              <Typography sx={{ fontSize: "0.9rem", color: theme.palette.text.secondary, lineHeight: 1.65 }}>
                Groq's fast inference powers the in-app Career Assistant chat — grounded in your actual resume and job
                activity, with near-instant responses.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ---------- Full feature grid ---------- */}
      <Box sx={{ py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" textAlign="center" mb={6} spacing={1.2}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: theme.palette.primary.main }}>
              The Full Platform
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
              One place for your whole job search
            </Typography>
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {platformFeatures.map((f) => (
              <Card key={f.title} icon={f.icon} title={f.title} desc={f.desc} theme={theme} isDark={isDark} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* ---------- Meet the creator ---------- */}
      <Box sx={{ py: { xs: 6, md: 7 } }}>
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: "center",
              p: { xs: 3, md: 4 },
              borderRadius: "18px",
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.custom?.glass || theme.palette.background.paper,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: theme.palette.text.primary, mb: 1 }}>
              Curious who's behind CareerPilot?
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem", mb: 2.5 }}>
              Head over to the Creator Desk for the story, the stack, and what's coming next.
            </Typography>
            <Button
              component={RouterLink}
              to="/creator-desk"
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderColor: theme.palette.divider, color: theme.palette.text.primary, fontWeight: 600, textTransform: "none", borderRadius: "10px", px: 3 }}
            >
              Meet the creator
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ---------- CTA banner ---------- */}
      <Box sx={{ py: { xs: 7, md: 8 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              borderRadius: "20px",
              px: { xs: 3, md: 6 },
              py: { xs: 5, md: 6 },
              background: gradients.primary,
              textAlign: "center",
              boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, isDark ? 0.35 : 0.25)}`,
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.5rem", md: "2rem" }, color: "#fff", mb: 1.5, letterSpacing: "-0.02em" }}>
              Ready to fix your resume?
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.85)", mb: 3, fontSize: "0.95rem" }}>
              Free to start — no credit card needed.
            </Typography>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              size="large"
              sx={{ background: "#fff", color: theme.palette.primary.main, fontWeight: 700, px: 4, py: 1.2, borderRadius: "10px", textTransform: "none", "&:hover": { background: "#f2f2f2" } }}
            >
              Create free account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ---------- Compact Footer ---------- */}
      <Box component="footer" sx={{ borderTop: `1px solid ${theme.palette.divider}`, px: { xs: 3, md: 8 }, py: 2.2 }}>
        <Container maxWidth="lg" disableGutters sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center", gap: 1 }}>
          <Logo size="sm" />
          <Stack direction="row" spacing={2.5} alignItems="center">
            <MuiLink component={RouterLink} to="/creator-desk" underline="hover" sx={{ color: theme.palette.text.secondary, fontSize: "0.82rem" }}>Creator Desk</MuiLink>
            <MuiLink component={RouterLink} to="/faq" underline="hover" sx={{ color: theme.palette.text.secondary, fontSize: "0.82rem" }}>FAQ</MuiLink>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.8rem" }}>© 2026 CareerPilot</Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}