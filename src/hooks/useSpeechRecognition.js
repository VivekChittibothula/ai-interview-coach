import { useEffect, useRef, useCallback } from "react";

export function useSpeechRecognition({ onResult, onError, lang = "en-US" } = {}) {
  const recognitionRef = useRef(null);
  const finalRef = useRef("");
  const silenceTimerRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  const supported = !!(typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition));

  const stop = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  const start = useCallback((initialText = "", autoSubmitMs = 2500) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return false;

    stop();
    finalRef.current = initialText;

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onresult = (e) => {
      let interimText = "";
      let newFinal = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) newFinal += e.results[i][0].transcript + " ";
        else interimText += e.results[i][0].transcript;
      }
      if (newFinal) {
        finalRef.current += newFinal;
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          onResultRef.current?.({ final: finalRef.current.trim(), interim: "", isFinal: true, autoSubmit: true });
          stop();
        }, autoSubmitMs);
      }
      onResultRef.current?.({ final: finalRef.current.trim(), interim: interimText.trim(), isFinal: false });
    };

    rec.onerror = (e) => {
      const msgs = {
        "not-allowed": "Microphone access denied.",
        "no-speech": "No speech detected.",
        network: "Network error during voice recognition.",
        "audio-capture": "No microphone found.",
      };
      onErrorRef.current?.(msgs[e.error] || `Recognition error: ${e.error}`);
      stop();
    };

    rec.onend = () => {
      recognitionRef.current = null;
    };

    recognitionRef.current = rec;
    try {
      rec.start();
      return true;
    } catch {
      onErrorRef.current?.("Could not start microphone.");
      return false;
    }
  }, [lang, stop]);

  useEffect(() => () => stop(), [stop]);

  return { supported, start, stop };
}
