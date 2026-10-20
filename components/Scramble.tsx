"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#%01";

// Decodes text from random glyphs: once when it scrolls into view, and again on hover if asked.
export function Scramble({ text, hover = false, delay = 0 }: { text: string; hover?: boolean; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let timer = 0;

    const run = () => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      const duration = 260 + text.length * 30;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const shown = Math.floor(p * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          out += i < shown || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        timer = window.setTimeout(run, delay);
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);

    const host = hover ? ((el.closest("[data-scramble-host]") as HTMLElement | null) ?? el) : null;
    host?.addEventListener("mouseenter", run);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      host?.removeEventListener("mouseenter", run);
      el.textContent = text;
    };
  }, [text, hover, delay]);

  return <span ref={ref}>{text}</span>;
}
