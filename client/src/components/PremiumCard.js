// src/components/PremiumCard.js
import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, useTheme, alpha } from "@mui/material";


export default function PremiumCard({ icon, eyebrow, title, desc, index = 0 }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        flex: 1,
        borderRadius: "20px",
        position: "relative",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(26px)",
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${index * 0.12}s,
                     transform 0.65s cubic-bezier(0.16,1,0.3,1) ${index * 0.12}s`,
      }}
    >
      <Box
        sx={{
          height: "100%",
          borderRadius: "20px",
          p: 3.2,
          background: theme.custom?.glass || theme.palette.background.paper,
          backdropFilter: "blur(16px)",
          border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.16 : 0.12)}`,
          boxShadow: isDark
            ? "0 1px 0 rgba(255,255,255,0.03) inset"
            : "0 1px 0 rgba(255,255,255,0.6) inset",
          transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, border-color 0.35s ease",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            transform: "translateY(-6px)",
            borderColor: alpha(theme.palette.primary.main, isDark ? 0.5 : 0.4),
            boxShadow: theme.custom?.cardShadow
              ? `${theme.custom.cardShadow}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.15)}`
              : `0 20px 40px ${alpha(theme.palette.primary.main, isDark ? 0.25 : 0.14)}`,
          },
          "&:hover .premium-card-icon": {
            transform: "scale(1.08) rotate(-4deg)",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.28)}, ${alpha(
              theme.palette.primary.main,
              0.08
            )})`,
          },
        }}
      >
        {eyebrow && (
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              color: theme.palette.text.secondary,
              opacity: 0.45,
              letterSpacing: "0.06em",
              mb: 1.4,
            }}
          >
            {eyebrow}
          </Typography>
        )}

        <Box
          className="premium-card-icon"
          sx={{
            width: 46,
            height: 46,
            borderRadius: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.16)}, ${alpha(
              theme.palette.primary.main,
              0.05
            )})`,
            color: theme.palette.primary.main,
            mb: 2,
            transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), background 0.35s ease",
          }}
        >
          {icon}
        </Box>

        <Typography sx={{ fontWeight: 700, fontSize: "1.06rem", color: theme.palette.text.primary, mb: 0.9 }}>
          {title}
        </Typography>
        <Typography sx={{ fontSize: "0.9rem", color: theme.palette.text.secondary, lineHeight: 1.65 }}>
          {desc}
        </Typography>
      </Box>
    </Box>
  );
}