"use client";

import { useEffect, useRef } from "react";

// Skills you can grab and tug. They barely give, and when you let go they snap home on a stiff spring with a little wobble.
export function Stretchy({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const MAX = 16;
    const STIFF = 700;
    const DAMP = 16;
    const pull = (d: number) => MAX * Math.tanh(d / (MAX * 1.4));
    const place = (el: HTMLElement, x: number, y: number) => {
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(x * 0.25).toFixed(2)}deg)`;
    };
    // chips on their way home
    const springs = new Map<HTMLElement, { x: number; y: number; vx: number; vy: number }>();
    let raf = 0;
    let last = 0;
    let held: HTMLElement | null = null;
    let id = -1;
    let sx = 0;
    let sy = 0;
    let dx = 0;
    let dy = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - (last || now)) / 1000);
      last = now;
      springs.forEach((s, el) => {
        s.vx += (-STIFF * s.x - DAMP * s.vx) * dt;
        s.vy += (-STIFF * s.y - DAMP * s.vy) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (Math.abs(s.x) + Math.abs(s.y) < 0.15 && Math.abs(s.vx) + Math.abs(s.vy) < 2) {
          el.style.transform = "";
          springs.delete(el);
        } else place(el, s.x, s.y);
      });
      raf = springs.size ? requestAnimationFrame(tick) : 0;
      if (!raf) last = 0;
    };

    const down = (e: PointerEvent) => {
      const chip = (e.target as HTMLElement).closest<HTMLElement>(".chip");
      if (!chip || (e.pointerType === "mouse" && e.button !== 0)) return;
      springs.delete(chip);
      held = chip;
      id = e.pointerId;
      sx = e.clientX;
      sy = e.clientY;
      dx = 0;
      dy = 0;
      chip.setPointerCapture(e.pointerId);
      chip.style.transition = "none";
      chip.classList.add("held");
    };
    const move = (e: PointerEvent) => {
      if (!held || e.pointerId !== id) return;
      dx = pull(e.clientX - sx);
      dy = pull(e.clientY - sy);
      place(held, dx, dy);
    };
    const up = (e: PointerEvent) => {
      if (!held || e.pointerId !== id) return;
      held.classList.remove("held");
      springs.set(held, { x: dx, y: dy, vx: 0, vy: 0 });
      held = null;
      if (!raf) raf = requestAnimationFrame(tick);
    };

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
