"use client";

import { useEffect, useRef, useState } from "react";

type Shuttle = { x: number; y: number; vx: number; vy: number };
type Side = "you" | "rahul";

const G = 900;
const K = 0.0022; // quadratic drag: fast off the racket, then it dies and drops, like a real shuttle
const LH = 260;
const GROUND = LH - 26;
const NET_H = 66;
const REACH = 46;
const WIN = 3;

const pick = <T,>(xs: T[]) => xs[(Math.random() * xs.length) | 0];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

const step = (s: Shuttle, dt: number) => {
  const sp = Math.hypot(s.vx, s.vy);
  s.vx -= s.vx * K * sp * dt;
  s.vy -= s.vy * K * sp * dt;
  s.vy += G * dt;
  s.x += s.vx * dt;
  s.y += s.vy * dt;
};

export function Badminton() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ you: 0, rahul: 0 });
  const [msg, setMsg] = useState("click to start. i serve first, obviously.");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LW = canvas.clientWidth < 560 ? 420 : 640;
    const NX = LW / 2;
    const NET_TOP = GROUND - NET_H;
    const reachY = GROUND - 58;
    let scale = 1;
    let pointTimer = 0;

    const st = {
      phase: "idle" as "idle" | "rally" | "point" | "over",
      s: { x: 0, y: 0, vx: 0, vy: 0 } as Shuttle,
      trail: [] as { x: number; y: number }[],
      last: "rahul" as Side,
      you: { x: LW * 0.22, target: LW * 0.22, swing: 0 },
      cpu: { x: LW * 0.78, target: LW * 0.78, swing: 0, canHit: true },
      score: { you: 0, rahul: 0 },
      shot: "clear" as "clear" | "drop" | "smash",
    };

    const landing = (from: Shuttle) => {
      const s = { ...from };
      let clears = true;
      let intercept: number | null = null;
      for (let i = 0; i < 720; i++) {
        const px = s.x;
        step(s, 1 / 120);
        if ((px - NX) * (s.x - NX) <= 0 && s.y > NET_TOP) clears = false;
        if (intercept === null && s.vy > 0 && s.y >= reachY) intercept = s.x;
        if (s.y >= GROUND) break;
      }
      return { x: s.x, clears, intercept: intercept ?? s.x };
    };

    // find the horizontal speed that lands the shuttle on `target`, trying flatter-to-loftier arcs until one clears the net
    const aim = (x0: number, y0: number, target: number, vys: number[]) => {
      const dir = Math.sign(target - x0) || 1;
      for (const vy of vys) {
        let lo = 40;
        let hi = 1800;
        for (let i = 0; i < 18; i++) {
          const mid = (lo + hi) / 2;
          const l = landing({ x: x0, y: y0, vx: dir * mid, vy });
          if ((l.x - target) * dir < 0) lo = mid;
          else hi = mid;
        }
        const shot = { x: x0, y: y0, vx: (dir * (lo + hi)) / 2, vy };
        if (landing(shot).clears) return shot;
      }
      return { x: x0, y: y0, vx: dir * 520, vy: -700 };
    };

    const launch = (shot: Shuttle, by: Side) => {
      st.s = { ...shot };
      st.last = by;
      st.trail = [];
      const l = landing(st.s);
      if (by === "you") {
        const miss = Math.random() < (st.shot === "smash" ? 0.45 : st.shot === "drop" ? 0.25 : 0.07);
        st.cpu.canHit = !miss;
        st.cpu.target = Math.min(LW - 20, Math.max(NX + 24, l.intercept + 12 + (miss ? pick([-1, 1]) * 70 : 0)));
      } else {
        st.cpu.canHit = true;
        st.cpu.target = Math.min(LW - 30, Math.max(NX + 40, LW * 0.78 + rand(-30, 30)));
      }
    };

    const serve = () => {
      st.phase = "rally";
      st.cpu.x = LW * 0.8;
      st.cpu.swing = 1;
      st.shot = "clear";
      launch(aim(st.cpu.x - 10, reachY, rand(LW * 0.12, LW * 0.36), [-560, -700]), "rahul");
      setMsg("");
    };

    const point = (winner: Side) => {
      st.phase = "point";
      st.score = { ...st.score, [winner]: st.score[winner] + 1 };
      setScore(st.score);
      const over = st.score[winner] >= WIN;
      if (over) {
        st.phase = "over";
        setMsg(
          winner === "rahul"
            ? `${st.score.rahul}-${st.score.you}. skill issue. click for a rematch.`
            : "you actually beat me. email me, i owe you a real match.",
        );
        return;
      }
      setMsg(
        winner === "you"
          ? pick(["ok that one was clean", "lucky", "fine. i'll give you that one"])
          : pick(["too slow", "skill issue", "told you i'm good"]),
      );
      pointTimer = window.setTimeout(() => st.phase === "point" && serve(), 1300);
    };

    const youHit = () => {
      st.you.swing = 1;
      if (st.phase === "idle" || st.phase === "over") {
        st.score = { you: 0, rahul: 0 };
        setScore(st.score);
        serve();
        return;
      }
      if (st.phase !== "rally" || st.last === "you") return;
      const rx = st.you.x + 12;
      if (Math.hypot(st.s.x - rx, st.s.y - reachY) > REACH) return;
      const high = st.s.y < reachY - 16;
      const low = st.s.y > reachY + 12;
      if (high) {
        st.shot = "smash";
        launch(aim(st.s.x, st.s.y, rand(NX + 70, LW * 0.82), [140, -60, -320, -560]), "you");
      } else if (low && Math.random() < 0.6) {
        st.shot = "drop";
        launch(aim(st.s.x, st.s.y, rand(NX + 26, NX + 90), [-380, -520]), "you");
      } else {
        st.shot = "clear";
        launch(aim(st.s.x, st.s.y, rand(LW * 0.72, LW - 26), [-560, -700]), "you");
      }
    };

    const cpuHit = () => {
      st.cpu.swing = 1;
      const high = st.s.y < reachY - 14;
      const r = Math.random();
      if (high && r < 0.35) launch(aim(st.s.x, st.s.y, rand(LW * 0.14, NX - 70), [120, -80, -320]), "rahul");
      else if (r < 0.55) launch(aim(st.s.x, st.s.y, rand(NX - 90, NX - 28), [-380, -520]), "rahul");
      else launch(aim(st.s.x, st.s.y, rand(26, LW * 0.28), [-560, -700]), "rahul");
    };

    const update = (dt: number) => {
      const move = (p: { x: number; target: number }, speed: number) => {
        const d = p.target - p.x;
        p.x += Math.sign(d) * Math.min(Math.abs(d), speed * dt);
      };
      move(st.you, 560);
      move(st.cpu, 360);
      st.you.swing = Math.max(0, st.you.swing - dt * 6);
      st.cpu.swing = Math.max(0, st.cpu.swing - dt * 6);
      if (st.phase !== "rally") return;
      const px = st.s.x;
      step(st.s, dt);
      if ((px - NX) * (st.s.x - NX) <= 0 && st.s.y > NET_TOP) {
        st.s.x = px;
        st.s.vx *= -0.08;
      }
      st.trail.push({ x: st.s.x, y: st.s.y });
      if (st.trail.length > 14) st.trail.shift();
      const cr = st.cpu.x - 12;
      if (st.last === "you" && st.cpu.canHit && st.s.x > NX && Math.hypot(st.s.x - cr, st.s.y - reachY) < REACH - 6) cpuHit();
      if (st.s.y >= GROUND) {
        const out = st.s.x < 0 || st.s.x > LW;
        point(out ? (st.last === "you" ? "rahul" : "you") : st.s.x < NX ? "rahul" : "you");
      }
    };

    const css = getComputedStyle(document.documentElement);
    const color = (v: string, a = 1) => `rgb(${css.getPropertyValue(v).trim()} / ${a})`;

    const player = (x: number, swing: number, facing: 1 | -1, tint: string) => {
      ctx.strokeStyle = tint;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, GROUND - 52, 6, 0, Math.PI * 2);
      ctx.moveTo(x, GROUND - 46);
      ctx.lineTo(x, GROUND - 20);
      ctx.moveTo(x, GROUND - 20);
      ctx.lineTo(x - 7, GROUND);
      ctx.moveTo(x, GROUND - 20);
      ctx.lineTo(x + 7, GROUND);
      ctx.stroke();
      const a = -Math.PI / 2 + facing * (0.5 - swing * 1.6);
      const sx = x + facing * 4;
      const sy = GROUND - 40;
      const ex = sx + Math.cos(a) * 22;
      const ey = sy + Math.sin(a) * 22;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(ex + Math.cos(a) * 7, ey + Math.sin(a) * 7, 7, 4.5, a, 0, Math.PI * 2);
      ctx.stroke();
    };

    const render = () => {
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      ctx.clearRect(0, 0, LW, LH);
      ctx.strokeStyle = color("--fg", 0.18);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, GROUND + 0.5);
      ctx.lineTo(LW, GROUND + 0.5);
      ctx.stroke();
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(NX, GROUND);
      ctx.lineTo(NX, NET_TOP);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color("--fg", 0.6);
      ctx.fillRect(NX - 1.5, NET_TOP - 1.5, 3, 3);

      player(st.you.x, st.you.swing, 1, color("--ai"));
      player(st.cpu.x, st.cpu.swing, -1, color("--accent"));

      if (st.phase === "rally" || st.phase === "point") {
        st.trail.forEach((p, i) => {
          ctx.fillStyle = color("--accent", (i / st.trail.length) * 0.5);
          ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        });
        const a = Math.atan2(st.s.vy, st.s.vx);
        ctx.save();
        ctx.translate(st.s.x, st.s.y);
        ctx.rotate(a);
        ctx.fillStyle = color("--fg");
        ctx.beginPath();
        ctx.arc(0, 0, 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color("--fg", 0.8);
        ctx.beginPath();
        ctx.moveTo(-1, 0);
        ctx.lineTo(-9, -4);
        ctx.moveTo(-1, 0);
        ctx.lineTo(-9, 4);
        ctx.moveTo(-9, -4);
        ctx.lineTo(-9, 4);
        ctx.stroke();
        ctx.restore();
      }
    };

    let raf = 0;
    let prev = 0;
    let acc = 0;
    let onScreen = false;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - (prev || now)) / 1000);
      prev = now;
      acc += dt;
      while (acc >= 1 / 120) {
        update(1 / 120);
        acc -= 1 / 120;
      }
      render();
    };
    const start = () => {
      if (raf || !onScreen || document.hidden) return;
      prev = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const resize = () => {
      scale = canvas.clientWidth / LW;
      canvas.style.height = `${LH * scale}px`;
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(LH * scale * dpr);
      render();
    };
    // measured against the canvas's on-screen width, so page zoom can't throw it off
    const toLogical = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * (canvas.clientWidth / scale);
    };
    const onMove = (e: PointerEvent) => {
      st.you.target = Math.min(NX - 22, Math.max(14, toLogical(e) - 12));
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      // touch has no hover to walk the player over first, so a tap moves and swings in one go
      if (e.pointerType !== "mouse") st.you.x = st.you.target;
      youHit();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") st.you.target = Math.max(14, st.you.x - 60);
      else if (e.key === "ArrowRight" || e.key === "d") st.you.target = Math.min(NX - 22, st.you.x + 60);
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        youHit();
      }
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      clearTimeout(pointTimer);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div>
      <div className="label flex items-center justify-between">
        <span>
          you <span className="tabular-nums text-fg">{score.you}</span>
          <span className="mx-2 text-dim">·</span>
          <span className="tabular-nums text-accent">{score.rahul}</span> rahul
        </span>
        <span className="text-dim">first to 3</span>
      </div>
      <canvas
        ref={ref}
        tabIndex={0}
        aria-label="Badminton mini-game. Move the mouse to position your player, click to hit."
        className="mt-3 block w-full cursor-crosshair touch-manipulation outline-none"
      />
      <p className="label mt-3 min-h-[1.6em] text-muted" aria-live="polite">
        {msg || "move to position, click when the shuttle is near your racket"}
      </p>
    </div>
  );
}
