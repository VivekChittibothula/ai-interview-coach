import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import FloatingBackground from "./FloatingBackground";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

export default function Layout() {
  const location = useLocation();
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen text-[var(--text-primary)] font-sans relative overflow-x-hidden">
      <FloatingBackground />
      <Navbar />
      <main className="pt-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
