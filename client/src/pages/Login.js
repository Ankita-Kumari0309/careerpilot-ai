// src/pages/Login.js
import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { auth, db, googleProvider } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Link as MuiLink,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import { FcGoogle } from "react-icons/fc";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";

export default function Login() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  
  const [checkingAuth, setCheckingAuth] = useState(true);

  const navigate = useNavigate();

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/welcome", { replace: true });
      } else {
        setCheckingAuth(false);
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      navigate("/welcome", { replace: true });
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      
      const userRef = doc(db, "users", user.email);
      const existing = await getDoc(userRef);
      if (!existing.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "",
          email: user.email,
          createdAt: new Date(),
        });
      }

      navigate("/welcome", { replace: true });
    } catch (error) {
      
      if (error.code !== "auth/popup-closed-by-user") {
        setErrorMsg(error.message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#f5fbfa",
      "& fieldset": { borderColor: theme.palette.divider },
      "&:hover fieldset": { borderColor: alpha(theme.palette.primary.main, 0.5) },
      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.primary.main },
  };

  
  if (checkingAuth) {
    return null; 
  }

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
      
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
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

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="xs" disableGutters>
          <MuiLink
            component={RouterLink}
            to="/"
            underline="none"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.6,
              mb: 3,
              color: theme.palette.text.secondary,
              fontSize: "0.85rem",
              fontWeight: 600,
              transition: "color 0.2s ease, transform 0.2s ease",
              "&:hover": { color: theme.palette.primary.main, transform: "translateX(-2px)" },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Back to home
          </MuiLink>

          <Stack alignItems="center" mb={3} spacing={1.2} textAlign="center">
            <Box sx={{ mb: 0.5 }}>
              <Logo size="md" />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.7rem", md: "1.9rem" },
                color: theme.palette.text.primary,
              }}
            >
              Welcome back
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", color: theme.palette.text.secondary }}>
              Log in to pick up where you left off.
            </Typography>
          </Stack>

          <Box
            sx={{
              background: theme.custom?.glass,
              backdropFilter: "blur(16px)",
              borderRadius: "18px",
              border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.16)}`,
              boxShadow: theme.custom?.cardShadow,
              p: { xs: 3, sm: 4 },
            }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              startIcon={!googleLoading && <FcGoogle size={20} />}
              sx={{
                py: 1.2,
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                color: theme.palette.text.primary,
                borderColor: theme.palette.divider,
                backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                transition: "transform 0.2s ease, border-color 0.2s ease, background 0.2s ease",
                "&:hover": {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  background: isDark ? "rgba(255,255,255,0.06)" : "#f5fbfa",
                  transform: "translateY(-1px)",
                },
              }}
            >
              {googleLoading ? "Connecting…" : "Continue with Google"}
            </Button>

            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ my: 2.5 }}>
              <Divider sx={{ flex: 1, borderColor: theme.palette.divider }} />
              <Typography sx={{ fontSize: "0.75rem", color: theme.palette.text.secondary, fontWeight: 600 }}>
                OR
              </Typography>
              <Divider sx={{ flex: 1, borderColor: theme.palette.divider }} />
            </Stack>

            <form onSubmit={handleLogin}>
              <TextField
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                required
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ fontSize: 20, color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ fontSize: 19 }} />
                        ) : (
                          <Visibility sx={{ fontSize: 19 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box textAlign="right" mt={0.5}>
                <MuiLink
                  component={RouterLink}
                  to="/forgot-password"
                  underline="hover"
                  sx={{ color: theme.palette.primary.main, fontWeight: 500, fontSize: "0.82rem" }}
                >
                  Forgot password?
                </MuiLink>
              </Box>

              {errorMsg && (
                <Typography
                  sx={{
                    mt: 2,
                    p: 1.2,
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    textAlign: "center",
                    color: "#dc2626",
                    background: alpha("#dc2626", 0.08),
                    border: `1px solid ${alpha("#dc2626", 0.2)}`,
                  }}
                >
                  {errorMsg}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={!loading && <ArrowForwardIcon />}
                sx={{
                  mt: 3,
                  py: 1.3,
                  background: "linear-gradient(90deg, #0d9488, #10b981)",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    background: "linear-gradient(90deg, #0f766e, #059669)",
                    boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.45)}`,
                  },
                }}
              >
                {loading ? "Logging in…" : "Log in"}
              </Button>
            </form>
          </Box>

          <Stack direction="row" spacing={0.7} justifyContent="center" mt={3.5}>
            <Typography sx={{ fontSize: "0.88rem", color: theme.palette.text.secondary }}>
              Don't have an account?
            </Typography>
            <MuiLink
              component={RouterLink}
              to="/signup"
              underline="hover"
              sx={{ color: theme.palette.primary.main, fontWeight: 700, fontSize: "0.88rem" }}
            >
              Sign up free
            </MuiLink>
          </Stack>

          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
            justifyContent="center"
            mt={2.5}
            sx={{ opacity: 0.75 }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
            <Typography sx={{ fontSize: "0.74rem", color: theme.palette.text.secondary }}>
              Secured with Firebase Authentication
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}