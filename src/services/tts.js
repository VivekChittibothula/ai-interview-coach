export function speak(text) {
  if (!text) return;

  const speakNow = () => {
    const voices = window.speechSynthesis.getVoices();

    console.log(
      "Available voices:",
      voices.map(v => v.name)
    );

    const rishi = voices.find(
      v => v.name === "Rishi (Enhanced)"
    );

    console.log("Selected voice:", rishi?.name);

    const utterance = new SpeechSynthesisUtterance(text);

    if (rishi) {
      utterance.voice = rishi;
    }

   window.dispatchEvent(
  new CustomEvent("avatar-speaking", {
    detail: true,
  })
);

utterance.onend = () => {
  window.dispatchEvent(
    new CustomEvent("avatar-speaking", {
      detail: false,
    })
  );
};

window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    speakNow();
  } else {
    window.speechSynthesis.onvoiceschanged = speakNow;
  }
}