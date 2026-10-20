"use client";

import { useEffect, useRef, useState } from "react";
import { preloadClips, primeAudio, unleash } from "./anime";
import { audioTime, hiss, loadSample, playSample, swish, tone } from "./sound";

const best = (key: string, value: number, higherIsBetter = true) => {
  try {
    const prev = Number(localStorage.getItem(key) || (higherIsBetter ? 0 : 1e9));
    const next = higherIsBetter ? Math.max(prev, value) : Math.min(prev, value);
    localStorage.setItem(key, String(next));
    return next;
  } catch {
    return value;
  }
};

const pick = <T,>(xs: T[]) => xs[(Math.random() * xs.length) | 0];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// logical size scaled to the element's width, crisp on hidpi; returns the scale
const fitCanvas = (canvas: HTMLCanvasElement, lw: number, lh: number, dpr: number) => {
  const scale = canvas.clientWidth / lw;
  canvas.style.height = `${lh * scale}px`;
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(lh * scale * dpr);
  return scale;
};

const cssColor = (css: CSSStyleDeclaration) => (v: string, a = 1) => `rgb(${css.getPropertyValue(v).trim()} / ${a})`;

// ---------------------------------------------------------------------------------------------
// games: a bamboo strike, ghost of tsushima style minus the button prompts. swing through the stalks

type Stalk = { x: number; h: number; grow: number; sway: number };
type Piece = { x: number; y: number; h: number; vx: number; vy: number; rot: number; vr: number };
type Bit = { x: number; y: number; vx: number; vy: number; life: number };
type Pop = { x: number; y: number; text: string; life: number; big: boolean };
type Flash = { x0: number; y0: number; x1: number; y1: number; life: number };

const STALK_X = [40, 92, 150, 208, 260];

