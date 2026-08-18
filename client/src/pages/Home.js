// src/pages/Home.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  Container,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  LinearProgress,
  Avatar,
  Rating,
  useTheme,
  alpha,
} from "@mui/material";
import { ReactTyped } from "react-typed";
import { Link as RouterLink } from "react-router-dom";
import Features from "../components/Features";
import Footer from "../components/Footer";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import TourGuideBot from "../components/TourGuideBot";
import {
  HiOutlineArrowUpTray,
  HiOutlineClipboardDocumentCheck,
  HiOutlineRocketLaunch,
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineArchiveBox,
  HiOutlineBriefcase,
  HiOutlineClipboardDocumentList,
  HiOutlineMicrophone,
  HiOutlineChatBubbleLeftRight,
} from "react-icons/hi2";

const steps = [
  {
    eyebrow: "01",
    icon: <HiOutlineArrowUpTray size={24} />,
    title: "Upload your resume",
    desc: "Paste it or drop a PDF — takes a few seconds.",
  },
  {
    eyebrow: "02",
    icon: <HiOutlineClipboardDocumentCheck size={24} />,
    title: "Add the job description",
    desc: "We compare your resume against the exact role.",
  },
  {
    eyebrow: "03",
    icon: <HiOutlineRocketLaunch size={24} />,
    title: "Get your action plan",
    desc: "Matched skills, gaps, and what to fix — instantly.",
  },
];

const platformFeatures = [
  {
    icon: <HiOutlineDocumentMagnifyingGlass size={22} />,
    title: "Resume Analysis",
    desc: "Deep AI comparison of your resume against any job description.",
  },
  {
    icon: <HiOutlineArchiveBox size={22} />,
    title: "Report Records",
    desc: "Every past analysis saved — track how your score improves over time.",
  },
  {
    icon: <HiOutlineBriefcase size={22} />,
    title: "Job Search",
    desc: "Matched listings pulled straight into your dashboard.",
  },
  {
    icon: <HiOutlineClipboardDocumentList size={22} />,
    title: "My Jobs Tracker",
    desc: "Keep tabs on every application — saved, applied, in progress.",
  },
  {
    icon: <HiOutlineMicrophone size={22} />,
    title: "Interview Prep",
    desc: "Practice with mock interviews before the real thing.",
  },
  {
    icon: <HiOutlineChatBubbleLeftRight size={22} />,
    title: "Career Assistant",
    desc: "An AI chat that knows your resume and suggests the next best step.",
  },
];

const testimonials = [
  {
    name: "Ritika S.",
    role: "Frontend Developer",
    quote:
      "Went from getting zero callbacks to three interviews in a week after fixing the gaps CareerPilot flagged.",
    score: 5,
  },
  {
    name: "Aman V.",
    role: "Backend Engineer",
    quote:
      "The skill-gap breakdown was more useful than any resume template site I'd tried before.",
    score: 5,
  },
  {
    name: "Priya D.",
    role: "Data Analyst",
    quote:
      "Interview prep module caught me off guard in a good way — practiced with it twice and felt way more ready.",
    score: 4,
  },
];

