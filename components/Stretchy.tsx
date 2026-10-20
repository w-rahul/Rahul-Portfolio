"use client";

import { useEffect, useRef } from "react";

// Skills you can grab and pull a little. They resist the further you drag, and snap back when you let go.
export function Stretchy({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const MAX = 36;
    const pull = (d: number) => MAX * Math.tanh(d / (MAX * 1.8));
    let held: HTMLElement | null = null;
    let id = -1;
    let sx = 0;
    let sy = 0;

    const down = (e: PointerEvent) => {
      const chip = (e.target as HTMLElement).closest<HTMLElement>(".chip");
      if (!chip || (e.pointerType === "mouse" && e.button !== 0)) return;
      held = chip;
      id = e.pointerId;
      sx = e.clientX;
      sy = e.clientY;
      chip.setPointerCapture(e.pointerId);
      chip.style.transition = "none";
      chip.classList.add("held");
    };
    const move = (e: PointerEvent) => {
      if (!held || e.pointerId !== id) return;
      const dx = pull(e.clientX - sx);
      const dy = pull(e.clientY - sy);
      held.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${(dx * 0.12).toFixed(2)}deg)`;
    };
    const up = (e: PointerEvent) => {
      if (!held || e.pointerId !== id) return;
      held.style.transition = "transform 0.6s cubic-bezier(0.3, 1.8, 0.5, 1)";
      held.style.transform = "";
      held.classList.remove("held");
      held = null;
    };

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    return () => {
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
