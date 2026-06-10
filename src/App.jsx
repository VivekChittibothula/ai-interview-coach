import { useState, useEffect, useRef } from "react";
import { askGemini } from "./services/gemini";

const JOB_ROLES = ["Full Stack Developer","Frontend Developer","Backend Developer","Java Developer","Data Analyst","Data Scientist"];
const EXPERIENCE_LEVELS = ["Fresher","1-3 Years","3-5 Years","5+ Years"];
const TOTAL_QUESTIONS = 5;

function buildQuestionPrompt(role, experience, questionIndex) {
  return `You are an expert technical interviewer. Generate a single interview question for a ${role} position with ${experience} experience level. This is question ${questionIndex + 1} of ${TOTAL_QUESTIONS}. Make it ${questionIndex < 2 ? "introductory/behavioral" : questionIndex < 4 ? "technical" : "advanced/scenario-based"}. Return ONLY the question text, nothing else.`;
}

function buildFeedbackPrompt(role, experience, question, answer) {
  return `You are an expert interviewer evaluating a ${role} candidate with ${experience} experience.\n\nQuestion: ${question}\nCandidate's Answer: ${answer || "(No answer provided)"}\n\nEvaluate and return ONLY valid JSON (no markdown, no backticks) in this exact format:\n{\n  "score": <number 1-10>,\n  "strengths": ["point 1", "point 2"],\n  "weaknesses": ["point 1", "point 2"],\n  "improvedAnswer": "A concise model answer in 3-4 sentences."\n}`;
}

function buildReportPrompt(role, experience, qas) {
  const summary = qas.map((q, i) => `Q${i + 1}: ${q.question}\nAnswer: ${q.answer || "(none)"}\nScore: ${q.feedback?.score ?? "N/A"}/10`).join("\n\n");
  return `You are an expert career coach. Analyze these interview Q&As for a ${role} (${experience}) candidate and return ONLY valid JSON (no markdown):\n\n${summary}\n\nFormat:\n{\n  "overall": <average score 1-10, number>,\n  "technical": <score 1-10>,\n  "communication": <score 1-10>,\n  "problemSolving": <score 1-10>,\n  "roadmap": ["actionable tip 1", "actionable tip 2", "actionable tip 3", "actionable tip 4", "actionable tip 5"]\n}`;
}



function GlassCard({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/8 backdrop-blur-xl shadow-2xl ${className}`} style={{ background: "rgba(15,20,40,0.7)" }}>
      {children}
    </div>
  );
}

function GradientButton({ onClick, disabled, children, variant = "primary", className = "" }) {
  const base = "relative px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-lg shadow-violet-900/40",
    secondary: "border border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white",
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>{children}</button>;
}

function ScoreRing({ score, label, color = "violet" }) {
  const circumference = 2 * Math.PI * 38;
  const dash = ((score / 10) * circumference);
  const colors = { violet: "#8b5cf6", blue: "#3b82f6", cyan: "#06b6d4" };
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 90 90" className="w-full h-full -rotate-90">
          <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
          <circle cx="45" cy="45" r="38" fill="none" stroke={colors[color]} strokeWidth="6"
            strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
          {score}<span className="text-xs text-white/50">/10</span>
        </span>
      </div>
      <span className="text-xs text-white/60 text-center">{label}</span>
    </div>
  );
}

function Spinner({ size = "md" }) {
  const s = size === "sm" ? "w-4 h-4" : "w-8 h-8";
  return <div className={`${s} border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin`} />;
}

function ProgressBar({ current, total }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/50">Q{current}/{total}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500" style={{ width: `${(current / total) * 100}%` }} />
      </div>
    </div>
  );
}

function Waveform({ active }) {
  const bars = [3, 6, 9, 5, 11, 7, 4, 8, 6, 10, 5, 7, 3, 9, 6];
  return (
    <div className="flex items-center gap-0.5 h-8">
      <style>{`@keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>
      {bars.map((h, i) => (
        <div key={i} className="w-1 rounded-full transition-all duration-300"
          style={{
            height: active ? `${h * 2.2}px` : "4px",
            background: active ? `rgba(139,92,246,${0.5 + (h / 11) * 0.5})` : "rgba(255,255,255,0.1)",
            animation: active ? `wave ${0.6 + (i % 4) * 0.15}s ease-in-out infinite alternate` : "none",
            animationDelay: `${i * 0.05}s`,
          }} />
      ))}
    </div>
  );
}

