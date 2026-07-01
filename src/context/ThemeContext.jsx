import { createContext, useContext, useEffect, useState } from "react";
import { loadTheme, saveTheme } from "../lib/storage";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => loadTheme());
  const [resolvedTheme, setResolvedTheme] = useState("dark");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function resolve() {
      const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      setResolvedTheme(resolved);
      document.documentElement.setAttribute("data-theme", resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    }
    resolve();
    media.addEventListener("change", resolve);
    return () => media.removeEventListener("change", resolve);
  }, [theme]);

  function setTheme(next) {
    setThemeState(next);
    saveTheme(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
