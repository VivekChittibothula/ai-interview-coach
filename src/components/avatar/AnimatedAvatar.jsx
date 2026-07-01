import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { subscribeSpeechState } from "../../services/tts";

const EMOTIONS = {
  idle: { mouth: "M 35 58 Q 50 62 65 58", eyeScale: 1, headTilt: 0 },
  speaking: { mouth: "M 35 58 Q 50 68 65 58", eyeScale: 1.05, headTilt: 2 },
  listening: { mouth: "M 38 58 Q 50 55 62 58", eyeScale: 1.1, headTilt: -3 },
  thinking: { mouth: "M 40 58 L 60 58", eyeScale: 0.9, headTilt: 5 },
};

export default function AnimatedAvatar({ state: externalState, size = "lg" }) {
  const [avatarState] = useState("idle");
  const [blink, setBlink] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sizeClass = size === "sm" ? "w-32 h-32" : size === "md" ? "w-48 h-48" : "w-72 h-72";

  useEffect(() => {
    return subscribeSpeechState((s) => setIsSpeaking(s.speaking && !s.paused));
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 2800 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    const eyeInterval = setInterval(() => {
      setEyeOffset({ x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 2 });
    }, 2000);
    return () => clearInterval(eyeInterval);
  }, []);

  const state = externalState || (isSpeaking ? "speaking" : avatarState);
  const emotion = EMOTIONS[state] || EMOTIONS.idle;

  return (
    <motion.div
      className={`relative flex items-center justify-center ${sizeClass}`}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 ${
          isSpeaking ? "bg-violet-500/40 scale-110" : state === "listening" ? "bg-emerald-500/30" : state === "thinking" ? "bg-blue-500/30" : "bg-violet-500/10"
        }`}
      />

      <motion.div
        animate={{ rotate: emotion.headTilt }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5d0b5" />
              <stop offset="100%" stopColor="#e8b896" />
            </linearGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2d3748" />
              <stop offset="100%" stopColor="#1a202c" />
            </linearGradient>
            <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4c1d95" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
          </defs>

          {/* Body / suit */}
          <ellipse cx="50" cy="92" rx="28" ry="12" fill="url(#suitGrad)" />
          <path d="M 30 75 Q 50 68 70 75 L 75 100 L 25 100 Z" fill="url(#suitGrad)" />
          <path d="M 42 75 L 50 82 L 58 75" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
          <ellipse cx="50" cy="78" rx="4" ry="3" fill="#f59e0b" opacity="0.8" />

          {/* Neck */}
          <rect x="42" y="62" width="16" height="14" rx="4" fill="url(#skinGrad)" />

          {/* Head */}
          <ellipse cx="50" cy="42" rx="26" ry="30" fill="url(#skinGrad)" />

          {/* Hair */}
          <path d="M 24 38 Q 24 12 50 10 Q 76 12 76 38 Q 72 22 50 18 Q 28 22 24 38" fill="url(#hairGrad)" />

          {/* Ears */}
          <ellipse cx="24" cy="42" rx="4" ry="6" fill="url(#skinGrad)" />
          <ellipse cx="76" cy="42" rx="4" ry="6" fill="url(#skinGrad)" />

          {/* Eyes */}
          <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
            <ellipse cx="38" cy="40" rx="5" ry={blink ? 0.5 : 5 * emotion.eyeScale} fill="white" />
            <ellipse cx="62" cy="40" rx="5" ry={blink ? 0.5 : 5 * emotion.eyeScale} fill="white" />
            {!blink && (
              <>
                <circle cx={38 + eyeOffset.x * 0.5} cy={40 + eyeOffset.y * 0.5} r="2.5" fill="#2d3748" />
                <circle cx={62 + eyeOffset.x * 0.5} cy={40 + eyeOffset.y * 0.5} r="2.5" fill="#2d3748" />
                <circle cx={39 + eyeOffset.x * 0.5} cy={39 + eyeOffset.y * 0.5} r="0.8" fill="white" />
                <circle cx={63 + eyeOffset.x * 0.5} cy={39 + eyeOffset.y * 0.5} r="0.8" fill="white" />
              </>
            )}
          </g>

          {/* Eyebrows */}
          <path d="M 32 33 Q 38 30 44 33" fill="none" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M 56 33 Q 62 30 68 33" fill="none" stroke="#2d3748" strokeWidth="1.5" strokeLinecap="round" />

          {/* Nose */}
          <path d="M 50 42 L 48 50 Q 50 52 52 50 Z" fill="#d4956a" opacity="0.5" />

          {/* Mouth - animated for lip sync */}
          <motion.path
            d={emotion.mouth}
            fill="none"
            stroke="#c4706a"
            strokeWidth="2"
            strokeLinecap="round"
            animate={isSpeaking ? { d: ["M 35 58 Q 50 68 65 58", "M 38 58 Q 50 62 62 58", "M 35 58 Q 50 70 65 58", "M 37 58 Q 50 64 63 58"] } : { d: emotion.mouth }}
            transition={isSpeaking ? { duration: 0.3, repeat: Infinity } : { duration: 0.3 }}
          />

          {/* Cheeks blush when speaking */}
          {isSpeaking && (
            <>
              <ellipse cx="30" cy="48" rx="5" ry="3" fill="#f87171" opacity="0.2" />
              <ellipse cx="70" cy="48" rx="5" ry="3" fill="#f87171" opacity="0.2" />
            </>
          )}
        </svg>
      </motion.div>

      {/* State indicator */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full glass-card text-xs">
        <span className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-violet-400 animate-pulse" : state === "listening" ? "bg-emerald-400 animate-pulse" : state === "thinking" ? "bg-blue-400 animate-pulse" : "bg-white/30"}`} />
        <span className="text-[var(--text-muted)] capitalize">{isSpeaking ? "Speaking" : state}</span>
      </div>
    </motion.div>
  );
}