export function BambooCut() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [msg, setMsg] = useState("swing through the bamboo. 20 seconds. cut several in one swing for combos.");

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LW = 300;
    const LH = 160;
    const FLOOR = 150;
    const FULL = 118;
    const ROUND = 20;
    const css = getComputedStyle(document.documentElement);
    const color = cssColor(css);
    const mono = css.getPropertyValue("--font-mono").trim() || "monospace";
    const jpFont = css.getPropertyValue("--font-jp").trim() || "serif";
    let scale = 1;
    let raf = 0;
    let prev = 0;
    let onScreen = false;
    let lastPt: { x: number; y: number; t: number } | null = null;
    const g = {
      state: "idle" as "idle" | "play" | "over",
      left: ROUND,
      cuts: 0,
      endedAt: 0,
      t: 0,
      freeze: 0,
      shake: 0,
      stalks: STALK_X.map((x, i) => ({ x, h: FULL - (i % 2) * 14, grow: 0, sway: i * 1.3 })) as Stalk[],
      pieces: [] as Piece[],
      bits: [] as Bit[],
      pops: [] as Pop[],
      flashes: [] as Flash[],
      trail: [] as { x: number; y: number; t: number }[],
    };

    const crack = (n: number) => {
      const t = audioTime();
      if (t === null) return;
      hiss(t, 0.05, 0.42, 2600, 1.2);
      tone(t, 1100, 700, 0.07, 0.18, "triangle");
      tone(t, 130, 60, 0.12, 0.3 + n * 0.1);
    };

    const cutAt = (s: Stalk, y: number, dir: number) => {
      const top = FLOOR - s.h;
      if (y < top + 4 || y > FLOOR - 8) return false;
      const h = y - top;
      g.pieces.push({ x: s.x, y: top + h / 2, h, vx: dir * (90 + Math.random() * 90), vy: -120 - Math.random() * 80, rot: 0, vr: dir * (5 + Math.random() * 6) });
      for (let k = 0; k < 10; k++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 60 + Math.random() * 140;
        g.bits.push({ x: s.x, y, vx: Math.cos(a) * sp + dir * 40, vy: Math.sin(a) * sp - 40, life: 0.35 + Math.random() * 0.25 });
      }
      g.pops.push({ x: s.x, y: y - 6, text: "+1", life: 0.6, big: false });
      s.h = FLOOR - y;
      s.grow = 0.5;
      return true;
    };

    const restart = () => {
      g.state = "idle";
      g.cuts = 0;
      g.stalks.forEach((s, i) => {
        s.h = FULL - (i % 2) * 14;
        s.grow = 0;
      });
      setMsg("swing through the bamboo. 20 seconds. cut several in one swing for combos.");
      draw();
    };

    const slice = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      if (g.state === "over") {
        if (performance.now() - g.endedAt < 900) return;
        restart();
      }
      let hit = 0;
      let lastY = 0;
      let lastX = 0;
      for (const s of g.stalks) {
        if ((a.x - s.x) * (b.x - s.x) > 0) continue;
        const k = (s.x - a.x) / (b.x - a.x || 0.0001);
        const y = a.y + (b.y - a.y) * k;
        if (cutAt(s, y, Math.sign(b.x - a.x) || 1)) {
          hit += 1;
          lastX = s.x;
          lastY = y;
        }
      }
      if (!hit) return;
      if (g.state === "idle") {
        g.state = "play";
        g.left = ROUND;
        g.cuts = 0;
        setMsg("go. keep swinging.");
      }
      g.cuts += hit;
      // a long white cut across the whole canvas along the swing, a beat of hit-stop, and a jolt
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      g.flashes.push({ x0: a.x - (dx / len) * 400, y0: a.y - (dy / len) * 400, x1: a.x + (dx / len) * 400, y1: a.y + (dy / len) * 400, life: 0.18 });
      g.freeze = 0.045 + hit * 0.02;
      g.shake = Math.min(1, 0.35 + hit * 0.25);
      if (hit > 1) g.pops.push({ x: lastX, y: lastY - 20, text: `${hit}x`, life: 0.9, big: true });
      swish(0.3);
      crack(hit);
      run();
    };

    const stalk = (h: number) => {
      ctx.fillStyle = color("--matcha", 0.9);
      ctx.fillRect(-4, -h / 2, 8, h);
      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.fillRect(-3, -h / 2, 1.5, h);
      ctx.fillStyle = "#4f6b33";
      for (let y = h / 2 - 22; y > -h / 2; y -= 22) ctx.fillRect(-4.5, y, 9, 1.8);
    };

    const draw = () => {
      const jx = g.shake > 0 ? (Math.random() - 0.5) * g.shake * 6 : 0;
      const jy = g.shake > 0 ? (Math.random() - 0.5) * g.shake * 4 : 0;
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, jx * scale * dpr, jy * scale * dpr);
      const bg = ctx.createLinearGradient(0, 0, 0, LH);
      bg.addColorStop(0, "#0b0c0a");
      bg.addColorStop(1, "#141711");
      ctx.fillStyle = bg;
      ctx.fillRect(-6, -6, LW + 12, LH + 12);
      ctx.strokeStyle = color("--fg", 0.18);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, FLOOR + 0.5);
      ctx.lineTo(LW, FLOOR + 0.5);
      ctx.stroke();
      g.stalks.forEach((s) => {
        ctx.save();
        ctx.translate(s.x, FLOOR);
        ctx.rotate(Math.sin(g.t * 1.6 + s.sway) * 0.025);
        ctx.translate(0, -s.h / 2);
        stalk(s.h);
        ctx.restore();
      });
      g.pieces.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        stalk(p.h);
        ctx.restore();
      });
      g.bits.forEach((b) => {
        ctx.fillStyle = color("--matcha", Math.max(0, b.life * 2));
        ctx.fillRect(b.x, b.y, 2, 2);
      });
      g.flashes.forEach((f) => {
        const k = f.life / 0.18;
        ctx.strokeStyle = `rgba(255,255,255,${0.9 * k})`;
        ctx.lineWidth = 3.5 * k;
        ctx.beginPath();
        ctx.moveTo(f.x0, f.y0);
        ctx.lineTo(f.x1, f.y1);
        ctx.stroke();
      });
      const now = performance.now();
      ctx.lineCap = "round";
      for (let i = 1; i < g.trail.length; i++) {
        const a = g.trail[i - 1];
        const b = g.trail[i];
        const k = 1 - (now - b.t) / 140;
        if (k <= 0) continue;
        ctx.strokeStyle = `rgba(255,255,255,${0.6 * k})`;
        ctx.lineWidth = 2 * k;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      g.pops.forEach((p) => {
        const k = Math.min(1, p.life / 0.4);
        ctx.font = p.big ? `bold 22px ${css.getPropertyValue("--font-sans").trim() || "sans-serif"}` : `11px ${mono}`;
        ctx.textAlign = "center";
        ctx.fillStyle = p.big ? color("--kin", k) : color("--fg", k);
        ctx.fillText(p.text, p.x, p.y);
      });
      ctx.font = `10px ${mono}`;
      ctx.fillStyle = color("--muted");
      ctx.textAlign = "left";
      if (g.state === "play") ctx.fillText(`${Math.ceil(g.left)}s`, 10, 16);
      ctx.textAlign = "right";
      ctx.fillText(`cuts ${g.cuts}`, LW - 10, 16);
      if (g.state === "over") {
        ctx.fillStyle = "rgba(0,0,0,0.72)";
        ctx.fillRect(-6, LH / 2 - 26, LW + 12, 52);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `30px ${jpFont}`;
        ctx.fillStyle = color("--fg");
        ctx.fillText(`斬 ${g.cuts}`, LW / 2, LH / 2 + 1);
        ctx.textBaseline = "alphabetic";
      }
      ctx.textAlign = "left";
    };

    const update = (dt: number) => {
      g.t += dt;
      g.shake = Math.max(0, g.shake - dt * 4);
      g.flashes.forEach((f) => (f.life -= dt));
      g.flashes = g.flashes.filter((f) => f.life > 0);
      // hit-stop: the world pauses for a few frames after a cut so it lands
      if (g.freeze > 0) {
        g.freeze -= dt;
        return;
      }
      if (g.state === "play") {
        g.left -= dt;
        if (g.left <= 0) {
          g.state = "over";
          g.endedAt = performance.now();
          const n = g.cuts;
          setMsg(
            `${n} cuts. ${n >= 40 ? "ghost of delhi." : n >= 25 ? "clean blade work." : "warm up the wrist and go again."} best ${best("bamboo-best", n)}. swing to go again.`,
          );
        }
      }
      g.pieces.forEach((p) => {
        p.vy += 520 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
      });
      g.pieces = g.pieces.filter((p) => p.y < LH + 60 && p.x > -40 && p.x < LW + 40);
      g.bits.forEach((b) => {
        b.vy += 420 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;
      });
      g.bits = g.bits.filter((b) => b.life > 0);
      g.pops.forEach((p) => {
        p.life -= dt;
        p.y -= 22 * dt;
      });
      g.pops = g.pops.filter((p) => p.life > 0);
      g.stalks.forEach((s, i) => {
        if (s.grow > 0) {
          s.grow -= dt;
          if (s.grow <= 0) {
            s.h = FULL - Math.random() * 30;
            s.x = STALK_X[i] + (Math.random() - 0.5) * 22;
          }
        }
      });
      const now = performance.now();
      g.trail = g.trail.filter((p) => now - p.t < 140);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.04, (now - (prev || now)) / 1000);
      prev = now;
      update(dt);
      draw();
      const busy =
        g.state === "play" || g.pieces.length || g.bits.length || g.pops.length || g.flashes.length || g.trail.length || g.shake > 0 || g.stalks.some((s) => s.grow > 0);
      if (!busy) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const run = () => {
      if (raf || !onScreen) return;
      prev = 0;
      raf = requestAnimationFrame(loop);
    };

    const toLogical = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale, t: performance.now() };
    };
    const onMove = (e: PointerEvent) => {
      const p = toLogical(e);
      if (lastPt && p.t - lastPt.t < 90) {
        const fast = Math.hypot(p.x - lastPt.x, p.y - lastPt.y) / Math.max(1, p.t - lastPt.t) > 0.3;
        if (fast || e.buttons & 1 || e.pointerType !== "mouse") {
          g.trail.push(p);
          slice(lastPt, p);
          run();
        }
      }
      lastPt = p;
    };
    const onDown = (e: PointerEvent) => {
      primeAudio();
      const p = toLogical(e);
      if (g.state === "over") {
        if (performance.now() - g.endedAt < 900) return;
        restart();
      }
      // tapping right on a stalk cuts it too, so it works without a swing
      const s = g.stalks.find((st) => Math.abs(st.x - p.x) < 9 && st.grow <= 0);
      if (s) slice({ x: s.x - 10, y: p.y }, { x: s.x + 10, y: p.y });
      lastPt = p;
    };
    const onLeave = () => {
      lastPt = null;
    };
    const resize = () => {
      scale = fitCanvas(canvas, LW, LH, dpr);
      draw();
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) run();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    const ro = new ResizeObserver(resize);
    resize();
    ro.observe(canvas);
    io.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div>
      <canvas
        ref={ref}
        tabIndex={0}
        aria-label="Bamboo cutting game. Swing through the stalks."
        className="game-canvas hold"
        onContextMenu={(e) => e.preventDefault()}
      />
      <p className="label mt-2 min-h-[1.6em] text-dim">{msg}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// anime: summon a stand. hold anywhere on the panel and its stats climb from E to A,
