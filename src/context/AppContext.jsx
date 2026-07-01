import { createContext, useContext, useEffect, useRef, useState } from "react";
import { askGemini } from "../services/gemini";
import { speak } from "../services/tts";
import { buildQuestionPrompt, buildFeedbackPrompt, buildReportPrompt } from "../lib/prompts";
import {
  saveInterviewSession,
  loadInterviewSession,
  clearInterviewSession,
  recordInterviewCompletion,
} from "../lib/storage";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [qas, setQas] = useState([]);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [report, setReport] = useState(null);
  const [avatarState, setAvatarState] = useState("idle");
  const spokenFeedbackRef = useRef(null);
  const totalQuestions = session?.questionCount || 5;

  useEffect(() => {
    const saved = loadInterviewSession();
    if (!saved) return;
    // Restore in-progress session from localStorage
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(saved.session ?? null);
    setQuestionIndex(saved.questionIndex ?? 0);
    setCurrentQuestion(saved.currentQuestion ?? "");
    setLoadingQuestion(saved.loadingQuestion ?? false);
    setQas(saved.qas ?? []);
    setPreviousQuestions(saved.previousQuestions ?? []);
    setReport(saved.report ?? null);
  }, []);

  useEffect(() => {
    if (report) {
      clearInterviewSession();
      return;
    }
    saveInterviewSession({
      session,
      questionIndex,
      currentQuestion,
      loadingQuestion,
      qas,
      previousQuestions,
      report,
    });
  }, [session, questionIndex, currentQuestion, loadingQuestion, qas, previousQuestions, report]);

  async function fetchQuestion(idx, sess) {
    setLoadingQuestion(true);
    setAvatarState("thinking");
    try {
      const q = await askGemini(
        buildQuestionPrompt(
          sess.role,
          sess.exp,
          idx,
          previousQuestions,
          sess.resumeText || "",
          sess.jobDescription || "",
          sess.level || "Intermediate",
          sess.difficulty || "Medium"
        )
      );
      const question = q.trim();
      setCurrentQuestion(question);
      setAvatarState("speaking");
      setTimeout(() => {
        speak(idx === 0 ? `Welcome to your interview. ${question}` : question).then(() => setAvatarState("idle"));
      }, 800);
    } catch (error) {
      console.error("Question error:", error);
      setCurrentQuestion("Could not generate question. Please try again.");
      setAvatarState("idle");
    }
    setLoadingQuestion(false);
  }

  function startInterview(info) {
    clearInterviewSession();
    spokenFeedbackRef.current = null;
    setSession(info);
    setQas([]);
    setPreviousQuestions([]);
    setQuestionIndex(0);
    setCurrentQuestion("");
    setReport(null);
    fetchQuestion(0, info);
  }

  async function submitAnswer(answer) {
    const feedbackKey = `${questionIndex}-${currentQuestion}`;
    if (spokenFeedbackRef.current === feedbackKey) return null;

    setAvatarState("thinking");
    let evaluation;
    try {
      const raw = await askGemini(buildFeedbackPrompt(session.role, session.exp, currentQuestion, answer));
      const feedback = JSON.parse(raw.replace(/```json|```/g, "").trim());
      evaluation = {
        ...feedback,
        strengths: feedback?.strengths || [],
        improvements: feedback?.improvements || feedback?.weaknesses || [],
        weaknesses: feedback?.improvements || feedback?.weaknesses || [],
        improvedAnswer: feedback?.improvedAnswer || "",
      };
    } catch {
      evaluation = { score: 5, strengths: ["Attempt recorded"], improvements: ["Try providing more detail"], weaknesses: ["Try providing more detail"], improvedAnswer: "Provide a structured answer with examples." };
    }

    const score = Number(evaluation?.score ?? 0);
    let spoken = score <= 2 ? "This answer did not adequately address the question." :
      score <= 4 ? "This answer demonstrates limited understanding." :
      score <= 6 ? "Your answer shows partial understanding but needs more detail." :
      score <= 8 ? "Your answer was good, although more examples would strengthen it." :
      "This was a strong and well-structured answer.";
    spoken += ` I would rate this answer ${score} out of 10.`;

    spokenFeedbackRef.current = feedbackKey;
    setQas((prev) => [...prev, { question: currentQuestion, answer, feedback: evaluation }]);
    setPreviousQuestions((prev) => [...prev, currentQuestion]);
    setAvatarState("speaking");
    await speak(spoken);
    setAvatarState("idle");
    return evaluation;
  }

  async function generateReport() {
    setReport(null);
    try {
      const raw = await askGemini(buildReportPrompt(session.role, session.exp, qas, session.level));
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setReport(parsed);
      recordInterviewCompletion(session, parsed);
      return parsed;
    } catch {
      const avg = Math.round(qas.reduce((s, q) => s + (q.feedback?.score ?? 5), 0) / (qas.length || 1));
      const fallback = {
        overall: avg, technical: avg, communication: avg - 1, confidence: avg,
        grammar: avg, vocabulary: avg, problemSolving: avg, leadership: avg - 1,
        behavior: avg, speakingSpeed: "normal", fillerWords: [], timeManagement: avg,
        professionalism: avg, interviewReadiness: avg,
        strengths: ["Completed the interview"], weaknesses: ["Continue practicing"],
        suggestions: ["Practice mock interviews regularly"], learningPath: ["Study core concepts", "Build projects", "Practice communication"],
        roadmap: ["Practice mock interviews", "Study data structures", "Work on communication", "Build projects", "Review common questions"],
      };
      setReport(fallback);
      recordInterviewCompletion(session, fallback);
      return fallback;
    }
  }

  function nextQuestion() {
    const nextIndex = questionIndex + 1;
    if (nextIndex >= totalQuestions && totalQuestions !== 999) {
      generateReport();
      return "report";
    }
    setQuestionIndex(nextIndex);
    fetchQuestion(nextIndex, session);
    return "interview";
  }

  function resetInterview() {
    clearInterviewSession();
    spokenFeedbackRef.current = null;
    setSession(null);
    setQas([]);
    setPreviousQuestions([]);
    setQuestionIndex(0);
    setCurrentQuestion("");
    setReport(null);
    setAvatarState("idle");
  }

  return (
    <AppContext.Provider value={{
      session, setSession, questionIndex, currentQuestion, loadingQuestion,
      qas, report, avatarState, setAvatarState, totalQuestions,
      startInterview, submitAnswer, nextQuestion, generateReport, resetInterview,
      lastQa: qas[qas.length - 1],
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
