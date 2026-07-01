let speechState = { speaking: false, paused: false, text: "" };
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn({ ...speechState }));
  window.dispatchEvent(new CustomEvent("avatar-speaking", { detail: speechState.speaking && !speechState.paused }));
  window.dispatchEvent(new CustomEvent("avatar-state", { detail: speechState.speaking ? (speechState.paused ? "paused" : "speaking") : "idle" }));
}

export function subscribeSpeechState(fn) {
  listeners.add(fn);
  fn({ ...speechState });
  return () => listeners.delete(fn);
}

function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
    voices.find((v) => v.name === "Rishi (Enhanced)") ||
    voices.find((v) => v.lang.startsWith("en") && v.localService) ||
    voices.find((v) => v.lang.startsWith("en"))
  );
}

export function speak(text, onWordBoundary) {
  return new Promise((resolve) => {
    if (!text || !window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    speechState = { speaking: true, paused: false, text };
    notify();

    utterance.onboundary = (e) => {
      if (e.name === "word" && onWordBoundary) {
        onWordBoundary(e.charIndex, text.slice(e.charIndex));
      }
    };

    utterance.onend = () => {
      speechState = { speaking: false, paused: false, text: "" };
      notify();
      resolve();
    };

    utterance.onerror = () => {
      speechState = { speaking: false, paused: false, text: "" };
      notify();
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function pauseSpeaking() {
  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
    window.speechSynthesis.pause();
    speechState.paused = true;
    notify();
  }
}

export function resumeSpeaking() {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    speechState.paused = false;
    notify();
  }
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
  speechState = { speaking: false, paused: false, text: "" };
  notify();
}

export function getSpeechState() {
  return { ...speechState };
}

export async function downloadSpeechAudio(text, filename = "feedback.mp3") {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.replace(/\.mp3$/, ".txt");
  a.click();
  URL.revokeObjectURL(url);
}