// and at full power a random moment hits, out loud

const STATS = [
  { jp: "破壊力", en: "power" },
  { jp: "スピード", en: "speed" },
  { jp: "射程距離", en: "range" },
  { jp: "持続力", en: "stamina" },
  { jp: "精密動作性", en: "precision" },
  { jp: "成長性", en: "potential" },
];
const GRADES = "EDCBA";
// the chart lives on a 300x168 stage
const CX = 150;
const CY = 84;
const RAD = 56;
const corner = (i: number, r: number) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 3;
  return [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
};
const hexagon = (r: (i: number) => number) =>
  Array.from({ length: 6 }, (_, i) =>
    corner(i, r(i))
      .map((v) => v.toFixed(1))
      .join(","),
  ).join(" ");
// which way each label hangs off its corner
const HANG = ["-50%, -100%", "0, -50%", "0, -50%", "-50%, 0", "-100%, -50%", "-100%, -50%"];

export function PowerUp() {
  const [charge, setCharge] = useState(0);
  const [lastMove, setLastMove] = useState("");
  const [burst, setBurst] = useState(false);
  // how fast each stat climbs, rerolled after every summon so no two stands look the same
  const [rates, setRates] = useState([1.3, 1.1, 1.45, 1.2, 1, 1.35]);
  const holding = useRef(false);
  const pending = useRef(false);
  const value = useRef(0);
  const raf = useRef(0);
  const burstTimer = useRef(0);
  const peakUntil = useRef(0);

  // the chart stays maxed out for a beat after the summon, then drains
  const fire = () => {
    pending.current = false;
    holding.current = false;
    peakUntil.current = performance.now() + 700;
    setBurst(true);
    clearTimeout(burstTimer.current);
    burstTimer.current = window.setTimeout(() => setBurst(false), 450);
    setRates(STATS.map(() => 1 + Math.random() * 0.6));
    void unleash().then(setLastMove);
  };
  const loop = (prev: number) => (now: number) => {
    const dt = Math.min(0.05, (now - prev) / 1000);
    const drift = holding.current ? 52 : now < peakUntil.current ? 0 : -90;
    value.current = Math.max(0, Math.min(100, value.current + drift * dt));
    if (value.current >= 100 && holding.current && !pending.current) {
      const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
      if (activation && !activation.hasBeenActive) pending.current = true;
      else fire();
    }
    setCharge(value.current);
    if (holding.current || value.current > 0) raf.current = requestAnimationFrame(loop(now));
  };
  const hold = (on: boolean) => {
    void preloadClips();
    // touch only counts as a gesture on release, so a summon that maxed out mid-hold fires here
    if (!on && pending.current) fire();
    holding.current = on;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(loop(performance.now()));
  };
  useEffect(() => {
    // unlock audio on the first tap anywhere, for the same reason
    const unlock = () => primeAudio();
    window.addEventListener("pointerup", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(burstTimer.current);
      window.removeEventListener("pointerup", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const k = charge / 100;
  const stats = rates.map((rate) => Math.min(1, 0.1 + 0.9 * k * rate));
  const grades = stats.map((s) => Math.min(4, Math.floor(s * 5)));
  const level = Math.floor(charge / 20);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Summon a stand. Hold anywhere here, at full power a random anime moment plays. Sound on."
      className={`game power ${charge > 55 ? "shaking" : ""} ${burst ? "burst" : ""}`}
      style={{ "--shake": `${charge > 55 ? (charge - 55) / 45 : 0}`, "--charge": `${k}` } as React.CSSProperties}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.currentTarget.setPointerCapture?.(e.pointerId);
        hold(true);
      }}
      onPointerUp={() => hold(false)}
      onPointerCancel={() => hold(false)}
      onKeyDown={(e) => {
        if (e.key !== " " && e.key !== "Enter") return;
        e.preventDefault();
        if (!e.repeat) hold(true);
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") hold(false);
      }}
      onBlur={() => holding.current && hold(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div aria-hidden>
        {Array.from({ length: level }, (_, i) => (
          <span key={i} className={`go go-${i}`}>
            ゴ
          </span>
        ))}
      </div>
      <div className="stand">
        <svg viewBox="0 0 300 168" width="300" height="168" aria-hidden>
          <defs>
            <linearGradient id="stand-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "rgb(var(--sakura))", stopOpacity: 0.55 }} />
              <stop offset="1" style={{ stopColor: "rgb(var(--ai))", stopOpacity: 0.35 }} />
            </linearGradient>
          </defs>
          {[1, 2, 3, 4, 5].map((g) => (
            <polygon key={g} className="stand-ring" points={hexagon(() => (RAD * g) / 5)} />
          ))}
          {STATS.map((s, i) => {
            const [x, y] = corner(i, RAD);
            return <line key={s.en} className="stand-axis" x1={CX} y1={CY} x2={x} y2={y} />;
          })}
          <polygon className="stand-poly" points={hexagon((i) => stats[i] * RAD)} />
        </svg>
        {STATS.map((s, i) => {
          const [x, y] = corner(i, RAD + 10);
          return (
            <span key={s.en} className="stand-label" style={{ left: x, top: y, transform: `translate(${HANG[i]})` }}>
              <span lang="ja" data-en={s.en} className={`jp tip ${i === 0 ? "tip-down" : ""}`}>
                {s.jp}
              </span>
              <b className={`stand-grade g-${grades[i]}`}>{GRADES[grades[i]]}</b>
            </span>
          );
        })}
      </div>
      <p className="label w-full truncate px-3 text-center text-dim">{lastMove ? `last: ${lastMove}` : "hold to summon your stand · sound on"}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// rides: the thunderbird at dusk on a dolphin exhaust. self start, kill switch, pops on the overrun, and the patak

type Paint = (v: string, a?: number) => string;

const drawBike = (ctx: CanvasRenderingContext2D, color: Paint, x: number, y: number, wheel: number, flame: number) => {
  const wy = y - 10;
  // tyres, rims, five spoke alloys
  for (const wx of [x - 18, x + 20]) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#1b1b1b";
    ctx.beginPath();
    ctx.arc(wx, wy, 9.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = color("--fg", 0.75);
    ctx.beginPath();
    ctx.arc(wx, wy, 7.6, 0, Math.PI * 2);
    for (let k = 0; k < 5; k++) {
      const a = wheel + (k * Math.PI * 2) / 5;
      ctx.moveTo(wx + Math.cos(a) * 2, wy + Math.sin(a) * 2);
      ctx.lineTo(wx + Math.cos(a) * 7.2, wy + Math.sin(a) * 7.2);
    }
    ctx.stroke();
  }
  // dolphin exhaust: header pipe, then the short upswept can
  ctx.strokeStyle = color("--fg", 0.6);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - 3, wy - 2);
  ctx.lineTo(x - 15, wy + 1);
  ctx.stroke();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = color("--fg", 0.72);
  ctx.beginPath();
  ctx.moveTo(x - 15, wy + 1);
  ctx.lineTo(x - 31, wy - 4);
  ctx.stroke();
  // the patak's flash out of the can
  if (flame > 0) {
    const len = 6 + flame * 16;
    ctx.fillStyle = `rgba(255,150,50,${Math.min(1, flame)})`;
    ctx.beginPath();
    ctx.moveTo(x - 32, wy - 6.5);
    ctx.lineTo(x - 32 - len, wy - 7 - len * 0.28 + (Math.random() - 0.5) * 3);
    ctx.lineTo(x - 32, wy - 1.5);
    ctx.fill();
    ctx.fillStyle = `rgba(255,236,170,${Math.min(1, flame)})`;
    ctx.beginPath();
    ctx.moveTo(x - 32, wy - 5.5);
    ctx.lineTo(x - 32 - len * 0.5, wy - 6 - len * 0.14);
    ctx.lineTo(x - 32, wy - 3);
    ctx.fill();
  }
  // engine with fins, polished
  ctx.fillStyle = color("--fg", 0.7);
  ctx.fillRect(x - 8, wy - 12, 13, 10);
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = 0; k < 3; k++) {
    ctx.moveTo(x - 7, wy - 10 + k * 3);
    ctx.lineTo(x + 4, wy - 10 + k * 3);
  }
  ctx.stroke();
  // frame, rear fender, fork, high cruiser bars
  ctx.strokeStyle = color("--fg", 0.85);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x - 18, wy, 12, Math.PI * 1.05, Math.PI * 1.72);
  ctx.moveTo(x - 18, wy);
  ctx.lineTo(x - 7, wy - 13);
  ctx.lineTo(x + 12, wy - 15);
  ctx.moveTo(x + 20, wy);
  ctx.lineTo(x + 14, wy - 23);
  ctx.lineTo(x + 9, wy - 29);
  ctx.stroke();
  // teardrop tank, deep blue with a gold line
  ctx.fillStyle = "#2a3a63";
  ctx.beginPath();
  ctx.ellipse(x + 3, wy - 17, 9, 4.4, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color("--kin", 0.9);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(x - 4, wy - 17);
  ctx.lineTo(x + 9, wy - 18);
  ctx.stroke();
  // stepped seat
  ctx.fillStyle = "#3b2a20";
  ctx.fillRect(x - 13, wy - 18, 9, 3);
  ctx.fillRect(x - 21, wy - 20, 8, 3);
  // round headlamp
  ctx.fillStyle = color("--kin");
  ctx.beginPath();
  ctx.arc(x + 18, wy - 21, 3, 0, Math.PI * 2);
  ctx.fill();

  // the rider: black hoodie, curly hair, earbuds in
  const hip = { x: x - 8, y: wy - 19 };
  const sh = { x: x - 5, y: wy - 34 };
  ctx.lineCap = "round";
  ctx.strokeStyle = "#2b3a5c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(hip.x, hip.y);
  ctx.lineTo(x + 3, wy - 21);
  ctx.lineTo(x + 8, wy - 9);
  ctx.stroke();
  ctx.fillStyle = "#121212";
  ctx.fillRect(x + 6, wy - 10, 5, 2.5);
  ctx.fillStyle = "#18181b";
  ctx.beginPath();
  ctx.moveTo(hip.x - 4, hip.y + 1);
  ctx.lineTo(hip.x + 4, hip.y + 1);
  ctx.lineTo(sh.x + 4, sh.y + 1);
  ctx.lineTo(sh.x - 4, sh.y - 1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sh.x - 4, sh.y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = color("--fg", 0.3);
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.strokeStyle = "#18181b";
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(sh.x + 1, sh.y + 2);
  ctx.lineTo(x + 9, wy - 28);
  ctx.stroke();
  ctx.fillStyle = "#b98563";
  ctx.beginPath();
  ctx.arc(x + 9, wy - 28, 1.3, 0, Math.PI * 2);
  ctx.arc(sh.x + 1, sh.y - 6, 4.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#130f0d";
  for (const [dx, dy] of [
    [-2.8, -2.6],
    [-0.6, -3.9],
    [1.8, -3.6],
    [3.4, -2.3],
    [-3.9, -0.6],
    [-3.2, 1.3],
    [0.6, -4.7],
  ]) {
    ctx.beginPath();
    ctx.arc(sh.x + 1 + dx, sh.y - 6 + dy, 1.9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#f2f2f2";
  ctx.beginPath();
  ctx.arc(sh.x - 0.4, sh.y - 5.2, 0.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = "butt";
};

type Moto = { kill: () => void; start: () => void };

export function ThunderbirdRide() {
  const ref = useRef<HTMLCanvasElement>(null);
  const ctrl = useRef<Moto | null>(null);
  const [msg, setMsg] = useState("hit start or click the bike. hold to ride.");
  const [ign, setIgn] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LW = 300;
    const LH = 140;
    const ROAD = 112;
    const css = getComputedStyle(document.documentElement);
    const color = cssColor(css);
    const mono = css.getPropertyValue("--font-mono").trim() || "monospace";
    // deterministic skyline so it doesn't jump between renders
    const ridge = Array.from({ length: 32 }, (_, i) => 18 + Math.abs(Math.sin(i * 1.7) * 22 + Math.sin(i * 0.6) * 10));
    const stars = Array.from({ length: 22 }, (_, i) => ({ x: (i * 73) % LW, y: 6 + ((i * 37) % 46), r: i % 3 === 0 ? 1 : 0.6 }));
    let scale = 1;
    let raf = 0;
    let prev = 0;
    let onScreen = false;
    const r = {
      ign: true,
      running: false,
      cranking: 0,
      catches: false,
      throttle: false,
      speed: 0,
      flare: 0,
      dist: 0,
      t: 0,
      wheel: 0,
      idle: 0,
      fire: 0,
      far: 0,
      mid: 0,
      road: 0,
      killedAt: 0,
      fuel: 0,
      flame: 0,
      shake: 0,
      overrun: 0,
      revs: 0,
    };
    const rpm = () => r.revs;

    // the ride sits louder than the rest of the page's sound, so it holds up next to the anime clips
    const VOL = 1.7;
    // dolphin exhaust: low, fat, long thump
    const thump = (t: number, big = 1) => {
      const k = Math.min(1, rpm() / 4500);
      tone(t, 64 + k * 46, 30, 0.14, (0.44 + k * 0.1) * big * VOL);
      tone(t, 128 + k * 90, 60, 0.05, 0.16 * big * VOL, "triangle");
      hiss(t, 0.04, (0.05 + k * 0.06) * VOL, 240 + k * 520, 0.7, false, "lowpass");
    };
    // a real firecracker recording for the patak (patakha literally means firecracker)
    let patakBuf: AudioBuffer | null = null;
    let lastPop = 0;
    const loadPop = () => {
      if (!patakBuf) void loadSample("/sfx/patak.mp3").then((b) => (patakBuf = b));
    };
    // one overrun pop: a short sharp "pap" out of the pipe. an edge, a bandpassed burst, the can knocking hollow
    const pop = (t: number, size: number) => {
      const g = (0.2 + 0.28 * size) * VOL;
      hiss(t, 0.006, g * 0.8, 3600, 0.7, false, "highpass");
      hiss(t, 0.035, g, 1000 + Math.random() * 500, 1.3);
      tone(t, 420 + Math.random() * 120, 180, 0.04, g * 0.4, "triangle");
      tone(t, 95, 50, 0.045, g * 0.45);
    };
    // the patak: a sharp crack, the pipe's boom under it, and the street throwing it back twice
    const patak = (size: number) => {
      const t = audioTime();
      if (t === null) return;
      if (patakBuf) {
        playSample(patakBuf, { when: t, gain: 1.6 * size, rate: 0.88 + Math.random() * 0.08 });
        playSample(patakBuf, { when: t + 0.12, gain: 0.32 * size, rate: 0.84, lowpass: 1800 });
        playSample(patakBuf, { when: t + 0.29, gain: 0.14 * size, rate: 0.8, lowpass: 1100 });
      } else hiss(t, 0.16, 0.95 * size, 1700, 0.5);
      tone(t, 85, 32, 0.32, 0.8 * size);
      hiss(t, 0.22, 0.45 * size, 520, 0.6, false, "lowpass");
    };
    const crank = (catches: boolean) => {
      const t = audioTime();
      if (t === null) return;
      for (let k = 0; k < 5; k++) {
        tone(t + k * 0.12, 105, 80, 0.11, 0.1 * VOL, "triangle");
        hiss(t + k * 0.12, 0.1, 0.045 * VOL, 600, 0.6, false, "lowpass");
      }
      if (catches) thump(t + 0.62, 1.5);
    };

    const windDown = () => {
      const t = audioTime();
      if (t === null) return;
      let d = 0.05;
      [0.8, 0.6, 0.42, 0.26].forEach((g, i) => {
        thump(t + d, g);
        d += 0.12 + i * 0.07;
      });
    };

    const stopEngine = (text: string) => {
      if (!r.running) return;
      r.running = false;
      r.throttle = false;
      setRunning(false);
      const km = Math.round(r.dist * 10) / 10;
      setMsg(km > 0 ? `${text} ${km} km, longest ride ${best("ride-km", km)} km.` : text);
    };

    const draw = () => {
      const jolt = r.shake > 0 ? (Math.random() - 0.5) * r.shake * 4 : 0;
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, jolt * scale * dpr, 0);
      const sky = ctx.createLinearGradient(0, 0, 0, ROAD);
      sky.addColorStop(0, "#050505");
      sky.addColorStop(0.6, "#0e0e0e");
      sky.addColorStop(1, "#262626");
      ctx.fillStyle = sky;
      ctx.fillRect(-4, 0, LW + 8, ROAD);
      stars.forEach((s) => {
        ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.3 * Math.sin(r.t * 2 + s.x)})`;
        ctx.fillRect(s.x, s.y, s.r, s.r);
      });
      const sun = ctx.createRadialGradient(214, ROAD - 6, 2, 214, ROAD - 6, 34);
      sun.addColorStop(0, "rgba(236,236,236,0.9)");
      sun.addColorStop(0.55, "rgba(170,170,170,0.3)");
      sun.addColorStop(1, "rgba(170,170,170,0)");
      ctx.fillStyle = sun;
      ctx.beginPath();
      ctx.arc(214, ROAD - 6, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#191919";
      ctx.beginPath();
      ctx.moveTo(-4, ROAD);
      const step = 16;
      const off = r.far % step;
      const base = Math.floor(r.far / step);
      for (let i = 0; i <= LW / step + 1; i++) ctx.lineTo(i * step - off, ROAD - 14 - ridge[(base + i) % ridge.length]);
      ctx.lineTo(LW + 4, ROAD);
      ctx.fill();
      ctx.fillStyle = "#101010";
      ctx.beginPath();
      ctx.moveTo(-4, ROAD);
      for (let x = 0; x <= LW; x += 6) ctx.lineTo(x, ROAD - 10 - Math.sin((x + r.mid) * 0.03) * 5 - Math.sin((x + r.mid) * 0.011) * 6);
      ctx.lineTo(LW + 4, ROAD);
      ctx.fill();
      for (let i = 0; i < 6; i++) {
        const x = (((i * 61 - r.mid * 1.1) % (LW + 40)) + LW + 40) % (LW + 40) - 20;
        const h = 10 + (i % 3) * 4;
        ctx.beginPath();
        ctx.moveTo(x, ROAD - 6);
        ctx.lineTo(x + 4, ROAD - 6 - h);
        ctx.lineTo(x + 8, ROAD - 6);
        ctx.fill();
      }
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(-4, ROAD, LW + 8, LH - ROAD);
      for (let i = 0; i < 4; i++) {
        const x = (((i * 90 - r.road) % 360) + 360) % 360 - 30;
        ctx.fillStyle = color("--fg", 0.35);
        ctx.fillRect(x, ROAD - 26, 1.5, 26);
        ctx.fillStyle = color("--fg", 0.08);
        ctx.beginPath();
        ctx.arc(x + 1, ROAD - 26, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color("--fg", 0.75);
        ctx.fillRect(x - 1, ROAD - 27, 4, 2);
      }
      ctx.fillStyle = color("--fg", 0.3);
      for (let x = -(r.road % 28); x < LW; x += 28) ctx.fillRect(x, ROAD + 15, 14, 1.5);

      const fireRate = rpm() / 120;
      const buzz = r.running ? Math.sin(r.t * fireRate * Math.PI * 2) * 0.6 : r.cranking > 0 ? (Math.random() - 0.5) * 1.4 : 0;
      if (r.running) {
        const beam = ctx.createLinearGradient(130, 0, 230, 0);
        beam.addColorStop(0, color("--fg", 0.14));
        beam.addColorStop(1, color("--fg", 0));
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(128, ROAD - 9);
        ctx.lineTo(230, ROAD + 6);
        ctx.lineTo(230, ROAD + 26);
        ctx.closePath();
        ctx.fill();
      }
      drawBike(ctx, color, 110, ROAD + 14 + buzz, r.wheel, r.flame);

      ctx.font = `10px ${mono}`;
      ctx.textAlign = "left";
      ctx.fillStyle = color("--fg");
      ctx.fillText(`${Math.round(r.speed)} km/h`, 10, 16);
      ctx.fillStyle = color("--fg", 0.55);
      ctx.fillText(`${Math.round(rpm() / 100) * 100} rpm`, 10, 29);
      ctx.fillText(`${r.dist.toFixed(1)} km`, 10, 42);
      ctx.fillStyle = r.ign ? color("--matcha") : color("--accent");
      ctx.fillText(r.ign ? "RUN" : "OFF", LW - 30, 16);
    };

    const update = (dt: number) => {
      r.t += dt;
      const target = r.running ? 900 + r.speed * 32 + r.flare * 1900 : r.speed * 26;
      r.revs += (target - r.revs) * Math.min(1, dt * (target > r.revs ? 6 : 1.3));
      if (!r.running && r.revs < 50) r.revs = 0;
      r.flare = Math.max(0, r.flare - dt * 1.4);
      r.flame = Math.max(0, r.flame - dt * 4);
      r.shake = Math.max(0, r.shake - dt * 3);
      // the overrun burble dies out over a couple of seconds, and only lasts while the throttle stays shut
      r.overrun = r.throttle || !r.running ? 0 : Math.max(0, r.overrun - dt * 0.5);

      if (r.cranking > 0) {
        r.cranking -= dt;
        if (r.cranking <= 0 && r.catches && !r.ign) setMsg("the kill switch went OFF mid crank. it won't fire.");
        if (r.cranking <= 0 && r.catches && r.ign) {
          r.running = true;
          r.flare = 1;
          r.idle = 0;
          r.revs = Math.max(r.revs, 1200);
          r.fire = (audioTime() ?? 0) + 0.12;
          setRunning(true);
          setMsg("hold to ride. let go at speed and listen to it pop.");
        }
      }
      if (r.running) {
        r.speed = r.throttle ? Math.min(125, r.speed + 24 * dt) : Math.max(0, r.speed - 7 * dt);
        if (!r.throttle && r.speed < 1) {
          r.idle += dt;
          if (r.idle > 25) stopEngine("stalled after sitting idle. hit start.");
        } else r.idle = 0;
        const at = audioTime();
        if (at !== null) {
          if (r.fire < at) r.fire = at + 0.02;
          const rate = Math.max(4, rpm() / 120);
          while (r.fire < at + 0.12) {
            thump(r.fire);
            // engine braking after you let go: now and then a cycle lights off in the pipe, fewer and softer as it settles
            if (r.overrun > 0.05 && r.fire - lastPop > 0.045 && Math.random() < (7 * r.overrun) / rate) {
              pop(r.fire + 0.012, r.overrun);
              lastPop = r.fire;
            }
            r.fire += 1 / rate;
          }
        }
      } else {
        // coasting with no combustion, unburnt fuel piles up in the hot exhaust
        r.speed = Math.max(0, r.speed - (r.ign ? 9 : 11) * dt);
        if (!r.ign && r.speed > 30) r.fuel += dt * (r.speed / 90);
      }
      const px = r.speed * 3 * dt;
      r.far += px * 0.12;
      r.mid += px * 0.4;
      r.road += px;
      r.wheel += px * 0.11;
      r.dist += (r.speed / 3600) * dt * 20;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.04, (now - (prev || now)) / 1000);
      prev = now;
      update(dt);
      draw();
      if (!r.running && r.speed <= 0 && r.revs < 50 && r.cranking <= 0 && r.flame <= 0 && r.shake <= 0) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const run = () => {
      if (raf || !onScreen) return;
      prev = 0;
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      primeAudio();
      loadPop();
      if (r.running || r.cranking > 0) return;
      r.catches = r.ign;
      r.cranking = 0.62;
      crank(r.ign);
      if (r.speed < 1) r.dist = 0;
      setMsg(r.ign ? "cranking..." : "it cranks but won't fire. the kill switch is on OFF.");
      run();
    };
    const kill = () => {
      primeAudio();
      loadPop();
      r.ign = !r.ign;
      setIgn(r.ign);
      if (!r.ign) {
        r.killedAt = performance.now();
        r.fuel = 0;
        if (r.running) {
          r.running = false;
          r.throttle = false;
          setRunning(false);
          windDown();
        }
      } else if (!r.running && r.killedAt && r.speed > 12) {
        // still rolling, so it bump starts. if fuel collected in the pipe, it lights off
        r.running = true;
        r.fire = (audioTime() ?? 0) + 0.05;
        setRunning(true);
        if (r.fuel > 0.02 && performance.now() - r.killedAt < 1600) {
          const size = Math.min(1.3, 0.55 + r.fuel * 1.6);
          patak(size);
          r.flame = 1.2;
          r.shake = size;
        }
        r.fuel = 0;
      } else if (!r.running) setMsg("kill switch on RUN. hit start.");
      run();
    };
    const throttle = (on: boolean) => {
      if (on && !r.running) {
        if (r.speed < 3) start();
        return;
      }
      const was = r.throttle;
      r.throttle = on && r.running;
      if (r.throttle) r.idle = 0;
      // closing the throttle at speed starts the overrun burble, bigger the higher it was revving.
      // the first pop always lands right as you let go
      if (was && !r.throttle && r.running && r.speed > 40) {
        r.overrun = Math.min(1, Math.max(0.35, (rpm() - 1800) / 2600));
        const at = audioTime();
        if (at !== null) {
          pop(at + 0.04, r.overrun);
          lastPop = at + 0.04;
        }
      }
    };
    ctrl.current = { kill, start };

    const down = () => throttle(true);
    const up = () => throttle(false);
    const resize = () => {
      scale = fitCanvas(canvas, LW, LH, dpr);
      draw();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        if (!e.repeat) throttle(true);
      } else if (e.key === "k") kill();
      else if (e.key === "s") start();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp") throttle(false);
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) return run();
      stopEngine("engine off.");
      r.cranking = 0;
      cancelAnimationFrame(raf);
      raf = 0;
    });
    const ro = new ResizeObserver(resize);
    resize();
    ro.observe(canvas);
    io.observe(canvas);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointerleave", up);
    canvas.addEventListener("pointercancel", up);
    // losing focus mid-hold would otherwise leave the throttle pinned open
    canvas.addEventListener("blur", up);
    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    return () => {
      cancelAnimationFrame(raf);
      ctrl.current = null;
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointerleave", up);
      canvas.removeEventListener("pointercancel", up);
      canvas.removeEventListener("blur", up);
      canvas.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div>
      <canvas
        ref={ref}
        tabIndex={0}
        aria-label="Ride the Thunderbird. Start the engine, hold to ride."
        className="game-canvas hold"
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="moto mt-2">
        <button type="button" className={`moto-btn ${ign ? "is-run" : "is-off"}`} onClick={() => ctrl.current?.kill()}>
          <i className="moto-led" /> kill switch <b>{ign ? "run" : "off"}</b>
        </button>
        <button type="button" className="moto-btn" onClick={() => ctrl.current?.start()} disabled={running}>
          start
        </button>
      </div>
      <p className="label mt-2 min-h-[1.6em] text-dim">{msg}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// gym: deadlift. spam click to lock it out before the clock runs out, plates go up every rep

const LIFT_LINES = ["light weight baby!", "yeah buddy!", "ain't nothing but a peanut!"];
const PLATE_COLORS = ["--accent", "--ai", "--kin", "--matcha"];

export function Deadlift() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [msg, setMsg] = useState("click to start. spam click to lock it out.");

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const LW = 300;
    const LH = 150;
    const FLOOR = 134;
    const css = getComputedStyle(document.documentElement);
    const color = cssColor(css);
    let scale = 1;
    let raf = 0;
    let prev = 0;
    let failedAt = 0;
    let topLift = 0;
    let lockTimer = 0;
    const g = { state: "idle" as "idle" | "lift" | "locked" | "fail", weight: 60, p: 0, t: 0, need: 9, limit: 2.8 };

    const draw = () => {
      ctx.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0);
      ctx.clearRect(0, 0, LW, LH);
      const e = 1 - Math.pow(1 - g.p, 2);
      const cx = 150;
      ctx.strokeStyle = color("--fg", 0.22);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(20, FLOOR + 0.5);
      ctx.lineTo(LW - 20, FLOOR + 0.5);
      ctx.stroke();
      if (g.state === "lift") {
        ctx.fillStyle = color("--accent");
        ctx.fillRect(20, 6, (LW - 40) * Math.max(0, 1 - g.t / g.limit), 2);
      }
      const hip = { x: lerp(cx - 20, cx - 2, e), y: lerp(FLOOR - 40, FLOOR - 58, e) };
      const knee = { x: lerp(cx + 6, cx + 1, e), y: lerp(FLOOR - 21, FLOOR - 29, e) };
      const sh = { x: lerp(cx + 8, cx, e), y: lerp(FLOOR - 58, FLOOR - 88, e) };
      const barY = lerp(FLOOR - 15, FLOOR - 52, e);
      ctx.strokeStyle = color("--fg", 0.92);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (const off of [-3, 3]) {
        ctx.moveTo(cx + off, FLOOR);
        ctx.lineTo(knee.x + off, knee.y);
        ctx.lineTo(hip.x, hip.y);
      }
      ctx.lineTo(sh.x, sh.y);
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(cx + 2, barY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sh.x + lerp(7, 0, e), sh.y - 9, 5, 0, Math.PI * 2);
      ctx.stroke();
      // the bar bends once it leaves the floor, more with every plate
      const sag = (g.weight / 40) * Math.min(1, g.p * 4) + (g.state === "locked" ? 1 : 0);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(42, barY + sag);
      ctx.quadraticCurveTo(cx, barY - sag, LW - 42, barY + sag);
      ctx.stroke();
      const plates = Math.min(6, Math.round(g.weight / 40));
      for (let i = 0; i < plates; i++) {
        ctx.fillStyle = color(PLATE_COLORS[i % PLATE_COLORS.length], 0.9);
        const r = i === 0 ? 15 : 13;
        ctx.fillRect(60 - i * 6, barY + sag * 0.8 - r, 5, r * 2);
        ctx.fillRect(LW - 65 + i * 6, barY + sag * 0.8 - r, 5, r * 2);
      }
      ctx.fillStyle = color("--muted");
      ctx.font = `10px ${css.getPropertyValue("--font-mono").trim() || "monospace"}`;
      ctx.fillText(`${g.weight}kg`, 20, 24);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - (prev || now)) / 1000);
      prev = now;
      update(dt);
      draw();
      if (g.state === "fail" || g.state === "idle") {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const run = () => {
      if (raf) return;
      prev = 0;
      raf = requestAnimationFrame(loop);
    };
    const begin = (w: number) => {
      Object.assign(g, { state: "lift", weight: w, p: 0, t: 0, need: 6 + Math.round(w / 20), limit: Math.max(1.9, 3 - w / 400) });
      setMsg(`${w}kg. pull.`);
      run();
    };
    const update = (dt: number) => {
      if (g.state !== "lift") return;
      g.t += dt;
      g.p = Math.max(0, g.p - dt * 0.22);
      if (g.t > g.limit) {
        g.state = "fail";
        failedAt = performance.now();
        setMsg(
          topLift
            ? `stuck at ${g.weight}kg. top lift ${topLift}kg, pr ${best("lift-best", topLift)}kg. click to go again.`
            : "couldn't break it off the floor. warm up and click again.",
        );
      }
    };
    const press = () => {
      if (g.state === "idle" || g.state === "fail") {
        if (performance.now() - failedAt < 700) return;
        topLift = 0;
        begin(60);
        return;
      }
      if (g.state !== "lift") return;
      g.p = Math.min(1, g.p + 1 / g.need);
      if (g.p >= 1) {
        g.state = "locked";
        topLift = g.weight;
        setMsg(`${g.weight}kg locked out. ${pick(LIFT_LINES)}`);
        lockTimer = window.setTimeout(() => g.state === "locked" && begin(g.weight + 20), 1000);
      }
    };
    const resize = () => {
      scale = fitCanvas(canvas, LW, LH, dpr);
      draw();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        press();
      }
    };
    const ro = new ResizeObserver(resize);
    resize();
    ro.observe(canvas);
    canvas.addEventListener("pointerdown", press);
    canvas.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(lockTimer);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", press);
      canvas.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div>
      <canvas ref={ref} tabIndex={0} aria-label="Deadlift game. Click fast to lift." className="game-canvas" />
      <p className="label mt-2 min-h-[1.6em] text-dim">{msg}</p>
    </div>
  );
}
