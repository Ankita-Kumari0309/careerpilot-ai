// src/pages/Record.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Button,
  Stack,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import BarChartIcon from "@mui/icons-material/BarChart";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddIcon from "@mui/icons-material/Add";
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

export default function Record() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const fetchUserDataAndReports = async () => {
      if (!user) return;

      try {
        
        if (user.displayName) {
          setFullName(user.displayName);
        } else {
          const userDocRef = doc(db, "users", user.email);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().name) {
            setFullName(userDocSnap.data().name);
          } else {
            setFullName(user.email);
          }
        }

        const q = query(
          collection(db, "users", user.email, "analysisReports"),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReports(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDataAndReports();
  }, [user]);

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Stack spacing={2.5} alignItems="center" textAlign="center">
          <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: theme.palette.text.primary }}>
            You must be logged in to view the dashboard.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{
              background: theme.palette.primary.main,
              color: "#fff",
              fontWeight: 700,
              px: 3.5,
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            Go to Login
          </Button>
        </Stack>
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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2.5}
          mb={5}
        >
          <Box>
            <Chip
              icon={<AutoAwesomeIcon sx={{ color: theme.palette.primary.main + " !important" }} />}
              label="Your reports"
              sx={{
                mb: 1.5,
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
                fontSize: { xs: "1.7rem", md: "2rem" },
                color: theme.palette.text.primary,
              }}
            >
              Welcome, {fullName || "there"}
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.92rem", mt: 0.5 }}>
              Track every resume analysis you've run and revisit past reports.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/upload")}
            sx={{
              background: theme.palette.primary.main,
              color: "#fff",
              fontWeight: 700,
              px: 3,
              py: 1.1,
              borderRadius: "10px",
              textTransform: "none",
              whiteSpace: "nowrap",
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                background: "#4f46e5",
                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            Analyze new resume
          </Button>
        </Stack>

        {/* Content */}
        {loading ? (
          <Stack alignItems="center" py={10}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
          </Stack>
        ) : reports.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              px: 3,
              borderRadius: "18px",
              background: theme.custom?.glass,
              backdropFilter: "blur(16px)",
              border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.16)}`,
              boxShadow: theme.custom?.cardShadow,
            }}
          >
            <FolderOffOutlinedIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1.5 }} />
            <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.5 }}>
              No analysis reports yet
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem" }}>
              Run your first resume analysis to see it show up here.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {reports.map((report) => (
              <Accordion
                key={report.id}
                disableGutters
                elevation={0}
                sx={{
                  borderRadius: "16px !important",
                  overflow: "hidden",
                  background: theme.custom?.glass,
                  backdropFilter: "blur(16px)",
                  border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.2 : 0.14)}`,
                  boxShadow: theme.custom?.cardShadow,
                  "&:before": { display: "none" },
                  transition: "box-shadow 0.2s ease",
                  "&:hover": {
                    boxShadow: `${theme.custom?.cardShadow}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.18)}`,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.text.secondary }} />}
                  sx={{ px: 2.6, py: 0.6 }}
                >
                  <Box sx={{ width: "100%" }}>
                    <Stack direction="row" spacing={0.7} alignItems="center" mb={0.7}>
                      <EventOutlinedIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                      <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>
                        {report.createdAt?.toDate().toLocaleString() || "Unknown date"}
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: theme.palette.text.primary,
                        mb: 1,
                      }}
                    >
                      {report.jobTitle || "Untitled role"}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        size="small"
                        icon={<WorkOutlineIcon sx={{ fontSize: 14, color: theme.palette.primary.main + " !important" }} />}
                        label={report.jobTitle || "Not specified"}
                        sx={{
                          background: theme.custom?.chipBg,
                          color: theme.custom?.chipText,
                          fontWeight: 600,
                          fontSize: "0.72rem",
                        }}
                      />
                      <Chip
                        size="small"
                        icon={<BarChartIcon sx={{ fontSize: 14, color: theme.palette.primary.main + " !important" }} />}
                        label={report.experienceLevel || "Not specified"}
                        sx={{
                          background: theme.custom?.chipBg,
                          color: theme.custom?.chipText,
                          fontWeight: 600,
                          fontSize: "0.72rem",
                        }}
                      />
                    </Stack>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 2.6, pb: 2.8, pt: 0 }}>
                  <Box
                    sx={{
                      height: "1px",
                      background: theme.palette.divider,
                      mb: 2.4,
                    }}
                  />

                  <Box id={`pdf-content-${report.id}`}>
                    <Stack direction="row" spacing={0.8} alignItems="center" mb={1}>
                      <DescriptionOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                      <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: theme.palette.text.primary }}>
                        Job Description
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        whiteSpace: "pre-wrap",
                        fontSize: "0.85rem",
                        color: theme.palette.text.secondary,
                        lineHeight: 1.7,
                        mb: 2.4,
                      }}
                    >
                      {report.jobDescription}
                    </Typography>

                    <Stack direction="row" spacing={0.8} alignItems="center" mb={1}>
                      <DescriptionOutlinedIcon sx={{ fontSize: 16, color: theme.palette.primary.main }} />
                      <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: theme.palette.text.primary }}>
                        Resume Summary
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        whiteSpace: "pre-wrap",
                        fontSize: "0.85rem",
                        color: theme.palette.text.secondary,
                        lineHeight: 1.7,
                      }}
                    >
                      {report.resumeText?.substring(0, 500)}...
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 17 }} />}
                    onClick={() =>
                      navigate("/result", {
                        state: {
                          llmAnalysis: report.llmAnalysis,
                          resumeText: report.resumeText,
                          jobDescription: report.jobDescription,
                          jobTitle: report.jobTitle,
                          experienceLevel: report.experienceLevel,
                          isNewAnalysis: false,
                        },
                      })
                    }
                    sx={{
                      mt: 2.8,
                      borderColor: theme.palette.divider,
                      color: theme.palette.text.primary,
                      fontWeight: 700,
                      borderRadius: "10px",
                      textTransform: "none",
                      px: 2.6,
                      py: 0.9,
                      transition: "transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        background: theme.custom?.glass,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    View full analysis
                  </Button>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}