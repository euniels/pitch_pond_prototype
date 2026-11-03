"use client";

import { useEffect } from "react";

export function MotionObserver() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.add("motion-ready");
    const nodes = document.querySelectorAll<HTMLElement>(
      ".marketing-shell .section, .marketing-shell [data-reveal]",
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
