// src/components/Logo.js
import React from "react";
import { Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";


export default function Logo({ size = "md", withLink = true, light = false }) {
  const dims = { sm: 28, md: 36, lg: 48 };
  const fontSizes = { sm: "1.1rem", md: "1.4rem", lg: "1.9rem" };
  const px = dims[size];

  const content = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, userSelect: "none" }}>
      <Box
        component="svg"
        viewBox="0 0 48 48"
        sx={{ width: px, height: px, flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="cp-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="55%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        {/* compass / pilot mark replacing the plain document */}
        <circle cx="24" cy="24" r="20" fill="url(#cp-grad)" />
        <circle cx="24" cy="24" r="20" fill="none" stroke="#0f172a" strokeOpacity="0.12" strokeWidth="1.5" />
        {/* compass needle */}
        <path d="M24 10 28 24 24 38 20 24Z" fill="#0f172a" fillOpacity="0.85" />
        <path d="M24 10 28 24 24 24Z" fill="#ffffff" fillOpacity="0.9" />
        <circle cx="24" cy="24" r="2.6" fill="#ffffff" />
        {/* spark accent = "smart guidance" */}
        <path
          d="M37 6.5 38.3 9.7 41.5 11 38.3 12.3 37 15.5 35.7 12.3 32.5 11 35.7 9.7Z"
          fill="#fbbf24"
        />
      </Box>
      <Typography
        sx={{
          fontWeight: 800,
          letterSpacing: "-0.02em",
          fontSize: fontSizes[size],
          background: light
            ? "none"
            : "linear-gradient(90deg, #2dd4bf, #0ea5e9)",
          WebkitBackgroundClip: light ? "unset" : "text",
          WebkitTextFillColor: light ? "unset" : "transparent",
          color: light ? "#fff" : "inherit",
          lineHeight: 1,
        }}
      >
        Career<Box component="span" sx={{ color: "#fbbf24", WebkitTextFillColor: "#fbbf24" }}>Pilot</Box>
      </Typography>
    </Box>
  );

  return withLink ? (
    <RouterLink to="/" style={{ textDecoration: "none" }}>
      {content}
    </RouterLink>
  ) : (
    content
  );
}