"use client";

import { useEffect, useRef, useState } from "react";

const RAMP = " .:-=+*#%@";
const COLUMN = 768;

const VERT = `#version 300 es
in vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }`;

// Pass 1, one fragment per character cell: one set of rings rolling out from the middle of the page, behind the
// column, like a domain opening, so both gutters show the same arcs mirrored. Sparks rising. Always moving.
const FIELD = `#version 300 es
precision highp float;
uniform vec2 uGrid, uCell, uRes, uMouse;
uniform float uTime, uGutter;
out vec4 o;
float h(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
void main() {
  vec2 px = vec2(gl_FragCoord.x, uGrid.y - gl_FragCoord.y) * uCell;
  float t = uTime;
  float y = px.y / uRes.y;
  float side = 1.0 - smoothstep(0.3, 1.0, min(px.x, uRes.x - px.x) / max(uGutter, 1.0));
  // measured from the centre of the page with x folded, so the two sides are exact mirror images
  float fx = abs(px.x - uRes.x * 0.5);
  vec2 cell = vec2(floor(fx / uCell.x), floor(px.y / uCell.y));
  vec2 d = vec2(fx, px.y - uRes.y * 0.5) / uRes.y;
  float r = length(d);
  // thin rings rolling outward, fading in past the column and out toward the corners
  float ring = pow(0.5 + 0.5 * sin((r * 7.0 - t * 0.5) * 6.2831853), 12.0);
  float v = ring * 0.8 * smoothstep(0.32, 0.5, r) * (1.0 - smoothstep(1.0, 1.5, r));
  // sparks racing up, the same columns on both sides
  for (int k = 0; k < 2; k++) {
    float seed = h(vec2(cell.x, float(k) * 7.1 + 1.3));
    if (seed > 0.15) continue;
    float speed = 0.06 + 0.14 * h(vec2(cell.x, float(k) + 9.7));
    float head = 1.0 - fract(seed * 13.7 + t * speed);
    float dd = (y - head) * uGrid.y;
    if (dd >= 0.0 && dd < 4.0) v = max(v, (1.0 - dd / 4.0) * 0.8 * smoothstep(0.05, 0.5, head) * side);
  }
  // lit cells flicker between neighbouring glyphs
  v += (h(cell + mod(floor(t * 9.0), 64.0)) - 0.5) * 0.1 * step(0.02, v);
  // a few sparks around the cursor
  float mo = distance(px, uMouse) / uRes.y;
  v = max(v, (1.0 - smoothstep(0.0, 0.08, mo)) * 0.5 * step(0.6, h(cell + mod(floor(t * 12.0), 64.0))) * side);
  o = vec4(clamp(v, 0.0, 1.0), 0.0, 0.0, 1.0);
}`;

// Pass 2: a glyph per cell, plain grey, full strength in the gutters and a whisper behind the column.
const GLYPH = `#version 300 es
precision highp float;
uniform sampler2D uField, uAtlas;
uniform vec2 uGrid, uCell, uRes;
uniform float uCount, uGutter;
out vec4 o;
void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(p / uCell);
  vec2 local = fract(p / uCell);
  float v = texture(uField, vec2((cell.x + 0.5) / uGrid.x, (uGrid.y - cell.y - 0.5) / uGrid.y)).r;
  float gi = min(floor(v * uCount), uCount - 1.0);
  float g = texture(uAtlas, vec2((gi + local.x) / uCount, local.y)).r;
  float inside = step(uGutter, p.x) * step(p.x, uRes.x - uGutter);
  float a = g * (0.04 + 0.26 * v) * (1.0 - 0.75 * inside);
  o = vec4(vec3(0.9) * a, a);
}`;

