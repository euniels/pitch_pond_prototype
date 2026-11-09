"use client";

import { useEffect, useRef } from "react";

export function HeaderScrollState() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const header = markerRef.current?.closest("header");
    if (!header) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        header.toggleAttribute("data-scrolled", window.scrollY > 24);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  return <span className="header-scroll-marker" ref={markerRef} aria-hidden="true" />;
}
