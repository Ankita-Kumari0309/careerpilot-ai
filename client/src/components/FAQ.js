// src/pages/FAQPage.js
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  Container,
  Typography,
  Box,
  Chip,
  Stack,
  InputBase,
  Button,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const faqCategories = ["All", "General", "Account", "Resume", "Jobs", "Pricing"];

const faqData = [
  {
    category: "General",
    question: "What is CareerPilot and how does it work?",
    answer:
      "CareerPilot is an AI-powered resume optimization platform that analyzes your resume against a job description and gives you a tailored action plan — matched skills, gaps, and what to fix.",
  },
  {
    category: "Account",
    question: "Is my resume data secure?",
    answer:
      "Yes. Your data is encrypted in transit and at rest, and we never share your information with third parties without your consent.",
  },
  {
    category: "Jobs",
    question: "Can CareerPilot help me find and apply to jobs?",
    answer:
      "Yes — our Job Search feature surfaces matched listings straight into your dashboard, and My Jobs Tracker lets you keep tabs on every application's status.",
  },
  {
    category: "Account",
    question: "Do I need to create an account to use CareerPilot?",
    answer:
      "You can try a basic analysis without signing up, but you'll need a free account to save reports, track applications, and access job matching.",
  },
  {
    category: "Resume",
    question: "Does CareerPilot support multiple resume formats?",
    answer:
      "Yes, we support PDF and DOCX. For the most accurate analysis, make sure your resume is text-based rather than a scanned image.",
  },
  {
    category: "Pricing",
    question: "Is CareerPilot free to use?",
    answer:
      "Yes! Core features — resume analysis, report records, and job search — are free. Premium tools like advanced interview prep are optional add-ons.",
  },
  {
    category: "Resume",
    question: "What is Report Records?",
    answer:
      "Every analysis you run is saved to your Report Records, so you can track how your match score improves as you refine your resume over time.",
  },
  {
    category: "Jobs",
    question: "How does the Career Assistant work?",
    answer:
      "Career Assistant is an AI chat that already knows your resume and history, and suggests the next best step — whether that's a skill to add or a job to apply to.",
  },
  {
    category: "General",
    question: "Can I practice for interviews on CareerPilot?",
    answer:
      "Yes, Interview Prep lets you run mock interviews tailored to your target role so you can practice before the real thing.",
  },
  {
    category: "Account",
    question: "How do I delete my account and data?",
    answer:
      "You can request account and data deletion anytime from your profile settings. Your data is permanently removed within a short processing window.",
  },
];

export default function FAQPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Box
      sx={{
        minHeight: "100vh",
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

      <Navbar />

      <Box sx={{ position: "relative", zIndex: 1, px: 2, pt: { xs: 7, md: 9 }, pb: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          {/* Back button */}
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
            sx={{
              mb: 2,
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

          {/* Header */}
          <Stack
            alignItems="center"
            textAlign="center"
            mb={5}
            spacing={1.4}
            sx={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(18px)",
              transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <Chip
              icon={<AutoAwesomeIcon sx={{ color: theme.palette.primary.main + " !important" }} />}
              label="Support Center"
              sx={{
                px: 1,
                color: theme.custom?.chipText,
                background: theme.custom?.chipBg,
                border: `1px solid ${theme.palette.divider}`,
                fontWeight: 600,
              }}
            />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontSize: { xs: "2rem", md: "2.4rem" },
                color: theme.palette.text.primary,
              }}
            >
              Frequently Asked Questions
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.95rem", maxWidth: 480 }}>
              Everything you need to know about CareerPilot, from your first upload to your last interview.
            </Typography>
          </Stack>

          {/* Search bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 0.8,
              mb: 3,
              borderRadius: "12px",
              background: theme.custom?.glass || theme.palette.background.paper,
              backdropFilter: "blur(10px)",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <SearchIcon sx={{ color: theme.palette.text.secondary, mr: 1 }} />
            <InputBase
              fullWidth
              placeholder="Search your question..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ color: theme.palette.text.primary, fontSize: "0.92rem" }}
            />
          </Box>

          {/* Category filters */}
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" mb={4} useFlexGap>
            {faqCategories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setActiveCategory(cat)}
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    background: active ? theme.palette.primary.main : theme.custom?.chipBg,
                    color: active ? "#fff" : theme.custom?.chipText,
                    border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
                    transition: "transform 0.2s ease, background 0.2s ease",
                    "&:hover": {
                      background: active ? theme.palette.primary.main : alpha(theme.palette.primary.main, isDark ? 0.16 : 0.1),
                      transform: "translateY(-1px)",
                    },
                  }}
                />
              );
            })}
          </Stack>

          {/* FAQ list */}
          {filteredFaqs.length === 0 ? (
            <Typography textAlign="center" sx={{ color: theme.palette.text.secondary, mt: 5 }}>
              No matching questions found. Try a different search or category.
            </Typography>
          ) : (
            <Stack spacing={1.6}>
              {filteredFaqs.map((faq, index) => (
                <Accordion
                  key={index}
                  disableGutters
                  sx={{
                    borderRadius: "14px !important",
                    overflow: "hidden",
                    background: theme.custom?.glass || theme.palette.background.paper,
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: "none",
                    transition: "border-color 0.3s ease, transform 0.3s ease",
                    "&:before": { display: "none" },
                    "&:hover": { borderColor: alpha(theme.palette.primary.main, 0.4) },
                    "&.Mui-expanded": { borderColor: alpha(theme.palette.primary.main, 0.5) },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />}
                    sx={{ px: 2.5, py: 0.5 }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: theme.palette.text.primary }}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2.5, pb: 2.2 }}>
                    <Typography sx={{ fontSize: "0.87rem", color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}

          <Box
            sx={{
              mt: 6,
              textAlign: "center",
              borderRadius: "16px",
              px: 3,
              py: 4,
              border: `1px solid ${theme.palette.divider}`,
              background: theme.custom?.glass || theme.palette.background.paper,
              backdropFilter: "blur(10px)",
            }}
          >
            <HelpOutlineIcon sx={{ color: theme.palette.primary.main, fontSize: 30, mb: 1 }} />
            <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
              Still have a question?
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.87rem" }}>
              Reach out to us through the Career Assistant chat inside your dashboard, and we'll point you in the right direction.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}