// The empty space beside the column: ascii rings rolling out from the middle of the page, mirrored. Wide screens only.
export function GutterAscii() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(min-width: 1100px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !wide) return;
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: true, powerPreference: "low-power" });
    if (!gl) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cw = Math.round(8 * dpr);
    const ch = Math.round(14 * dpr);
    const mouse = { x: -9999, y: -9999 };
    let W = 1;
    let H = 1;
    let cols = 1;
    let rows = 1;
    let gutter = 0;
    let raf = 0;
    let last = 0;
    // its own clock: frozen during a time stop, six times faster during made in heaven
    let clock = reduce ? 4 : 0;
    let rate = 1;
    let running = false;
    let ready = false;
    let alive = true;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const program = (fs: string) => {
      const p = gl.createProgram()!;
      gl.attachShader(p, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, "p");
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
      return p;
    };
    const progs = (() => {
      try {
        return { pf: program(FIELD), pg: program(GLYPH) };
      } catch (e) {
        console.warn("[gutter-ascii]", e);
        return null;
      }
    })();
    if (!progs) return;
    const { pf, pg } = progs;
    const uniforms = (p: WebGLProgram, names: string[]) =>
      Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(p, n)])) as Record<string, WebGLUniformLocation | null>;
    const uf = uniforms(pf, ["uGrid", "uCell", "uRes", "uMouse", "uTime", "uGutter"]);
    const ug = uniforms(pg, ["uField", "uAtlas", "uGrid", "uCell", "uRes", "uCount", "uGutter"]);

    const vao = gl.createVertexArray();
    const vbo = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const texture = (unit: number) => {
      const t = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const fieldTex = texture(0);
    const atlasTex = texture(1);
    const fbo = gl.createFramebuffer();
    gl.useProgram(pg);
    gl.uniform1i(ug.uField, 0);
    gl.uniform1i(ug.uAtlas, 1);
    gl.uniform1f(ug.uCount, RAMP.length);

    const draw = (time: number) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, cols, rows);
      gl.useProgram(pf);
      gl.uniform2f(uf.uGrid, cols, rows);
      gl.uniform2f(uf.uCell, cw, ch);
      gl.uniform2f(uf.uRes, W, H);
      gl.uniform2f(uf.uMouse, mouse.x, mouse.y);
      gl.uniform1f(uf.uTime, time);
      gl.uniform1f(uf.uGutter, gutter);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.useProgram(pg);
      gl.uniform2f(ug.uGrid, cols, rows);
      gl.uniform2f(ug.uCell, cw, ch);
      gl.uniform2f(ug.uRes, W, H);
      gl.uniform1f(ug.uGutter, gutter);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const vw = document.documentElement.clientWidth;
      const vh = document.documentElement.clientHeight;
      W = Math.max(1, Math.round(vw * dpr));
      H = Math.max(1, Math.round(vh * dpr));
      canvas.width = W;
      canvas.height = H;
      cols = Math.ceil(W / cw);
      rows = Math.ceil(H / ch);
      gutter = Math.max(0, (vw - COLUMN) / 2) * dpr;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, fieldTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cols, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fieldTex, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      if (ready) draw(clock);
    };

    const buildAtlas = () => {
      const c = document.createElement("canvas");
      c.width = cw * RAMP.length;
      c.height = ch;
      const x = c.getContext("2d")!;
      x.fillStyle = "#000";
      x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = "#fff";
      x.textAlign = "center";
      x.textBaseline = "middle";
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim();
      x.font = `${Math.round(11 * dpr)}px ${family ? `${family}, ` : ""}monospace`;
      for (let i = 0; i < RAMP.length; i++) x.fillText(RAMP[i], i * cw + cw / 2, ch / 2);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, atlasTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    };

    // ~30fps, and it parks while the tab is hidden
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (document.documentElement.classList.contains("time-stop")) return;
      clock += dt * rate;
      draw(clock);
    };
    const start = () => {
      if (running || reduce || !ready || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX * dpr;
      mouse.y = e.clientY * dpr;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onAccelerate = (e: Event) => {
      rate = (e as CustomEvent<boolean>).detail ? 10 : 1;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("svc:accelerate", onAccelerate);
    document.fonts.ready.then(() => {
      if (!alive) return;
      buildAtlas();
      ready = true;
      draw(clock);
      canvas.classList.add("on");
      start();
    });

    return () => {
      alive = false;
      stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("svc:accelerate", onAccelerate);
      // the context outlives this effect when the breakpoint flips, so free what it made
      gl.deleteProgram(pf);
      gl.deleteProgram(pg);
      [fieldTex, atlasTex].forEach((t) => gl.deleteTexture(t));
      gl.deleteFramebuffer(fbo);
      gl.deleteBuffer(vbo);
      gl.deleteVertexArray(vao);
    };
  }, [wide]);

  return <canvas ref={ref} aria-hidden className="gutter-ascii" />;
}
