// src/components/Footer.js
import React from "react";
import { Box, Typography, Link as MuiLink, Container, Stack, useTheme, alpha } from "@mui/material";
import { Link } from "react-router-dom";
import { HiOutlineHeart } from "react-icons/hi2";
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from "react-icons/fi";
import Logo from "./Logo";

const socials = [
  { icon: <FiGithub size={17} />, href: "https://github.com", label: "GitHub" },
  { icon: <FiLinkedin size={17} />, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: <FiTwitter size={17} />, href: "https://twitter.com", label: "Twitter" },
  { icon: <FiMail size={17} />, href: "mailto:hello@careerpilot.app", label: "Email" },
];

const links = [
  { to: "/creator-desk", label: "From the creator desk" },
  { to: "/faq", label: "FAQ" },
  { to: "/about", label: "About" },
];

export default function Footer() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        background: theme.custom?.glass || (isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.02)"),
        backdropFilter: "blur(12px)",
        overflow: "hidden",
      }}
    >
      {/* Signature gradient hairline instead of a flat border */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, isDark ? 0.5 : 0.35)}, transparent)`,
        }}
      />

      {/* Soft ambient glow, consistent with the rest of the page */}
      <Box
        sx={{
          position: "absolute",
          bottom: -140,
          left: "50%",
          transform: "translateX(-50%)",
          width: 520,
          height: 280,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${alpha(theme.palette.primary.main, isDark ? 0.1 : 0.06)}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" disableGutters sx={{ position: "relative", zIndex: 1, px: { xs: 3, md: 8 }, py: { xs: 5, md: 6.5 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 3,
            mb: 3.5,
          }}
        >
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Logo size="sm" />
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.85rem", mt: 1.2, maxWidth: 320 }}>
              AI-powered resume analysis to help you land more interviews, faster.
            </Typography>
          </Box>

          <Stack direction="row" spacing={4}>
            {links.map((l) => (
              <MuiLink
                key={l.to}
                component={Link}
                to={l.to}
                underline="none"
                sx={{
                  position: "relative",
                  color: theme.palette.text.secondary,
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  transition: "color 0.25s ease",
                  "&:hover": { color: theme.palette.primary.main },
                  "&:hover::after": { width: "100%" },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    bottom: -4,
                    width: 0,
                    height: "1.5px",
                    background: theme.palette.primary.main,
                    transition: "width 0.25s ease",
                  },
                }}
              >
                {l.label}
              </MuiLink>
            ))}
          </Stack>
        </Box>

        {/* Social icon row */}
        <Stack direction="row" spacing={1.2} justifyContent={{ xs: "center", sm: "flex-start" }} mb={3.5}>
          {socials.map((s) => (
            <Box
              key={s.label}
              component="a"
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.palette.text.secondary,
                border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.14 : 0.1)}`,
                background: isDark ? "rgba(255,255,255,0.02)" : "rgba(15,23,42,0.015)",
                transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), color 0.25s ease, border-color 0.25s ease, background 0.25s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  color: theme.palette.primary.main,
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  background: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.06),
                },
              }}
            >
              {s.icon}
            </Box>
          ))}
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.5,
            pt: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.85rem",
              textAlign: "left",
              letterSpacing: "0.01em",
            }}
          >
            <Box component="span" sx={{ mr: 0.4 }}>
              &copy;
            </Box>
            <Box component="strong" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
              CareerPilot
            </Box>{" "}
            {new Date().getFullYear()}. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={0.6} alignItems="center">
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: "0.85rem" }}>
              Made with
            </Typography>
            <HiOutlineHeart size={14} color={theme.palette.primary.main} />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontSize: "0.85rem" }}>
              by the CareerPilot team
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}