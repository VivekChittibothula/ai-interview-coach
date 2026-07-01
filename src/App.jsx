import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/layout/Layout";
import Spinner from "./components/ui/Spinner";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ATSAnalyzerPage = lazy(() => import("./pages/ATSAnalyzerPage"));
const SetupPage = lazy(() => import("./pages/SetupPage"));
const ResumeReviewPage = lazy(() => import("./pages/ResumeReviewPage"));
const InterviewPage = lazy(() => import("./pages/InterviewPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const ReportPage = lazy(() => import("./pages/ReportPage"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/ats" element={<ATSAnalyzerPage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/review" element={<ResumeReviewPage />} />
                <Route path="/interview" element={<InterviewPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/report" element={<ReportPage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}
