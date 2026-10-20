"use client";

import { useEffect, useRef } from "react";

const GLYPHS = ".:+*#%@/\\";

type Bit = { x: number; y: number; vx: number; vy: number; life: number; max: number; ch: string };

// Your normal cursor, shedding a few ascii glyphs as it moves and scattering a burst where you click.
export function AsciiCursor() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (!matchMedia("(pointer: fine)").matches || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "monospace";
    let bits: Bit[] = [];
    let raf = 0;
    let prev = 0;
    let lx = -1;
    let ly = -1;
    let carry = 0;

    const size = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    };
    const add = (x: number, y: number, vx: number, vy: number, max: number) => {
      bits.push({ x, y, vx, vy, life: max, max, ch: GLYPHS[(Math.random() * GLYPHS.length) | 0] });
      if (bits.length > 160) bits.shift();
    };
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - (prev || now)) / 1000);
      prev = now;
      // in stopped time the crumbs hang in the air
      const frozen = document.documentElement.classList.contains("time-stop");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = `8px ${mono}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      bits.forEach((b) => {
        if (!frozen) {
          b.life -= dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.vy += 40 * dt;
        }
        ctx.fillStyle = `rgba(236,236,236,${Math.max(0, b.life / b.max) * 0.28})`;
        ctx.fillText(b.ch, b.x, b.y);
      });
      bits = bits.filter((b) => b.life > 0);
      raf = bits.length ? requestAnimationFrame(draw) : 0;
      if (!raf) prev = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => {
      if (lx < 0 || document.documentElement.classList.contains("time-stop")) {
        carry = 0;
        lx = e.clientX;
        ly = e.clientY;
        return;
      }
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      carry += Math.hypot(dx, dy);
      // one glyph every ~64px of travel, so slow moves leave nothing
      while (carry > 64) {
        carry -= 64;
        add(e.clientX - dx * Math.random(), e.clientY - dy * Math.random(), (Math.random() - 0.5) * 10, 5, 0.25 + Math.random() * 0.1);
      }
      lx = e.clientX;
      ly = e.clientY;
      kick();
    };
    const onDown = (e: PointerEvent) => {
      if (document.documentElement.classList.contains("time-stop")) return;
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + Math.random();
        const s = 18 + Math.random() * 14;
        add(e.clientX, e.clientY, Math.cos(a) * s, Math.sin(a) * s, 0.2 + Math.random() * 0.08);
      }
      kick();
    };

    size();
    window.addEventListener("resize", size);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="cursor-trail" />;
}
