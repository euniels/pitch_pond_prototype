"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("pitchpond-theme-change", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("pitchpond-theme-change", onStoreChange);
      };
    },
    currentTheme,
    () => "dark" as Theme,
  );

  const toggleTheme = () => {
    const next: Theme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("pitchpond-theme", next);
    window.dispatchEvent(new Event("pitchpond-theme-change"));
  };

  const isDark = theme === "dark";
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Use light mode" : "Use dark mode"}
      title={isDark ? "Use light mode" : "Use dark mode"}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <Sun className="theme-sun" />
        <Moon className="theme-moon" />
        <span className="theme-toggle-thumb" />
      </span>
    </button>
  );
}
