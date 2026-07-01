import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import GradientButton from "../components/ui/GradientButton";
import Spinner from "../components/ui/Spinner";
import ProgressBar from "../components/ui/ProgressBar";
import Waveform from "../components/ui/Waveform";
import AnimatedAvatar from "../components/avatar/AnimatedAvatar";
import { useApp } from "../context/AppContext";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

export default function InterviewPage() {
  const navigate = useNavigate();
  const { session, questionIndex, currentQuestion, loadingQuestion, totalQuestions, submitAnswer, setAvatarState, avatarState } = useApp();

  const [answer, setAnswer] = useState("");
  const [interim, setInterim] = useState("");
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [inputMode, setInputMode] = useState("text");

  const submittingRef = useRef(false);

  const { supported: voiceSupported, start: startRecording, stop: stopRecording } = useSpeechRecognition({
    onResult: ({ final, interim: int, autoSubmit }) => {
      setAnswer(final);
      setInterim(int || "");
      if (autoSubmit && final.trim() && !submittingRef.current) {
        submitAnswerFlow(final);
      }
    },
    onError: (msg) => setVoiceError(msg),
  });

  useEffect(() => {
    if (!session) navigate("/setup");
  }, [session, navigate]);

  useEffect(() => {
    // Reset answer state when question changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswer("");
    setInterim("");
    setVoiceError("");
  }, [currentQuestion]);

  function toggleRecording() {
    if (recording) {
      stopRecording();
      setRecording(false);
      setAvatarState("idle");
    } else {
      setVoiceError("");
      setAvatarState("listening");
      const ok = startRecording(answer, 2500);
      if (ok) setRecording(true);
    }
  }

  async function submitAnswerFlow(text) {
    const finalAnswer = (text ?? answer + interim).trim();
    if (!finalAnswer || submittingRef.current) return;
    if (recording) { stopRecording(); setRecording(false); }
    submittingRef.current = true;
    setSubmitting(true);
    setAvatarState("thinking");
    await submitAnswer(finalAnswer);
    setSubmitting(false);
    submittingRef.current = false;
    navigate("/feedback");
  }

  if (!session) return null;

  const displayText = answer + interim;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br from-violet-900/30 via-transparent to-blue-900/30" />

      <div className="w-full max-w-2xl space-y-5 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[var(--text-muted)] text-sm">{session.name} · {session.role}</p>
            <p className="text-xs text-[var(--text-muted)] opacity-60">{session.level} · {session.difficulty}</p>
          </div>
          <ProgressBar current={questionIndex + 1} total={totalQuestions} />
        </div>

        <div className="flex justify-center py-2">
          <AnimatedAvatar state={avatarState} size="lg" />
        </div>

        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">Q{questionIndex + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-wider">Interview Question</p>
              {loadingQuestion ? (
                <div className="flex items-center gap-3 py-3"><Spinner size="sm" /><span className="text-[var(--text-muted)] text-sm">Generating question...</span></div>
              ) : (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg leading-relaxed font-medium">{currentQuestion}</motion.p>
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-medium">Your Answer</p>
            <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)] bg-white/[0.04]">
              <button onClick={() => { stopRecording(); setRecording(false); setInputMode("text"); setAvatarState("idle"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${inputMode === "text" ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white" : "text-[var(--text-muted)]"}`}>
                Type
              </button>
              <button onClick={() => setInputMode("voice")} disabled={!voiceSupported}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${inputMode === "voice" ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white" : "text-[var(--text-muted)]"} disabled:opacity-30`}>
                Voice
              </button>
            </div>
          </div>

          {inputMode === "text" ? (
            <textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Type your answer..."
              className="w-full rounded-xl px-4 py-3 text-sm border border-[var(--border)] focus:outline-none focus:border-violet-500/50 resize-none" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="relative">
                  {recording && (
                    <>
                      <div className="absolute w-24 h-24 rounded-full bg-violet-500/20" style={{ animation: "mic-ring 1.4s ease-out infinite" }} />
                      <div className="absolute w-24 h-24 rounded-full bg-emerald-500/15" style={{ animation: "mic-ring 1.4s ease-out infinite 0.5s" }} />
                    </>
                  )}
                  <motion.button whileTap={{ scale: 0.95 }} onClick={toggleRecording}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ${recording ? "bg-gradient-to-br from-red-500 to-rose-600" : "bg-gradient-to-br from-violet-600 to-blue-600"}`}
                    aria-label={recording ? "Stop recording" : "Start recording"}>
                    {recording ? (
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                    ) : (
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2H3v2a9 9 0 008 8.94V23h2v-2.06A9 9 0 0021 12v-2h-2z" /></svg>
                    )}
                  </motion.button>
                </div>
                <Waveform active={recording} color={recording ? "emerald" : "violet"} />
                <p className="text-xs text-[var(--text-muted)]">{recording ? "Listening... auto-submits after silence" : "Tap mic to speak your answer"}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] min-h-20 px-4 py-3 bg-white/[0.03]">
                {displayText ? (
                  <p className="text-sm leading-relaxed">{answer}{interim && <span className="text-[var(--text-muted)] italic">{interim}</span>}</p>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] italic">Your speech will appear here...</p>
                )}
              </div>
            </div>
          )}

          {voiceError && <p className="text-xs text-red-400">{voiceError}</p>}

          <div className="flex justify-end">
            <GradientButton onClick={() => submitAnswerFlow()} disabled={!displayText.trim() || submitting || loadingQuestion}>
              {submitting ? <><Spinner size="sm" /> Evaluating...</> : "Submit Answer"}
            </GradientButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
