// src/components/RouteLoader.js


import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, useTheme, alpha } from "@mui/material";

export default function RouteLoader() {
  const theme = useTheme();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  
  const timerIds = useRef([]);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    
    timerIds.current.forEach((id) => clearTimeout(id));
    timerIds.current = [];

    setVisible(true);
    setProgress(20);

    timerIds.current.push(setTimeout(() => setProgress(55), 80));
    timerIds.current.push(setTimeout(() => setProgress(80), 220));
    timerIds.current.push(
      setTimeout(() => {
        setProgress(100);
        timerIds.current.push(
          setTimeout(() => {
            setVisible(false);
            setProgress(0);
          }, 250)
        );
      }, 420)
    );

    return () => {
      timerIds.current.forEach((id) => clearTimeout(id));
    };
    
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3px",
        zIndex: 2000,
        backgroundColor: "transparent",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          height: "100%",
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.6)}, ${theme.palette.primary.main})`,
          boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.6)}`,
          transition: "width 0.25s ease-out, opacity 0.25s ease",
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </Box>
  );
}