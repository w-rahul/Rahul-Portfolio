"use client";

import { useEffect, useRef } from "react";
import { Jp } from "./Jp";
import { clank, primeAudio, swish } from "./sound";

const RAMP = " .:-=+*#%@";
const SCRAMBLE = "!/\\|_-=+*#%@<>";
// six 320x144 grayscale frames of mahoraga from the fight, stacked top to bottom
const ART = "/art/mahoraga.png?v=4";
const FW = 320;
const FH = 144;
const FRAMES = 6;
const STORM = 1.6;

type Cut = { x0: number; y0: number; x1: number; y1: number; age: number; life: number; w: number };

// Mahoraga in fine ASCII, breathing through frames of the fight. Click it and Sukuna's slashes rain on it
// for a second and a half, then it adapts.
export function MahoragaBanner() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const CW = 5;
    const CH = 9;
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "monospace";
    const mouse = { x: -999, y: -999 };
    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let img: HTMLImageElement | null = null;
    let grids: Float32Array[] = [];
    let cuts: Cut[] = [];
    let storm = 0;
    let next = 2.5;
    let t = 0;
    let speed = 1;
    let raf = 0;
    let last = 0;
    let running = false;
    let onScreen = true;
    let alive = true;

    // each frame averaged down to exactly one value per character cell, with a hard contrast curve so shapes read.
    // the whole frame fits inside the banner, centred, and its sides melt into the black
    const bake = () => {
      if (!img || !cols) return;
      const scale = Math.min(W / FW, H / FH);
      const dw = (FW * scale) / CW;
      const dh = (FH * scale) / CH;
      const dx = (cols - dw) / 2;
      const dy = (rows - dh) / 2;
      const c = document.createElement("canvas");
      c.width = cols;
      c.height = rows;
      const x = c.getContext("2d", { willReadFrequently: true });
      if (!x) return;
      x.imageSmoothingEnabled = true;
      x.imageSmoothingQuality = "high";
      grids = [];
      for (let f = 0; f < FRAMES; f++) {
        x.clearRect(0, 0, cols, rows);
        x.drawImage(img, 0, f * FH, FW, FH, dx, dy, dw, dh);
        const d = x.getImageData(0, 0, cols, rows).data;
        const g = new Float32Array(cols * rows);
        for (let i = 0; i < g.length; i++) {
          const u = ((i % cols) + 0.5 - dx) / dw;
          const edge = Math.max(0, Math.min(1, Math.min(u, 1 - u) / 0.08));
          g[i] = Math.min(1, Math.max(0, (d[i * 4] / 255 - 0.16) / 0.62)) * edge;
        }
        grids.push(g);
      }
    };

    const layout = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      if (W < 10 || H < 10) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      cols = Math.ceil(W / CW);
      rows = Math.ceil(H / CH);
      bake();
    };

    const tag = canvas.parentElement?.querySelector<HTMLElement>(".adapt-tag");
    // the storm is over and mahoraga has adapted
    const adapt = () => {
      clank(0.9);
      if (tag) {
        tag.classList.remove("flash");
        void tag.offsetWidth;
        tag.classList.add("flash");
      }
    };

    const cut = (big = false) => {
      const cx = Math.random() * W;
      const cy = Math.random() * H;
      const a = Math.random() * Math.PI;
      const len = ((big ? 1.15 : 0.2 + Math.random() * 0.7) * W) / 2;
      cuts.push({
        x0: cx - Math.cos(a) * len,
        y0: cy - Math.sin(a) * len,
        x1: cx + Math.cos(a) * len,
        y1: cy + Math.sin(a) * len,
        age: 0,
        life: 0.12 + Math.random() * 0.13,
        w: big ? 2.2 : 0.7 + Math.random() * 1.1,
      });
    };

    const frame = (dt: number) => {
      t += dt;
      cuts.forEach((s) => (s.age += dt));
      cuts = cuts.filter((s) => s.age < s.life);
      if (storm > 0) {
        // a handful of new cuts every frame, every so often a big one across everything
        storm -= dt;
        const n = 4 + Math.floor(Math.random() * 4);
        for (let i = 0; i < n; i++) cut(Math.random() < 0.05);
        if (Math.random() < 0.35) swish(0.06);
        if (storm <= 0) adapt();
      }
      // a lone slash now and then so it never sits still
      next -= dt;
      if (next <= 0) {
        if (storm <= 0) cut(true);
        next = 4 + Math.random() * 3;
      }
    };

    const render = () => {
      if (!cols) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#070707";
      ctx.fillRect(0, 0, W, H);
      ctx.font = `8px ${mono}`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      // ping pong through the frames, like it's breathing
      const span = FRAMES - 1;
      const ph = (t * 1.2) % (span * 2);
      const fr = ph < span ? ph : span * 2 - ph;
      const f0 = Math.floor(fr);
      const k = fr - f0;
      const g0 = grids[f0];
      const g1 = grids[Math.min(f0 + 1, span)];
      const buckets: [number, number, string][][] = [[], [], [], [], []];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = (c + 0.5) * CW;
          const py = (r + 0.5) * CH;
          const i = r * cols + c;
          let b = g0 && g1 ? g0[i] * (1 - k) + g1[i] * k : 0;
          let ch = b > 0.1 ? RAMP[Math.min(RAMP.length - 1, Math.floor(b * RAMP.length))] : "";
          if (Math.hypot(px - mouse.x, py - mouse.y) < 36 && (ch || Math.random() < 0.25)) {
            ch = SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
            b = Math.max(b, 0.5);
          }
          if (!ch || ch === " ") continue;
          buckets[Math.min(4, Math.floor(b * 5))].push([px, py, ch]);
        }
      }
      const shades = ["#333333", "#5c5c5c", "#8f8f8f", "#c6c6c6", "#efefef"];
      buckets.forEach((items, i) => {
        ctx.fillStyle = shades[i];
        items.forEach(([x, y, ch]) => ctx.fillText(ch, x, y));
      });
      // the slashes are real lines, not glyphs, so they stay razor sharp over the art
      ctx.lineCap = "round";
      for (const s of cuts) {
        const p = s.age / s.life;
        const grow = Math.min(1, p / 0.25);
        ctx.strokeStyle = `rgba(255,255,255,${(1 - p).toFixed(3)})`;
        ctx.lineWidth = s.w * (1 - p * 0.5);
        ctx.beginPath();
        ctx.moveTo(s.x0, s.y0);
        ctx.lineTo(s.x0 + (s.x1 - s.x0) * grow, s.y0 + (s.y1 - s.y0) * grow);
        ctx.stroke();
      }
    };

    // ~24fps keeps the finer grid cheap
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 41) return;
      const dt = Math.min(0.06, (now - (last || now)) / 1000);
      last = now;
      if (document.documentElement.classList.contains("time-stop")) return;
      frame(dt * speed);
      render();
    };
    const start = () => {
      if (running || reduce || !onScreen || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      // against the on-screen size, so page zoom can't throw it off
      mouse.x = ((e.clientX - r.left) / r.width) * W;
      mouse.y = ((e.clientY - r.top) / r.height) * H;
    };
    const onLeave = () => {
      mouse.x = -999;
      mouse.y = -999;
    };
    const onDown = (e: PointerEvent) => {
      onMove(e);
      primeAudio();
      swish(0.3);
      if (reduce) {
        // no animation: show a few finished cuts for a moment
        for (let i = 0; i < 6; i++) cut();
        cuts.forEach((s) => (s.age = s.life * 0.3));
        render();
        window.setTimeout(() => {
          if (!alive) return;
          cuts = [];
          render();
          adapt();
        }, 450);
        return;
      }
      for (let i = 0; i < 10; i++) cut(i === 0);
      storm = Math.max(storm, STORM);
    };
    const onAccelerate = (e: Event) => {
      speed = (e as CustomEvent<boolean>).detail ? 10 : 1;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    const art = new Image();
    art.src = ART;
    const artReady = art
      .decode()
      .then(() => {
        img = art;
        bake();
      })
      .catch(() => {});

    const ro = new ResizeObserver(() => {
      layout();
      render();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("svc:accelerate", onAccelerate);
    document.addEventListener("visibilitychange", onVisibility);
    Promise.all([document.fonts.ready, artReady]).then(() => {
      if (!alive) return;
      layout();
      render();
      canvas.classList.add("on");
      start();
    });

    return () => {
      alive = false;
      stop();
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("svc:accelerate", onAccelerate);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="shrine">
      <canvas ref={ref} aria-hidden className="shrine-canvas absolute inset-0 h-full w-full" />
      <Jp en="mahoraga. it adapts to everything" vertical className="jb-seal">
        魔虚羅
      </Jp>
      <Jp en="adapted" className="adapt-tag">
        適応
      </Jp>
    </div>
  );
}
