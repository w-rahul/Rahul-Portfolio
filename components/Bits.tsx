"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#%";

// Cycles through words, decoding each one in from noise.
export function RoleCycler({ words }: { words: string[] }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    let raf = 0;
    const decode = (from: string, to: string) => {
      cancelAnimationFrame(raf);
      const start = performance.now();
      const len = Math.max(from.length, to.length);
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 700);
        let out = "";
        for (let k = 0; k < len; k++) {
          if (k < Math.floor(p * len)) out += to[k] ?? "";
          else if (k < to.length || k < from.length * (1 - p)) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const id = window.setInterval(() => {
      const from = words[i];
      i = (i + 1) % words.length;
      decode(from, words[i]);
    }, 2600);
    return () => {
      clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, [words]);

  return (
    <span ref={ref} className="text-fg">
      {words[0]}
    </span>
  );
}

// Counts up to a number the first time it scrolls into view.
export function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || to === 0) return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1100);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

// the footer year: fixed at build, corrected in the browser, so the page can stay fully static
export function Year({ built }: { built: number }) {
  const [year, setYear] = useState(built);
  useEffect(() => setYear(new Date().getFullYear()), []);
  return <>{year}</>;
}
