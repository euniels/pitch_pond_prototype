"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/types";
import { translate, type MessageKey } from "@/lib/i18n";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedLocale = localStorage.getItem("pitchpond-locale");
      const savedTheme = localStorage.getItem("pitchpond-theme");
      if (savedLocale === "fil" || savedLocale === "en") setLocaleState(savedLocale);
      if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "fil" ? "fil" : "en";
    document.documentElement.dataset.theme = theme;
  }, [locale, theme]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: (next) => {
        setLocaleState(next);
        localStorage.setItem("pitchpond-locale", next);
      },
      t: (key) => translate(locale, key),
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>
      <ThemeBridge theme={theme} setTheme={setTheme} />
      {children}
    </LocaleContext.Provider>
  );
}

function ThemeBridge({
  theme,
  setTheme,
}: {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}) {
  useEffect(() => {
    const listener = () => window.dispatchEvent(new CustomEvent("pitchpond-theme", { detail: theme }));
    listener();
  }, [theme]);

  useEffect(() => {
    const toggle = () => {
      setTheme(theme === "light" ? "dark" : "light");
      localStorage.setItem("pitchpond-theme", theme === "light" ? "dark" : "light");
    };
    window.addEventListener("pitchpond-toggle-theme", toggle);
    return () => window.removeEventListener("pitchpond-toggle-theme", toggle);
  }, [setTheme, theme]);
  return null;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside AppProviders");
  return context;
}