// LANDING PAGE
function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div style={{ width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(109,40,217,0.14) 0%, rgba(37,99,235,0.07) 50%, transparent 70%)" }} />
      </div>
      <div className="relative z-10 max-w-2xl w-full text-center">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-900/50">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.442 2.798H6.24c-1.47 0-2.443-1.798-1.442-2.798L6.2 15.3" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-gray-950 animate-pulse" />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          AI-Powered &middot; Real-Time Feedback
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">AI Interview</span>
          <br />
          <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">Coach</span>
        </h1>
        <p className="text-white/50 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
          Practice with an intelligent interviewer that adapts to your role and experience. Get instant, actionable feedback on every answer.
        </p>
        <GradientButton onClick={onStart} className="text-base px-8 py-4 mx-auto">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Start Interview
        </GradientButton>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {["Role-specific questions", "Voice answers", "Instant scoring", "Improvement roadmap"].map((f) => (
            <span key={f} className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-white/40">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// SETUP PAGE
function SetupPage({ onStart }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [exp, setExp] = useState("");
  const selectClass = "w-full border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500/60 transition-colors appearance-none cursor-pointer";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Set Up Your Interview</h2>
          <p className="text-white/40 text-sm">Tell us about you so we can tailor the questions.</p>
        </div>
        <GlassCard className="p-6 space-y-5">
          <div>
            <label className="block text-xs text-white/50 mb-2 font-medium uppercase tracking-wider">Your Name</label>
            <input type="text" placeholder="e.g. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/60 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }} />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2 font-medium uppercase tracking-wider">Job Role</label>
            <div className="relative">
              <select value={role} onChange={(e) => setRole(e.target.value)} className={selectClass} style={{ background: "rgba(15,20,40,0.9)" }}>
                <option value="">Select a role...</option>
                {JOB_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-2 font-medium uppercase tracking-wider">Experience Level</label>
            <div className="relative">
              <select value={exp} onChange={(e) => setExp(e.target.value)} className={selectClass} style={{ background: "rgba(15,20,40,0.9)" }}>
                <option value="">Select experience...</option>
                {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <GradientButton onClick={() => onStart({ name, role, exp })} disabled={!name.trim() || !role || !exp} className="w-full mt-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Begin Interview
          </GradientButton>
        </GlassCard>
      </div>
    </div>
  );
}

// INTERVIEW PAGE WITH FULL VOICE-TO-TEXT
function InterviewPage({ session, questionIndex, question, loadingQuestion, onSubmit }) {
  const [answer, setAnswer] = useState("");
  const [interim, setInterim] = useState("");
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [inputMode, setInputMode] = useState("text");
  const [voiceSupported] = useState(() => !!(window.SpeechRecognition || window.webkitSpeechRecognition));
  const recognitionRef = useRef(null);
  const finalRef = useRef("");

  useEffect(() => { setAnswer(""); setInterim(""); setVoiceError(""); finalRef.current = ""; }, [question]);
  useEffect(() => () => recognitionRef.current?.stop(), []);

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setVoiceError("");
    finalRef.current = answer;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onstart = () => setRecording(true);
    rec.onresult = (e) => {
      let interimText = "";
      let newFinal = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) newFinal += e.results[i][0].transcript + " ";
        else interimText += e.results[i][0].transcript;
      }
      if (newFinal) { finalRef.current += newFinal; setAnswer(finalRef.current); }
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      const msgs = {
        "not-allowed": "Microphone access denied. Please allow microphone permission in your browser.",
        "no-speech": "No speech detected. Try speaking closer to your microphone.",
        "network": "Network error during voice recognition. Check your connection.",
        "audio-capture": "No microphone found. Please connect one and try again.",
      };
      setVoiceError(msgs[e.error] || `Recognition error: ${e.error}. Please try again.`);
      setRecording(false); setInterim("");
    };
    rec.onend = () => { setRecording(false); setInterim(""); };
    recognitionRef.current = rec;
    try { rec.start(); } catch { setVoiceError("Could not start microphone. Please refresh and try again."); }
  }

  function stopRecording() { recognitionRef.current?.stop(); setRecording(false); setInterim(""); }
  function clearAnswer() { stopRecording(); setAnswer(""); setInterim(""); finalRef.current = ""; }

  async function handleSubmit() {
    if (recording) stopRecording();
    setSubmitting(true);
    await onSubmit(answer);
    setSubmitting(false);
  }

  const displayText = answer + interim;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <style>{`
        @keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }
        @keyframes mic-ring { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.6); opacity: 0; } }
      `}</style>

      <div className="w-full max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/40 text-sm">{session.name} &middot; {session.role}</p>
            <p className="text-white/25 text-xs">{session.exp}</p>
          </div>
          <ProgressBar current={questionIndex + 1} total={TOTAL_QUESTIONS} />
        </div>

        {/* Question */}
        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/40">
              <span className="text-sm font-bold text-white">Q{questionIndex + 1}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-white/30 mb-1 uppercase tracking-wider">Interview Question</p>
              {loadingQuestion ? (
                <div className="flex items-center gap-3 py-3"><Spinner size="sm" /><span className="text-white/40 text-sm">Generating question...</span></div>
              ) : (
                <p className="text-white text-lg leading-relaxed font-medium">{question}</p>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Answer */}
        <GlassCard className="p-5 space-y-4">
          {/* Mode toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Your Answer</p>
            <div className="flex items-center gap-1 p-1 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
              <button onClick={() => { stopRecording(); setInputMode("text"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${inputMode === "text" ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow" : "text-white/40 hover:text-white/70"}`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Type
              </button>
              <button onClick={() => setInputMode("voice")} disabled={!voiceSupported}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${inputMode === "voice" ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow" : "text-white/40 hover:text-white/70"} disabled:opacity-30 disabled:cursor-not-allowed`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2H3v2a9 9 0 008 8.94V23h2v-2.06A9 9 0 0021 12v-2h-2z" /></svg>
                {voiceSupported ? "Voice" : "Voice (N/A)"}
              </button>
            </div>
          </div>

          {/* Text mode */}
          {inputMode === "text" && (
            <textarea rows={6} value={answer} onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-violet-500/50 transition-colors resize-none leading-relaxed border border-white/10"
              style={{ background: "rgba(255,255,255,0.05)" }} />
          )}

          {/* Voice mode */}
          {inputMode === "voice" && (
            <div className="space-y-4">
              {/* Big mic */}
              <div className="flex flex-col items-center gap-5 py-6">
                <div className="relative flex items-center justify-center">
                  {recording && (
                    <>
                      <div className="absolute w-24 h-24 rounded-full bg-violet-500/20" style={{ animation: "mic-ring 1.4s ease-out infinite" }} />
                      <div className="absolute w-24 h-24 rounded-full bg-blue-500/15" style={{ animation: "mic-ring 1.4s ease-out infinite 0.5s" }} />
                    </>
                  )}
                  <button onClick={() => recording ? stopRecording() : startRecording()}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl ${recording ? "bg-gradient-to-br from-red-500 to-rose-600 scale-110 shadow-red-900/50" : "bg-gradient-to-br from-violet-600 to-blue-600 hover:scale-105 shadow-violet-900/60"}`}>
                    {recording ? (
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                    ) : (
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2H3v2a9 9 0 008 8.94V23h2v-2.06A9 9 0 0021 12v-2h-2z" /></svg>
                    )}
                  </button>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Waveform active={recording} />
                  {recording ? (
                    <p className="text-xs font-medium text-violet-400 animate-pulse">Listening... speak clearly</p>
                  ) : (
                    <p className="text-xs text-white/40">{answer ? "Tap mic to continue" : "Tap the mic to start speaking"}</p>
                  )}
                </div>
              </div>

              {/* Transcript */}
              <div className="relative rounded-xl border border-white/10 min-h-24 px-4 py-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                {displayText ? (
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                    {answer}
                    {interim && <span className="text-white/40 italic">{interim}</span>}
                  </p>
                ) : (
                  <p className="text-sm text-white/20 italic">Your speech will appear here in real time...</p>
                )}
                {displayText && (
                  <button onClick={clearAnswer} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all text-xs" title="Clear">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>

              {answer && !recording && (
                <p className="text-xs text-white/30 text-center">
                  Switch to{" "}
                  <button onClick={() => setInputMode("text")} className="text-violet-400 hover:underline">Type mode</button>
                  {" "}to edit your transcript
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {voiceError && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10">
              <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-xs text-red-400">{voiceError}</p>
            </div>
          )}

          <div className="flex justify-end">
            <GradientButton onClick={handleSubmit} disabled={!displayText.trim() || submitting || loadingQuestion}>
              {submitting ? <Spinner size="sm" /> : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              {submitting ? "Evaluating..." : "Submit Answer"}
            </GradientButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// FEEDBACK PAGE
function FeedbackPage({ questionIndex, question, answer, feedback, onNext, isLast }) {
  const score = feedback?.score ?? 0;
  const barColor = score >= 7 ? "from-emerald-500 to-teal-500" : score >= 4 ? "from-amber-500 to-orange-500" : "from-red-500 to-rose-500";
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-5">
        <div className="text-center">
          <p className="text-white/40 text-sm mb-1">Question {questionIndex + 1} &middot; Feedback</p>
          <h2 className="text-2xl font-bold text-white">Here's how you did</h2>
        </div>
        <GlassCard className="p-6 flex items-center gap-6">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
              <circle cx="40" cy="40" r="32" fill="none"
                stroke={score >= 7 ? "#10b981" : score >= 4 ? "#f59e0b" : "#ef4444"} strokeWidth="5"
                strokeDasharray={`${(score / 10) * 2 * Math.PI * 32} ${2 * Math.PI * 32}`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{score}</span>
          </div>
          <div className="flex-1">
            <p className="text-white/40 text-xs mb-1">Score out of 10</p>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`} style={{ width: `${score * 10}%` }} />
            </div>
            <p className="text-white/30 text-xs mt-2 line-clamp-2 italic">"{question}"</p>
          </div>
        </GlassCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Strengths</span>
            </div>
            <ul className="space-y-2">
              {(feedback?.strengths || []).map((s, i) => (
                <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-emerald-500 mt-0.5 shrink-0">&bull;</span>{s}</li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
              </div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">To Improve</span>
            </div>
            <ul className="space-y-2">
              {(feedback?.weaknesses || []).map((w, i) => (
                <li key={i} className="text-sm text-white/70 flex gap-2"><span className="text-amber-500 mt-0.5 shrink-0">&bull;</span>{w}</li>
              ))}
            </ul>
          </GlassCard>
        </div>
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            </div>
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Improved Answer</span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">{feedback?.improvedAnswer}</p>
        </GlassCard>
        <div className="flex justify-end">
          <GradientButton onClick={onNext}>
            {isLast ? "View Final Report" : "Next Question"}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </GradientButton>
        </div>
      </div>
    </div>
  );
}

// REPORT PAGE
function ReportPage({ session, report, onRestart }) {
  if (!report) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner />
      <p className="text-white/40 text-sm">Generating your report...</p>
    </div>
  );
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-4">Interview Complete</div>
          <h2 className="text-3xl font-bold text-white mb-1">Your Performance Report</h2>
          <p className="text-white/40 text-sm">{session.name} &middot; {session.role} &middot; {session.exp}</p>
        </div>
        <GlassCard className="p-6 text-center">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Overall Score</p>
          <div className="text-6xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent mb-1">
            {report.overall}<span className="text-2xl text-white/30">/10</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mx-auto max-w-xs mt-3">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-1000" style={{ width: `${report.overall * 10}%` }} />
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-5 text-center">Skill Breakdown</p>
          <div className="flex justify-around flex-wrap gap-4">
            <ScoreRing score={report.technical} label="Technical" color="violet" />
            <ScoreRing score={report.communication} label="Communication" color="blue" />
            <ScoreRing score={report.problemSolving} label="Problem Solving" color="cyan" />
          </div>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            </div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">AI Improvement Roadmap</span>
          </div>
          <div className="space-y-3">
            {(report.roadmap || []).map((tip, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-white/70 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </GlassCard>
        <div className="flex justify-center">
          <GradientButton onClick={onRestart} variant="secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Start New Interview
          </GradientButton>
        </div>
      </div>
    </div>
  );
}

// ROOT APP
export default function App() {
  const [page, setPage] = useState("landing");
  const [session, setSession] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [qas, setQas] = useState([]);
  const [report, setReport] = useState(null);

  async function fetchQuestion(idx, sess) {
    setLoadingQuestion(true);
    try {
      const q = await askGemini(
  buildQuestionPrompt(sess.role, sess.exp, idx)
);
      setCurrentQuestion(q.trim());
    } catch (error) {
  console.error("QUESTION ERROR:", error);

  setCurrentQuestion("QUESTION GENERATION FAILED");
}
    setLoadingQuestion(false);
  }

  function handleSetupStart(info) {
    setSession(info); setQas([]); setQuestionIndex(0); setPage("interview");
    fetchQuestion(0, info);
  }

  async function handleAnswerSubmit(answer) {
    
    let feedback = null;
    try {
      const raw = await askGemini(buildFeedbackPrompt(session.role, session.exp, currentQuestion, answer));
      feedback = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch (error) {
  console.error("FEEDBACK ERROR:", error);

  feedback = {
    score: 0,
    strengths: ["Error"],
    weaknesses: ["Check browser console"],
    improvedAnswer: error?.message || "Unknown error"
  };
}
    setQas((prev) => [...prev, { question: currentQuestion, answer, feedback }]);
    setPage("feedback");
  }

  async function handleNext() {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= TOTAL_QUESTIONS) {
      setPage("report"); setReport(null);
      try {
        const raw = await askGemini(buildReportPrompt(session.role, session.exp, qas));
        setReport(JSON.parse(raw.replace(/```json|```/g, "").trim()));
      } catch (error) {
  console.error("REPORT ERROR:", error);

  const avg = Math.round(
    qas.reduce((s, q) => s + (q.feedback?.score ?? 5), 0) / qas.length
  );

  setReport({
    overall: avg,
    technical: avg,
    communication: avg - 1,
    problemSolving: avg,
    roadmap: [
      "Practice mock interviews regularly.",
      "Study data structures and algorithms.",
      "Work on clear communication.",
      "Build real-world projects.",
      "Review common questions for your role."
    ]
  });
}
    } else {
      setQuestionIndex(nextIndex); setPage("interview");
      fetchQuestion(nextIndex, session);
    }
  }

  function handleRestart() {
    setPage("landing"); setSession(null); setQas([]); setQuestionIndex(0); setCurrentQuestion(""); setReport(null);
  }

  const lastQa = qas[qas.length - 1];

  return (
    <div className="min-h-screen text-white font-sans relative" style={{ background: "linear-gradient(160deg, #0a0e1a 0%, #0d1225 40%, #080c18 100%)" }}>
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="fixed top-0 left-0 right-0 h-px pointer-events-none" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.4) 30%, rgba(59,130,246,0.4) 70%, transparent 100%)" }} />

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-xl" style={{ background: "rgba(10,14,26,0.85)" }}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleRestart}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white/80">InterviewCoach<span className="text-violet-400">AI</span></span>
        </div>
        {session && page !== "landing" && page !== "setup" && (
          <div className="text-xs text-white/30">{session.role} &middot; {session.exp}</div>
        )}
      </nav>

      <div className="pt-16">
        {page === "landing" && <LandingPage onStart={() => setPage("setup")} />}
        {page === "setup" && <SetupPage onStart={handleSetupStart} />}
        {page === "interview" && (
          <InterviewPage session={session} questionIndex={questionIndex} question={currentQuestion} loadingQuestion={loadingQuestion} onSubmit={handleAnswerSubmit} />
        )}
        {page === "feedback" && lastQa && (
          <FeedbackPage questionIndex={questionIndex} question={lastQa.question} answer={lastQa.answer} feedback={lastQa.feedback} onNext={handleNext} isLast={questionIndex >= TOTAL_QUESTIONS - 1} />
        )}
        {page === "report" && (
          <ReportPage session={session} report={report} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
