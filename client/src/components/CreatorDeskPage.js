// src/components/CreatorDeskPage.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  Stack,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ankitaImage from "../assets/Ankita professional pic.jpg";

const creator = {
  name: "Ankita Kumari",
  image: ankitaImage,
  email: "your-email@example.com",
  linkedin: "https://www.linkedin.com/in/ankita-kumari-59960a285/",
};

export default function CreatorDeskPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
          py: { xs: 7, md: 10 },
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          {/* Back button */}
          <Button
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
            sx={{
              mb: 3,
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
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
              From the Creator's Desk
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "1rem", maxWidth: 560, mx: "auto", lineHeight: 1.75 }}>
              CareerPilot was born out of a simple yet powerful idea — to help people present themselves better in
              front of recruiters, using AI to simplify tasks and enhance the job search experience.
            </Typography>
          </Box>

          {/* Creator card */}
          <Box
            sx={{
              p: { xs: 4, sm: 5 },
              borderRadius: "20px",
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.custom?.glass || theme.palette.background.paper,
              backdropFilter: "blur(16px)",
              textAlign: "center",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: theme.custom?.cardShadow,
              },
            }}
          >
            <Avatar
              src={creator.image}
              alt={creator.name}
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                mb: 2.5,
                border: `3px solid ${alpha(theme.palette.primary.main, 0.4)}`,
                boxShadow: theme.custom?.cardShadow,
              }}
            />
            <Typography variant="h5" fontWeight="bold" color="text.primary" mb={0.5}>
              {creator.name}
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem", mb: 3 }}>
              Creator & Developer, CareerPilot
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="center">
              <Button
                variant="outlined"
                size="small"
                startIcon={<LinkedInIcon />}
                href={creator.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderColor: alpha("#0a66c2", 0.4),
                  color: "#0a66c2",
                  fontWeight: 600,
                  borderRadius: "999px",
                  textTransform: "none",
                  px: 2.5,
                  "&:hover": { backgroundColor: alpha("#0a66c2", 0.08), borderColor: "#0a66c2" },
                }}
              >
                Connect on LinkedIn
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<MailOutlineIcon />}
                href={`mailto:${creator.email}`}
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  borderRadius: "999px",
                  textTransform: "none",
                  px: 2.5,
                  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.08), borderColor: theme.palette.primary.main },
                }}
              >
                Email me
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  );
}