// src/components/Features.js
import React from "react";
import { Box, Container, Typography, Stack, useTheme } from "@mui/material";
import { HiOutlineChartBarSquare, HiOutlineBriefcase, HiOutlineLightBulb } from "react-icons/hi2";
import PremiumCard from "./PremiumCard";

const features = [
  {
    eyebrow: "01",
    icon: <HiOutlineChartBarSquare size={24} />,
    title: "In-depth Analysis",
    desc: "Section-by-section AI insights that highlight your strengths and flag what's holding your resume back.",
  },
  {
    eyebrow: "02",
    icon: <HiOutlineBriefcase size={24} />,
    title: "Career Portal",
    desc: "Real job listings integrated right into your dashboard — find and apply without leaving the app.",
  },
  {
    eyebrow: "03",
    icon: <HiOutlineLightBulb size={24} />,
    title: "Personalized Guidance",
    desc: "Skill gaps, course picks, and project ideas tailored to the role you're actually going for.",
  },
];

export default function Features() {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg">
        <Stack alignItems="center" textAlign="center" mb={6} spacing={1.2}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: theme.palette.primary.main,
            }}
          >
            Why CareerPilot?
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.8rem", md: "2.3rem" },
              color: theme.palette.text.primary,
              letterSpacing: "-0.02em",
            }}
          >
            Everything you need, in one place
          </Typography>
        </Stack>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
          {features.map((f, i) => (
            <PremiumCard key={f.title} index={i} eyebrow={f.eyebrow} icon={f.icon} title={f.title} desc={f.desc} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}