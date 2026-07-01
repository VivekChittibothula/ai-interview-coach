import { STORAGE_KEYS } from "./constants";

function safeGet(key) {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Could not save ${key}:`, error);
  }
}

function safeRemove(key) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Could not remove ${key}:`, error);
  }
}

export function saveInterviewSession(payload) {
  safeSet(STORAGE_KEYS.SESSION, payload);
}

export function loadInterviewSession() {
  return safeGet(STORAGE_KEYS.SESSION);
}

export function clearInterviewSession() {
  safeRemove(STORAGE_KEYS.SESSION);
}

export function saveTheme(theme) {
  safeSet(STORAGE_KEYS.THEME, theme);
}

export function loadTheme() {
  return safeGet(STORAGE_KEYS.THEME) || "system";
}

export function saveDashboardData(data) {
  const existing = loadDashboardData();
  safeSet(STORAGE_KEYS.DASHBOARD, { ...existing, ...data });
}

export function loadDashboardData() {
  return safeGet(STORAGE_KEYS.DASHBOARD) || {
    completedInterviews: 0,
    totalScores: [],
    confidenceScores: [],
    communicationScores: [],
    recentFeedback: [],
    atsScore: null,
    resumeScore: null,
    interviewHistory: [],
  };
}

export function saveATSData(data) {
  safeSet(STORAGE_KEYS.ATS, data);
}

export function loadATSData() {
  return safeGet(STORAGE_KEYS.ATS);
}

export function saveBackground(id) {
  safeSet(STORAGE_KEYS.BACKGROUND, id);
}

export function loadBackground() {
  return safeGet(STORAGE_KEYS.BACKGROUND) || "gradient";
}

export function recordInterviewCompletion(session, report) {
  const dash = loadDashboardData();
  const entry = {
    date: new Date().toISOString(),
    role: session.role,
    level: session.level,
    overall: report.overall,
    technical: report.technical,
    communication: report.communication,
  };
  dash.completedInterviews += 1;
  dash.totalScores.push(report.overall);
  dash.confidenceScores.push(report.confidence ?? report.overall);
  dash.communicationScores.push(report.communication);
  dash.recentFeedback.unshift({
    date: entry.date,
    role: session.role,
    score: report.overall,
    summary: report.strengths?.[0] || "Interview completed",
  });
  dash.recentFeedback = dash.recentFeedback.slice(0, 10);
  dash.interviewHistory.unshift(entry);
  dash.interviewHistory = dash.interviewHistory.slice(0, 20);
  saveDashboardData(dash);
}
