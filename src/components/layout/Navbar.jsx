import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileSearch, Mic, Home, Menu, X, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ats", label: "ATS Analyzer", icon: FileSearch },
  { to: "/setup", label: "Interview", icon: Mic },
];

export default function Navbar() {
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const themes = [
    { id: "light", icon: Sun, label: "Light" },
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "system", icon: Monitor, label: "System" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-[var(--border)] backdrop-blur-xl nav-blur" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-900/30 group-hover:scale-105 transition-transform">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-[var(--text-primary)]">
            InterviewCoach<span className="text-violet-500">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === to
                  ? "bg-violet-500/15 text-violet-500"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="p-2 rounded-xl border border-[var(--border)] hover:bg-white/5 transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Moon className="w-4 h-4 text-[var(--text-muted)]" /> : <Sun className="w-4 h-4 text-[var(--text-muted)]" />}
            </button>
            <AnimatePresence>
              {themeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 glass-card p-2 min-w-[140px] shadow-xl"
                >
                  {themes.map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => { setTheme(id); setThemeOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        theme === id ? "bg-violet-500/15 text-violet-500" : "text-[var(--text-muted)] hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/setup" className="hidden sm:flex">
            <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold text-white">
              Start Interview
            </motion.span>
          </Link>

          <button className="md:hidden p-2 rounded-xl border border-[var(--border)]" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            className="fixed inset-y-0 right-0 z-40 w-64 glass-card border-l border-[var(--border)] pt-20 px-4 md:hidden"
          >
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium ${
                  location.pathname === to ? "bg-violet-500/15 text-violet-500" : "text-[var(--text-muted)]"
                }`}>
                <Icon className="w-5 h-5" /> {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
