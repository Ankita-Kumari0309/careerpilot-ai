// src/components/Sidebar.js
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  FiHome,
  FiUpload,
  FiBarChart2,
  FiBriefcase,
  FiBookmark,
  FiMic, // NEW
  FiLogOut,
  FiMenu,
  FiX,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import Logo from "./Logo";

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 84;

const navItems = [
  { name: "Home", path: "/welcome", icon: <FiHome size={19} /> },
  { name: "Upload", path: "/upload", icon: <FiUpload size={19} /> },
  { name: "Records", path: "/records", icon: <FiBarChart2 size={19} /> },
  { name: "Job Search", path: "/jobsearch", icon: <FiBriefcase size={19} /> },
  { name: "My Jobs", path: "/my-jobs", icon: <FiBookmark size={19} /> },
  { name: "Interview Prep", path: "/interview-prep", icon: <FiMic size={19} /> }, 
];

export default function Sidebar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const requestLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.clear();
      navigate("/login", { state: { sessionExpired: true } });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLogoutConfirmOpen(false);
    }
  };

  const width = collapsed && !isMobile ? COLLAPSED_WIDTH : EXPANDED_WIDTH;
  const showLabels = !collapsed || isMobile;

  const content = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: theme.palette.background.default,
      }}
    >
      
      <Box
        sx={{
          position: "absolute",
          top: -140,
          left: -100,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.custom?.glow1 || alpha(theme.palette.primary.main, 0.16)}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: theme.custom?.glass,
          backdropFilter: "blur(16px)",
          borderRight: isMobile ? "none" : `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12)}`,
        }}
      >
       
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={showLabels ? "space-between" : "center"}
          sx={{ px: showLabels ? 2.5 : 1, py: 2.6, minHeight: 72 }}
        >
          {showLabels && (
            <Box sx={{ opacity: 1, transition: "opacity 0.2s ease" }}>
              <Logo size="sm" />
            </Box>
          )}

          {isMobile ? (
            <IconButton
              onClick={() => setMobileOpen(false)}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": { color: theme.palette.primary.main, background: theme.custom?.glass },
              }}
            >
              <FiX size={20} />
            </IconButton>
          ) : (
            <IconButton
              onClick={() => setCollapsed((c) => !c)}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: "8px",
                transition: "transform 0.2s ease, color 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                  color: theme.palette.primary.main,
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
              }}
            >
              {collapsed ? <FiChevronsRight size={16} /> : <FiChevronsLeft size={16} />}
            </IconButton>
          )}
        </Stack>

        {!showLabels && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
            <Logo size="xs" />
          </Box>
        )}

        <Box
          sx={{
            mx: showLabels ? 2 : 1.2,
            height: "1px",
            background: theme.palette.divider,
            mb: 1.5,
          }}
        />

        {/* Nav items */}
        <Stack spacing={0.8} sx={{ px: showLabels ? 1.6 : 1, flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();
            const link = (
              <NavLink
                key={item.name}
                to={item.path}
                style={{ textDecoration: "none" }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.4}
                  sx={{
                    px: showLabels ? 1.8 : 0,
                    py: 1.15,
                    borderRadius: "10px",
                    justifyContent: showLabels ? "flex-start" : "center",
                    color: isActive ? "#fff" : theme.palette.text.secondary,
                    background: isActive
                      ? theme.palette.primary.main
                      : "transparent",
                    boxShadow: isActive
                      ? `0 8px 18px ${alpha(theme.palette.primary.main, 0.35)}`
                      : "none",
                    transition: "background 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      background: isActive
                        ? theme.palette.primary.main
                        : theme.custom?.glassBorder
                        ? alpha(theme.palette.primary.main, isDark ? 0.14 : 0.08)
                        : alpha(theme.palette.primary.main, 0.08),
                      color: isActive ? "#fff" : theme.palette.primary.main,
                      transform: "translateX(2px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  {showLabels && (
                    <Typography
                      sx={{
                        fontSize: "0.88rem",
                        fontWeight: isActive ? 700 : 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </Typography>
                  )}
                </Stack>
              </NavLink>
            );

            return showLabels ? (
              link
            ) : (
              <Tooltip key={item.name} title={item.name} placement="right">
                <Box>{link}</Box>
              </Tooltip>
            );
          })}
        </Stack>

        {/* Footer / logout */}
        <Box
          sx={{
            mx: showLabels ? 2 : 1.2,
            mb: 2,
            mt: 1,
          }}
        >
          <Box
            sx={{
              height: "1px",
              background: theme.palette.divider,
              mb: 1.4,
            }}
          />
          {showLabels ? (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.4}
              onClick={requestLogout}
              sx={{
                px: 1.8,
                py: 1.15,
                borderRadius: "10px",
                cursor: "pointer",
                color: "#dc2626",
                transition: "background 0.2s ease, transform 0.15s ease",
                "&:hover": {
                  background: alpha("#dc2626", isDark ? 0.16 : 0.08),
                  transform: "translateX(2px)",
                },
              }}
            >
              <FiLogOut size={19} />
              <Typography sx={{ fontSize: "0.88rem", fontWeight: 700 }}>Logout</Typography>
            </Stack>
          ) : (
            <Tooltip title="Logout" placement="right">
              <Stack
                alignItems="center"
                justifyContent="center"
                onClick={requestLogout}
                sx={{
                  py: 1.15,
                  borderRadius: "10px",
                  cursor: "pointer",
                  color: "#dc2626",
                  transition: "background 0.2s ease",
                  "&:hover": { background: alpha("#dc2626", isDark ? 0.16 : 0.08) },
                }}
              >
                <FiLogOut size={19} />
              </Stack>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Hamburger — mobile only, fixed top-left */}
      {isMobile && !mobileOpen && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 14,
            left: 14,
            zIndex: 1300,
            background: theme.custom?.glass,
            backdropFilter: "blur(10px)",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.custom?.cardShadow,
            color: theme.palette.text.primary,
            "&:hover": {
              color: theme.palette.primary.main,
              borderColor: alpha(theme.palette.primary.main, 0.5),
            },
          }}
        >
          <FiMenu size={20} />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: isMobile ? EXPANDED_WIDTH : width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: isMobile ? EXPANDED_WIDTH : width,
            boxSizing: "border-box",
            border: "none",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: 220,
            }),
          },
        }}
      >
        {content}
      </Drawer>

      {/* Logout confirmation dialog */}
      <Dialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.custom?.glass || theme.palette.background.paper,
            backdropFilter: "blur(16px)",
            border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.16)}`,
            minWidth: 320,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
          Log out?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem" }}>
            You'll need to log back in to access your dashboard and reports.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setLogoutConfirmOpen(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: theme.palette.text.secondary,
              borderRadius: "8px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmLogout}
            variant="contained"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              background: "#dc2626",
              "&:hover": { background: "#b91c1c" },
            }}
          >
            Log out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}