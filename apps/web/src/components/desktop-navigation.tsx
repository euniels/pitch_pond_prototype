"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavigationLink = {
  href: string;
  label: string;
  description?: string;
};

type NavigationEntry =
  | NavigationLink
  | { label: string; links: readonly NavigationLink[] };

export function DesktopNavigation({
  entries,
}: {
  entries: readonly NavigationEntry[];
}) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!openGroup) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const trigger = rootRef.current?.querySelector<HTMLButtonElement>(
        `[data-navigation-trigger="${openGroup}"]`,
      );
      setOpenGroup(null);
      trigger?.focus();
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openGroup]);

  return (
    <nav className="desktop-nav premium-desktop-nav" aria-label="Main navigation" ref={rootRef}>
      {entries.map((entry) => {
        if (!("links" in entry)) {
          return (
            <Link
              key={entry.href}
              href={entry.href}
              aria-current={pathname === entry.href ? "page" : undefined}
              onClick={() => setOpenGroup(null)}
            >
              {entry.label}
            </Link>
          );
        }

        const open = openGroup === entry.label;
        const active = entry.links.some((link) => pathname === link.href);
        return (
          <div className="premium-nav-group" key={entry.label}>
            <button
              type="button"
              data-navigation-trigger={entry.label}
              data-active={active || undefined}
              aria-expanded={open}
              aria-controls={`navigation-${entry.label.toLowerCase()}`}
              onClick={() => setOpenGroup(open ? null : entry.label)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown") return;
                event.preventDefault();
                setOpenGroup(entry.label);
                requestAnimationFrame(() =>
                  rootRef.current
                    ?.querySelector<HTMLAnchorElement>(
                      `#navigation-${entry.label.toLowerCase()} a`,
                    )
                    ?.focus(),
                );
              }}
            >
              {entry.label}
              <ChevronDown aria-hidden="true" />
            </button>
            <div
              id={`navigation-${entry.label.toLowerCase()}`}
              className="premium-nav-panel"
              hidden={!open}
            >
              <span className="premium-nav-panel-label">Explore {entry.label}</span>
              {entry.links.map((link) => (
                <Link
                  href={link.href}
                  key={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  onClick={() => setOpenGroup(null)}
                >
                  <strong>{link.label}</strong>
                  {link.description && <small>{link.description}</small>}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
