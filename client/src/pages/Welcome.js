// src/pages/Welcome.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DescriptionIcon from "@mui/icons-material/Description";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NightlightOutlinedIcon from "@mui/icons-material/NightlightOutlined";
import { Link as RouterLink } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { gradients } from "../theme/ThemeContext";
import { GuideChecklist, AssistantBubble } from "../components/HomeGuide";


const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 5) return { label: "Good night", Icon: NightlightOutlinedIcon };
  if (hour < 12) return { label: "Good morning", Icon: WbSunnyOutlinedIcon };
  if (hour < 17) return { label: "Good afternoon", Icon: LightModeOutlinedIcon };
  if (hour < 21) return { label: "Good evening", Icon: DarkModeOutlinedIcon };
  return { label: "Good night", Icon: NightlightOutlinedIcon };
};

export default function Welcome() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [userName, setUserName] = useState("");
  const { label: greetingLabel, Icon: GreetingIcon } = getGreeting();

  useEffect(() => {
    const loadUserName = async () => {
      const user = auth.currentUser;
      if (!user) return;

      if (user.displayName) {
        setUserName(user.displayName.split(" ")[0]);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.email));
        if (snap.exists() && snap.data().name) {
          setUserName(snap.data().name.split(" ")[0]);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    };

    loadUserName();
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        py: { xs: 8, md: 12 },
        display: "flex",
        alignItems: "center",
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
        <Box textAlign="center" mb={5}>
          <Chip
            icon={<GreetingIcon sx={{ color: "#fff !important", fontSize: 17 }} />}
            label={userName ? `${greetingLabel}, ${userName}` : greetingLabel}
            sx={{
              background: gradients.primary,
              color: "#fff",
              mb: 2.5,
              fontWeight: 700,
              px: 1,
              py: 2.1,
              fontSize: "0.85rem",
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          />
          <Typography
            variant="h2"
            fontWeight={800}
            gutterBottom
            sx={{
              color: theme.palette.text.primary,
              letterSpacing: "-0.03em",
              fontSize: { xs: "2.4rem", md: "3rem" },
            }}
          >
            Welcome to{" "}
            <Box component="span" sx={{ color: theme.palette.primary.main }}>
              CareerPilot
            </Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 400,
              maxWidth: "700px",
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.15rem" },
            }}
          >
            A smart and friendly platform for analyzing your resume based on job description and personalized insights.
          </Typography>
        </Box>

        <GuideChecklist />

        {/* Info Card */}
        <Box
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: "20px",
            background: theme.custom?.glass,
            backdropFilter: "blur(16px)",
            border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.16)}`,
            boxShadow: theme.custom?.cardShadow,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: "16px",
              background: theme.custom?.chipBg,
              mb: 2.5,
            }}
          >
            <DescriptionIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
          </Box>

          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: theme.palette.text.primary, mb: 2.5, letterSpacing: "-0.01em" }}
          >
            How CareerPilot helps you
          </Typography>

          <Stack spacing={2} sx={{ mb: 1 }}>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.98rem", lineHeight: 1.7 }}>
              Upload your resume and simply paste or upload the job description (JD) you're targeting.
              Our AI compares the two, analyzes keyword alignment and skill gaps, and suggests practical improvements.
            </Typography>

            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.98rem", lineHeight: 1.7 }}>
              Revisit your{" "}
              <Box component="span" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                past reports
              </Box>{" "}
              anytime to track how your resume has improved — from keyword match to actionable tips.
            </Typography>

            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.98rem", lineHeight: 1.7 }}>
              At the core, we use{" "}
              <Box component="span" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                Gemini LLM
              </Box>{" "}
              to generate smart suggestions, analyze your content deeply, and make your resume recruiter-ready.
            </Typography>
          </Stack>

          <Typography
            sx={{
              mt: 1,
              mb: 4,
              fontWeight: 600,
              color: theme.palette.text.primary,
              fontSize: "0.95rem",
            }}
          >
            📄 Download your report anytime to improve your resume, apply for jobs, and confidently crack interviews.
          </Typography>

          <Button
            component={RouterLink}
            to="/upload"
            variant="contained"
            size="large"
            endIcon={<RocketLaunchIcon sx={{ fontSize: 19 }} />}
            sx={{
              background: theme.palette.primary.main,
              color: "#fff",
              fontWeight: 700,
              px: 4.5,
              py: 1.3,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: "1rem",
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                background: "#4f46e5",
                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.45)}`,
              },
            }}
          >
            Start My Resume Analysis
          </Button>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            mt: 7,
            p: { xs: 4, md: 6 },
            textAlign: "center",
            borderRadius: "20px",
            background: gradients.primary,
            boxShadow: `0 24px 48px ${alpha(theme.palette.primary.main, isDark ? 0.35 : 0.25)}`,
          }}
        >
          <RocketLaunchIcon sx={{ fontSize: 46, color: "#fff" }} />
          <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.4rem", md: "1.7rem" }, color: "#fff", mt: 1.5, mb: 1, letterSpacing: "-0.02em" }}>
            Ready to stand out to recruiters?
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.85)", mb: 3.5, fontSize: "0.95rem" }}>
            Upload your resume, get a deep analysis, and take your career to the next level.
          </Typography>

          <Button
            component={RouterLink}
            to="/upload"
            variant="contained"
            size="large"
            sx={{
              background: "#fff",
              color: theme.palette.primary.main,
              fontWeight: 700,
              px: 4,
              py: 1.2,
              borderRadius: "10px",
              textTransform: "none",
              transition: "transform 0.2s ease",
              "&:hover": { background: "#f2f2f2", transform: "translateY(-2px)" },
            }}
          >
            Upload resume
          </Button>
        </Box>
      </Container>

      
      <AssistantBubble />
    </Box>
  );
}