export default function Home() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
        position: "relative",
        transition: "background-color 0.3s ease",
      }}
    >
      <Box sx={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <Box
          sx={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha("#10b981", isDark ? 0.22 : 0.16)}, transparent 70%)`,
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
            background: `radial-gradient(circle, ${alpha("#0ea5e9", isDark ? 0.16 : 0.1)}, transparent 70%)`,
          }}
        />
      </Box>

      <Navbar />

      {/* ---------- Hero ---------- */}
      <Box sx={{ position: "relative", zIndex: 1, px: 2, pt: { xs: 7, md: 10 }, pb: { xs: 7, md: 8 } }}>
        <Container
          maxWidth="lg"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: { xs: "center", md: "left" },
            gap: { xs: 6, md: 5 },
          }}
        >
          <Box
            sx={{
              flex: 1,
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(18px)",
              transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <Chip
              icon={<AutoAwesomeIcon sx={{ color: "#10b981 !important" }} />}
              label="AI-Powered Career Guidance"
              sx={{
                mb: 3,
                px: 1,
                color: theme.palette.text.primary,
                background: alpha("#10b981", isDark ? 0.16 : 0.1),
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 600,
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.03em",
                fontSize: { xs: "2.2rem", sm: "2.8rem", md: "3.2rem" },
                color: theme.palette.text.primary,
                mb: 1,
                lineHeight: 1.15,
              }}
            >
              Land interviews with a{" "}
              <Box component="span" sx={{ color: "#10b981" }}>
                smarter resume
              </Box>
            </Typography>

            <Box sx={{ minHeight: "2.2rem", mb: 3 }}>
              <ReactTyped
                strings={["AI-Powered Resume Insights", "Job Matching Made Easy", "Optimize. Analyze. Succeed."]}
                typeSpeed={40}
                backSpeed={50}
                loop
                style={{ fontSize: "1.2rem", color: theme.palette.text.secondary, fontWeight: 500 }}
              />
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent={{ xs: "center", md: "flex-start" }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                size="large"
                sx={{
                  background: "linear-gradient(90deg, #0d9488, #10b981)",
                  color: "#fff",
                  fontWeight: 700,
                  px: 3.5,
                  py: 1.2,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: "0 8px 20px rgba(16,185,129,0.35)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    background: "linear-gradient(90deg, #0f766e, #059669)",
                    boxShadow: "0 12px 28px rgba(16,185,129,0.45)",
                  },
                }}
              >
                Get Started Free
              </Button>
              <Button
                component={RouterLink}
                to="/about"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  px: 3.5,
                  py: 1.2,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "1rem",
                  transition: "transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                  "&:hover": {
                    borderColor: "#10b981",
                    background: alpha("#10b981", 0.08),
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Learn More
              </Button>
            </Stack>

            <Stack direction="row" spacing={3} mt={5} justifyContent={{ xs: "center", md: "flex-start" }} flexWrap="wrap">
              {[["10K+", "Resumes analyzed"], ["92%", "Avg. match accuracy"], ["4.8/5", "User rating"]].map(([stat, label]) => (
                <Box key={label} sx={{ textAlign: { xs: "center", md: "left" } }}>
                  <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", color: theme.palette.text.primary }}>{stat}</Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: theme.palette.text.secondary }}>{label}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Product mockup card — before/after comparison */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              width: "100%",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0) scale(1)" : "translateY(24px) scale(0.98)",
              transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s",
            }}
          >
            <Box sx={{ position: "relative", width: { xs: "100%", sm: 380 }, maxWidth: 380 }}>
              <Box
                sx={{
                  position: "absolute",
                  top: -16,
                  right: -12,
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  gap: 0.7,
                  background: isDark ? "rgba(30,41,42,0.6)" : "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "999px",
                  px: 1.5,
                  py: 0.7,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                  border: `1px solid ${alpha("#10b981", 0.25)}`,
                  zIndex: 2,
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 17, color: "#059669" }} />
                <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: theme.palette.text.primary }}>+38% shortlist rate</Typography>
              </Box>

              <Box
                sx={{
                  background: isDark ? "rgba(30,41,42,0.6)" : "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(16px)",
                  borderRadius: "18px",
                  border: `1px solid ${alpha("#10b981", isDark ? 0.22 : 0.16)}`,
                  boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
                  p: 3,
                  transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
                  "&:hover": { transform: "translateY(-4px)" },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: "0.9rem" }}>Before → After</Typography>
                  <Chip label="Live analysis" size="small" sx={{ background: "rgba(16,185,129,0.15)", color: "#10b981", fontWeight: 600, fontSize: "0.68rem" }} />
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} mb={2.4}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, color: theme.palette.text.disabled, lineHeight: 1 }}>54%</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: theme.palette.text.secondary }}>Before</Typography>
                  </Box>
                  <ArrowForwardIcon sx={{ color: "#10b981" }} />
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "2.4rem", fontWeight: 800, color: "#10b981", lineHeight: 1 }}>87%</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: theme.palette.text.secondary }}>After</Typography>
                  </Box>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={87}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    mb: 2.2,
                    backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#e6f7f2",
                    "& .MuiLinearProgress-bar": { borderRadius: 4, background: "linear-gradient(90deg, #0d9488, #10b981)" },
                  }}
                />

                <Stack spacing={1.1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon sx={{ fontSize: 17, color: "#10b981" }} />
                    <Typography sx={{ fontSize: "0.8rem", color: theme.palette.text.primary }}>Added 3 missing keywords</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon sx={{ fontSize: 17, color: "#10b981" }} />
                    <Typography sx={{ fontSize: "0.8rem", color: theme.palette.text.primary }}>Quantified 4 achievements</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CancelIcon sx={{ fontSize: 17, color: theme.palette.text.disabled }} />
                    <Typography sx={{ fontSize: "0.8rem", color: theme.palette.text.secondary }}>Cloud (AWS) still a gap</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ---------- Features (horizontal) ---------- */}
      <Box id="features-section" sx={{ position: "relative", zIndex: 1 }}>
        <Features />
      </Box>

      {/* ---------- Platform overview ---------- */}
      <Box sx={{ position: "relative", zIndex: 1, py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" textAlign="center" mb={6} spacing={1.2}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#10b981" }}>
              The Full Platform
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
              One place for your whole job search
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.95rem", maxWidth: 560 }}>
              From your first upload to your last interview — every step lives in one dashboard.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
              gap: 3,
            }}
          >
            {platformFeatures.map((f) => (
              <Box
                key={f.title}
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                    borderColor: alpha("#10b981", 0.4),
                  },
                  "&:hover .pf-icon": { transform: "scale(1.08)" },
                }}
              >
                <Box
                  className="pf-icon"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: alpha("#10b981", isDark ? 0.16 : 0.1),
                    color: "#10b981",
                    mb: 2,
                    transition: "transform 0.3s ease",
                  }}
                >
                  {f.icon}
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: theme.palette.text.primary, mb: 0.6 }}>
                  {f.title}
                </Typography>
                <Typography sx={{ fontSize: "0.87rem", color: theme.palette.text.secondary, lineHeight: 1.55 }}>
                  {f.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ---------- How it works — connected horizontal timeline ---------- */}
      <Box id="how-it-works-section" sx={{ position: "relative", zIndex: 1, py: { xs: 7, md: 9 }, backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#f4faf8" }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" textAlign="center" mb={7} spacing={1.2}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#10b981" }}>
              How It Works
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
              Three steps to a better resume
            </Typography>
          </Stack>

          <Box sx={{ position: "relative" }}>
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                top: 28,
                left: "16.6%",
                right: "16.6%",
                height: 2,
                background: `linear-gradient(90deg, ${alpha("#10b981", 0.5)}, ${alpha("#0ea5e9", 0.5)})`,
              }}
            />
            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: { xs: 5, md: 3 } }}>
              {steps.map((s) => (
                <Box key={s.title} sx={{ flex: 1, textAlign: "center", position: "relative" }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      mx: "auto",
                      mb: 2.5,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #0d9488, #10b981)",
                      color: "#fff",
                      boxShadow: "0 10px 24px rgba(16,185,129,0.35)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {s.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.08em", color: "#10b981", mb: 0.8 }}>
                    STEP {s.eyebrow}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: theme.palette.text.primary, mb: 0.8 }}>
                    {s.title}
                  </Typography>
                  <Typography sx={{ fontSize: "0.88rem", color: theme.palette.text.secondary, maxWidth: 260, mx: "auto" }}>
                    {s.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ---------- Testimonials ---------- */}
      <Box sx={{ position: "relative", zIndex: 1, py: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" textAlign="center" mb={6} spacing={1.2}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#10b981" }}>
              Success Stories
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: "1.8rem", md: "2.2rem" }, color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
              People land interviews with CareerPilot
            </Typography>
          </Stack>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {testimonials.map((t) => (
              <Box
                key={t.name}
                sx={{
                  p: 3.5,
                  borderRadius: "16px",
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": { transform: "translateY(-6px)", boxShadow: "0 20px 40px rgba(0,0,0,0.08)" },
                }}
              >
                <FormatQuoteIcon sx={{ color: alpha("#10b981", 0.35), fontSize: 34, mb: 1 }} />
                <Typography sx={{ fontSize: "0.92rem", color: theme.palette.text.primary, lineHeight: 1.6, mb: 2.5, flex: 1 }}>
                  {t.quote}
                </Typography>
                <Rating value={t.score} readOnly size="small" sx={{ mb: 1.5, color: "#10b981" }} />
                <Stack direction="row" alignItems="center" spacing={1.2}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: "#10b981", fontSize: "0.85rem", fontWeight: 700 }}>
                    {t.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: theme.palette.text.primary }}>{t.name}</Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>{t.role}</Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ---------- CTA banner ---------- */}
      <Box sx={{ position: "relative", zIndex: 1, py: { xs: 7, md: 8 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              borderRadius: "20px",
              px: { xs: 3, md: 6 },
              py: { xs: 5, md: 6 },
              background: "linear-gradient(120deg, #0d9488, #10b981 60%, #0ea5e9)",
              textAlign: "center",
              boxShadow: `0 24px 48px ${alpha("#10b981", isDark ? 0.35 : 0.25)}`,
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
              sx={{
                background: "#fff",
                color: "#0d9488",
                fontWeight: 700,
                px: 4,
                py: 1.2,
                borderRadius: "10px",
                textTransform: "none",
                transition: "transform 0.2s ease",
                "&:hover": { background: "#f2f2f2", transform: "translateY(-2px)" },
              }}
            >
              Create free account
            </Button>
          </Box>
        </Container>
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Footer />
      </Box>

      <TourGuideBot />
    </Box>
  );
}