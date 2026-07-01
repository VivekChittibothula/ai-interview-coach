import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.altKey && e.key === "h") { e.preventDefault(); navigate("/"); }
      if (e.altKey && e.key === "d") { e.preventDefault(); navigate("/dashboard"); }
      if (e.altKey && e.key === "a") { e.preventDefault(); navigate("/ats"); }
      if (e.altKey && e.key === "i") { e.preventDefault(); navigate("/setup"); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [navigate]);
}
