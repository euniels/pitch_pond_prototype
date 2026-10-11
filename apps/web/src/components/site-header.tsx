"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Brand } from "./brand";
import { useLocale } from "./app-providers";
import { getCurrentUser } from "@/lib/api";
import type { User } from "@/lib/types";

export function SiteHeader() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
    const onTheme = (event: Event) => setTheme((event as CustomEvent<"light" | "dark">).detail);
    window.addEventListener("pitchpond-theme", onTheme);
    return () => window.removeEventListener("pitchpond-theme", onTheme);
  }, [pathname]);

  const links = [
    ["/explore", t("explore")],
    ["/pricing", t("pricing")],
    ["/about", t("about")],
  ] as const;

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={pathname === href ? "active" : ""} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button locale-button" onClick={() => setLocale(locale === "en" ? "fil" : "en")} aria-label={`Switch to ${t("language")}`}>
            {locale === "en" ? "FIL" : "EN"}
          </button>
          <button className="icon-button" onClick={() => window.dispatchEvent(new Event("pitchpond-toggle-theme"))} aria-label="Toggle color theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <Link href="/dashboard" className="button button-secondary header-signin">{t("dashboard")}</Link>
          ) : (
            <Link href="/signin" className="button button-secondary header-signin">{t("signIn")}</Link>
          )}
          <Link href="/founder/campaigns/new" className="button button-primary header-cta">{t("startCampaign")}</Link>
          <button className="menu-button" aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
            <span className="sr-only">Toggle navigation</span>{open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
