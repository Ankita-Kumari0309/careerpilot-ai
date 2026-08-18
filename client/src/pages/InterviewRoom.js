// src/pages/InterviewRoom.js

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  useTheme,
  alpha,
  keyframes,
} from "@mui/material";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StopCircleOutlinedIcon from "@mui/icons-material/StopCircleOutlined";

const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000";

const SPEAKING_THRESHOLD = 0.02;
const SILENCE_MS = 1800;
const MIN_RECORD_MS = 800;
const MAX_RECORD_MS = 90000;
const QUESTIONS_PER_SESSION = 6; 
const BAR_COUNT = 5;

const LIVE_PHASES = ["speaking", "listening", "processing"];

function formatClock(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}


const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;
const bubbleIn = keyframes`
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;
const talkBar = keyframes`
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
`;
const idleBreathe = keyframes`
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(0.5); }
`;
const popIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const ringPulse = keyframes`
  0% { transform: scale(1); opacity: 0.55; }
  100% { transform: scale(1.4); opacity: 0; }
`;

export default function InterviewRoom() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const { sessionId, firstQuestion, durationMinutes } = location.state || {};

  const [phase, setPhase] = useState("init");
  const [currentQuestion, setCurrentQuestion] = useState(firstQuestion || "");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [log, setLog] = useState([]);
  const [report, setReport] = useState(null);
  const [displayedScore, setDisplayedScore] = useState(0);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState((durationMinutes || 20) * 60);

  
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState("");

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const rafRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const lastSpeechTimeRef = useRef(0);
  const recordStartRef = useRef(0);
  const barRefs = useRef([]);
  
  const endedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || !firstQuestion) {
      setError("No active interview session. Start one from Interview Prep.");
      setPhase("error");
    }
   
  }, []);

  useEffect(() => {
    if (phase === "report" || phase === "error") return;
    const timer = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close?.();
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  
  useEffect(() => {
    if (phase !== "report" || !report) return;
    let raf;
    const target = report.overall_score || 0;
    const start = performance.now();
    const DURATION = 800;
    const step = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      setDisplayedScore(Math.round(target * t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    if (reduceMotion) {
      setDisplayedScore(target);
    } else {
      raf = requestAnimationFrame(step);
    }
    return () => cancelAnimationFrame(raf);
    
  }, [phase, report]);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    });
  }, []);

  const ensureStream = useCallback(async () => {
   
    const isLive = streamRef.current?.getTracks().some((t) => t.readyState === "live");
    if (streamRef.current && isLive) return streamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;

    return stream;
  }, []);

  
  const monitorSilence = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const timeData = new Uint8Array(analyser.fftSize);
    const freqData = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteTimeDomainData(timeData);
      analyser.getByteFrequencyData(freqData);

      let sumSquares = 0;
      for (let i = 0; i < timeData.length; i++) {
        const norm = (timeData[i] - 128) / 128;
        sumSquares += norm * norm;
      }
      const rms = Math.sqrt(sumSquares / timeData.length);
      const now = performance.now();

      if (rms > SPEAKING_THRESHOLD) {
        hasSpokenRef.current = true;
        lastSpeechTimeRef.current = now;
      }

      
      for (let i = 0; i < BAR_COUNT; i++) {
        const bar = barRefs.current[i];
        if (!bar) continue;
        const idx = Math.floor(((i + 1) / (BAR_COUNT + 1)) * freqData.length);
        const level = freqData[idx] / 255; // 0..1
        const scale = 0.25 + level * 1.1;
        bar.style.transform = `scaleY(${Math.min(1.4, scale)})`;
      }

      const elapsed = now - recordStartRef.current;
      const silentFor = now - lastSpeechTimeRef.current;

      if (elapsed > MAX_RECORD_MS) {
        stopRecording();
        return;
      }
      if (hasSpokenRef.current && elapsed > MIN_RECORD_MS && silentFor > SILENCE_MS) {
        stopRecording();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    
  }, []);

  const startRecording = useCallback(async () => {
    if (endedRef.current) return;
    try {
      const stream = await ensureStream();
      if (endedRef.current) return; 
      chunksRef.current = [];
      hasSpokenRef.current = false;
      lastSpeechTimeRef.current = performance.now();
      recordStartRef.current = performance.now();

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        cancelAnimationFrame(rafRef.current);
        barRefs.current.forEach((bar) => bar && (bar.style.transform = "scaleY(0.3)"));
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        processAnswer(blob);
      };
      recorderRef.current = recorder;
      recorder.start();
      setPhase("listening");
      monitorSilence();
    } catch (err) {
      console.error("Mic access failed:", err);
      setError(`Mic access failed: ${err.message}`);
      setPhase("error");
    }
    
  }, [ensureStream, monitorSilence]);

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  };

  const runTurn = useCallback(
    async (questionText, qNum) => {
      if (endedRef.current) return;
      setCurrentQuestion(questionText);
      setQuestionNumber(qNum);
      setLog((prev) => [...prev, { role: "assistant", text: questionText }]);
      setPhase("speaking");
      await speak(questionText);
      if (endedRef.current) return; 
      startRecording();
    },
    [speak, startRecording]
  );

  const processAnswer = async (blob) => {
    if (endedRef.current) return; 
    setPhase("processing");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "answer.webm");
      const transcribeRes = await fetch(`${API_BASE}/api/interview/transcribe`, {
        method: "POST",
        body: formData,
      });
      const transcribeData = await transcribeRes.json();
      if (!transcribeRes.ok) throw new Error(transcribeData.error || "Transcription failed");
      if (endedRef.current) return; 

      const answerText = transcribeData.text || "(no speech detected)";
      setLog((prev) => [...prev, { role: "user", text: answerText }]);

      const answerRes = await fetch(`${API_BASE}/api/interview/${sessionId}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: answerText }),
      });
      const answerData = await answerRes.json();
      if (!answerRes.ok) throw new Error(answerData.error || "Failed to submit answer");
      if (endedRef.current) return; 

      if (answerData.complete) {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setReport(answerData.report);
        setPhase("report");
      } else {
        runTurn(answerData.question, Math.min(QUESTIONS_PER_SESSION, questionNumber + 1));
      }
    } catch (err) {
      if (endedRef.current) return; 
      console.error("Turn failed:", err);
      setError(err.message || "Something went wrong during the interview.");
      setPhase("error");
    }
  };

  
  const openEndDialog = () => {
    setEndError("");
    setEndDialogOpen(true);
  };

  const confirmEndInterview = async () => {
    if (!sessionId) return;
    endedRef.current = true; 
    setEnding(true);
    setEndError("");
    try {
      
      window.speechSynthesis?.cancel?.();
      cancelAnimationFrame(rafRef.current);
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.onstop = null; // don't trigger processAnswer
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());

      const res = await fetch(`${API_BASE}/api/interview/${sessionId}/end`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't end the interview.");

      setReport(data.report);
      setPhase("report");
      setEndDialogOpen(false);
    } catch (err) {
      console.error("Failed to end interview:", err);
      setEndError(err.message || "Something went wrong ending the interview.");
    } finally {
      setEnding(false);
    }
  };

  useEffect(() => {
    if (sessionId && firstQuestion && phase === "init") {
      runTurn(firstQuestion, 1);
    }
    
  }, [sessionId, firstQuestion]);

  const cardSx = {
    borderRadius: "16px",
    background: theme.custom?.glass || theme.palette.background.paper,
    backdropFilter: "blur(16px)",
    border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.2 : 0.14)}`,
    boxShadow: theme.custom?.cardShadow,
  };

  const phaseCopy = {
    init: "Getting ready…",
    speaking: "Interviewer is asking a question…",
    listening: "Listening — go ahead, answer naturally.",
    processing: "Transcribing your answer…",
  };

  const barColor =
    phase === "listening" ? "#dc2626" : phase === "speaking" ? theme.palette.primary.main : theme.palette.text.secondary;

  const barAnimation = (i) => {
    if (reduceMotion) return "none";
    if (phase === "speaking") return `${talkBar} ${0.6 + i * 0.08}s ease-in-out infinite`;
    if (phase === "listening") return "none"; // JS-driven
    return `${idleBreathe} 2.2s ease-in-out infinite`;
  };

  const answeredCount = log.filter((l) => l.role === "user").length;

  if (phase === "error") {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="sm">
          <Box sx={{ ...cardSx, p: 4, textAlign: "center", animation: reduceMotion ? "none" : `${popIn} 0.3s ease` }}>
            <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
              Couldn't continue the interview
            </Typography>
            <Typography sx={{ color: theme.palette.text.secondary, mb: 3, fontSize: "0.9rem" }}>
              {error}
            </Typography>
            <Button variant="contained" onClick={() => navigate("/interview-prep")}>
              Back to Interview Prep
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  if (phase === "report" && report) {
    return (
      <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.default, py: 6 }}>
        <Container maxWidth="sm">
          <Stack alignItems="center" textAlign="center" mb={3} spacing={1} sx={{ animation: reduceMotion ? "none" : `${fadeSlideUp} 0.4s ease` }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 34, color: theme.palette.primary.main }} />
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: "-0.01em", color: theme.palette.text.primary }}>
              Interview complete
            </Typography>
          </Stack>

          <Box sx={{ ...cardSx, p: 3, mb: 2.5, textAlign: "center", animation: reduceMotion ? "none" : `${fadeSlideUp} 0.4s ease 0.05s both` }}>
            <Typography sx={{ fontSize: "0.8rem", color: theme.palette.text.secondary, mb: 0.5 }}>
              Overall score
            </Typography>
            <Typography sx={{ fontSize: "2.6rem", fontWeight: 800, color: theme.palette.primary.main, lineHeight: 1 }}>
              {displayedScore}/10
            </Typography>
            <Typography sx={{ mt: 1.5, color: theme.palette.text.primary, fontSize: "0.92rem" }}>
              {report.summary}
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2.5}>
            <Box sx={{ ...cardSx, p: 2.5, flex: 1, animation: reduceMotion ? "none" : `${fadeSlideUp} 0.4s ease 0.1s both` }}>
              <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1, fontSize: "0.9rem" }}>
                Strengths
              </Typography>
              <Stack spacing={0.7}>
                {(report.strengths || []).map((s, i) => (
                  <Typography key={i} sx={{ fontSize: "0.85rem", color: theme.palette.text.secondary, animation: reduceMotion ? "none" : `${fadeSlideUp} 0.35s ease ${0.15 + i * 0.06}s both` }}>
                    • {s}
                  </Typography>
                ))}
              </Stack>
            </Box>
            <Box sx={{ ...cardSx, p: 2.5, flex: 1, animation: reduceMotion ? "none" : `${fadeSlideUp} 0.4s ease 0.15s both` }}>
              <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1, fontSize: "0.9rem" }}>
                Areas to improve
              </Typography>
              <Stack spacing={0.7}>
                {(report.areas_to_improve || []).map((s, i) => (
                  <Typography key={i} sx={{ fontSize: "0.85rem", color: theme.palette.text.secondary, animation: reduceMotion ? "none" : `${fadeSlideUp} 0.35s ease ${0.2 + i * 0.06}s both` }}>
                    • {s}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Stack>

          <Box sx={{ ...cardSx, p: 2.5, mb: 3, animation: reduceMotion ? "none" : `${fadeSlideUp} 0.4s ease 0.2s both` }}>
            <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1.5, fontSize: "0.9rem" }}>
              Question-by-question feedback
            </Typography>
            <Stack spacing={2}>
              {(report.per_question_feedback || []).map((qa, i) => (
                <Box
                  key={i}
                  sx={{
                    pb: 1.5,
                    borderBottom: i < report.per_question_feedback.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                    animation: reduceMotion ? "none" : `${fadeSlideUp} 0.35s ease ${0.25 + i * 0.05}s both`,
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: theme.palette.text.primary, mb: 0.4 }}>
                    {qa.question}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", color: theme.palette.text.secondary }}>
                    {qa.feedback}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Stack alignItems="center">
            <Button
              variant="contained"
              onClick={() => navigate("/interview-prep")}
              sx={{ borderRadius: "999px", textTransform: "none", fontWeight: 700, px: 4 }}
            >
              Start another interview
            </Button>
          </Stack>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: theme.palette.background.default, py: 6, position: "relative", overflow: "hidden" }}>
      
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
          left: -140,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, isDark ? 0.1 : 0.08)}, transparent 72%)`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        {/* header row — progress on the left, End interview always reachable on the right */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: theme.palette.text.secondary }}>
            Question {questionNumber} of {QUESTIONS_PER_SESSION}
          </Typography>

          {LIVE_PHASES.includes(phase) && (
            <Button
              size="small"
              onClick={openEndDialog}
              startIcon={<StopCircleOutlinedIcon sx={{ fontSize: 17 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.76rem",
                color: theme.palette.text.secondary,
                borderRadius: "999px",
                px: 1.4,
                py: 0.4,
                minWidth: 0,
                transition: "color 0.15s ease, background 0.15s ease",
                "&:hover": { color: "#dc2626", background: alpha("#dc2626", 0.08) },
              }}
            >
              End interview
            </Button>
          )}
        </Stack>

       
        <Box sx={{ display: "flex", gap: 0.7, mb: 3, mx: "auto", maxWidth: 260 }}>
          {Array.from({ length: QUESTIONS_PER_SESSION }).map((_, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i < questionNumber ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.15),
                transition: "background 0.4s ease",
              }}
            />
          ))}
        </Box>

        <Stack direction="row" justifyContent="center" mb={3}>
          <Chip
            icon={<TimerOutlinedIcon sx={{ color: remaining === 0 ? "#dc2626 !important" : undefined }} />}
            label={remaining === 0 ? "Time's up — wrap up when ready" : formatClock(remaining)}
            sx={{
              fontWeight: 700,
              color: remaining === 0 ? "#dc2626" : theme.palette.text.primary,
              background: theme.custom?.chipBg,
              border: `1px solid ${theme.palette.divider}`,
            }}
          />
        </Stack>

  
        <Stack alignItems="center" mb={3}>
          <Box sx={{ position: "relative", width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {phase === "listening" && !reduceMotion && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `2px solid ${alpha(barColor, 0.45)}`,
                  animation: `${ringPulse} 1.7s ease-out infinite`,
                }}
              />
            )}
            <Box
              sx={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                background: `radial-gradient(circle at 50% 40%, ${alpha(barColor, 0.16)}, ${alpha(barColor, 0.06)} 70%)`,
                border: `2px solid ${alpha(barColor, 0.4)}`,
                boxShadow: phase === "listening" ? `0 0 0 10px ${alpha(barColor, 0.08)}` : "none",
                transition: "box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease",
              }}
            >
              {phase === "processing" ? (
                <HourglassEmptyIcon sx={{ fontSize: 38, color: barColor, animation: reduceMotion ? "none" : "spin 1.2s linear infinite", "@keyframes spin": { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } } }} />
              ) : (
                Array.from({ length: BAR_COUNT }).map((_, i) => (
                  <Box
                    key={i}
                    ref={(el) => (barRefs.current[i] = el)}
                    sx={{
                      width: 6,
                      height: 44,
                      borderRadius: 3,
                      background: barColor,
                      transformOrigin: "center",
                      transform: "scaleY(0.3)",
                      animation: barAnimation(i),
                      transition: phase === "listening" ? "none" : "transform 0.25s ease",
                    }}
                  />
                ))
              )}
            </Box>
          </Box>
          <Typography sx={{ mt: 1.5, fontSize: "0.85rem", fontWeight: 600, color: theme.palette.text.secondary }}>
            {phaseCopy[phase] || ""}
          </Typography>
        </Stack>

        <Box key={currentQuestion} sx={{ ...cardSx, p: 3, mb: 2.5, animation: reduceMotion ? "none" : `${fadeSlideUp} 0.35s ease` }}>
          <Typography sx={{ fontSize: "0.78rem", color: theme.palette.text.secondary, mb: 0.5 }}>
            Current question
          </Typography>
          <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: "1.05rem" }}>
            {currentQuestion}
          </Typography>
        </Box>

        {phase === "listening" && (
          <Stack alignItems="center" mb={2.5}>
            <Button
              variant="outlined"
              onClick={stopRecording}
              sx={{
                borderRadius: "999px",
                textTransform: "none",
                fontWeight: 700,
                transition: "transform 0.15s ease",
                "&:hover": { transform: "translateY(-1px)" },
              }}
            >
              I'm done answering
            </Button>
          </Stack>
        )}

        {log.length > 0 && (
          <Box sx={{ ...cardSx, p: 2.5, maxHeight: 260, overflowY: "auto" }}>
            <Stack spacing={1.2}>
              {log.map((entry, i) => (
                <Box
                  key={i}
                  sx={{
                    alignSelf: entry.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    px: 1.6,
                    py: 1,
                    borderRadius: "12px",
                    background: entry.role === "user" ? alpha(theme.palette.primary.main, 0.14) : isDark ? alpha("#fff", 0.05) : alpha("#000", 0.04),
                    animation: reduceMotion ? "none" : `${bubbleIn} 0.3s ease`,
                  }}
                >
                  <Typography sx={{ fontSize: "0.82rem", color: theme.palette.text.primary }}>{entry.text}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Container>

  
      <Dialog
        open={endDialogOpen}
        onClose={() => !ending && setEndDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.custom?.glass || theme.palette.background.paper,
            backdropFilter: "blur(16px)",
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.custom?.cardShadow,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
          End interview now?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: theme.palette.text.secondary, fontSize: "0.9rem" }}>
            {answeredCount > 0
              ? `You've answered ${answeredCount} of ${QUESTIONS_PER_SESSION} questions. Ending now scores what you've answered so far — you won't be able to continue this session.`
              : "You haven't answered any questions yet, so there won't be anything to score. Answer at least one question before ending."}
          </DialogContentText>
          {endError && (
            <Typography sx={{ color: theme.palette.error?.main || "#c62828", fontSize: "0.85rem", mt: 1.5 }}>
              {endError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setEndDialogOpen(false)}
            disabled={ending}
            sx={{ textTransform: "none", fontWeight: 600, color: theme.palette.text.secondary }}
          >
            Keep going
          </Button>
          <Button
            onClick={confirmEndInterview}
            disabled={ending || answeredCount === 0}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "999px", minWidth: 150 }}
          >
            {ending ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "End & get report"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}