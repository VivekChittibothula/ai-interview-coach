import { useEffect, useState } from "react";
import interviewer from "../assets/interviewer.png";

export default function InterviewerAvatar() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      setIsSpeaking(e.detail);
    };

    window.addEventListener(
      "avatar-speaking",
      handler
    );

    return () =>
      window.removeEventListener(
        "avatar-speaking",
        handler
      );
  }, []);
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow while speaking */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-300 ${
          isSpeaking
            ? "bg-violet-500/40 scale-110"
            : "bg-transparent scale-100"
        }`}
      />

      {/* Avatar */}
      <img
        src={interviewer}
        alt="AI Interviewer"
        className={`w-72 h-72 object-cover rounded-full border-4 transition-all duration-300 ${
          isSpeaking
            ? "border-violet-400 shadow-[0_0_50px_rgba(139,92,246,0.7)]"
            : "border-white/10"
        }`}
        style={{
          animation: "float 4s ease-in-out infinite",
        }}
      />

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute -bottom-8 flex items-end gap-1">
          <div
            className="w-1 bg-violet-400 rounded-full"
            style={{
              height: "10px",
              animation: "wave 0.4s infinite alternate",
            }}
          />
          <div
            className="w-1 bg-violet-400 rounded-full"
            style={{
              height: "22px",
              animation: "wave 0.3s infinite alternate",
            }}
          />
          <div
            className="w-1 bg-violet-400 rounded-full"
            style={{
              height: "14px",
              animation: "wave 0.5s infinite alternate",
            }}
          />
          <div
            className="w-1 bg-violet-400 rounded-full"
            style={{
              height: "28px",
              animation: "wave 0.35s infinite alternate",
            }}
          />
          <div
            className="w-1 bg-violet-400 rounded-full"
            style={{
              height: "12px",
              animation: "wave 0.45s infinite alternate",
            }}
          />
        </div>
      )}
    </div>
  );
}
