// Power-up payoff: a real anime clip with its own animation, jojo style lettering, an impact frame and a real screen shake.
// Every move needs its clip. The layout lists the clips on disk in <html data-clips>, and a move without one never fires.
import { loadSample, playSample, primeAudio } from "./sound";

export { primeAudio };

type Kind = "time" | "heaven" | "crash" | "golden" | "kame";
// the clip is /public/voices/<id>.mp3, git-ignored so it stays on this machine.
// gain evens out loudness between clips, start/length pick a slice of a longer one, hit is when the impact lands (ms).
// ink colours the lettering: three gradient stops top to bottom, then the hard shadow
type Move = {
  id: string;
  jp: string;
  en: string;
  sub?: string;
  who: string;
  kind: Kind;
  ink: [string, string, string, string];
  jojo?: boolean;
  tint?: "dio" | "jotaro";
  power: number;
  gain?: number;
  start?: number;
  length?: number;
  hit?: number;
};

const JOJO = "JoJo's Bizarre Adventure";
// every move letters in the site's own colours: white to grey, a black outline, a dark shadow
const MONO: [string, string, string, string] = ["#ffffff", "#e6e6e6", "#9e9e9e", "#2a2a2a"];

const MOVES: Move[] = [
  {
    id: "za-warudo",
    jp: "ザ・ワールド",
    en: "ZA WARUDO!",
    sub: "時よ止まれ！",
    who: `DIO, ${JOJO}`,
    kind: "time",
    tint: "dio",
    jojo: true,
    ink: MONO,
    power: 0.8,
    gain: 2.4,
  },
  {
    id: "star-platinum",
    jp: "スタープラチナ",
    en: "STAR PLATINUM: THE WORLD!",
    sub: "時よ止まれ！",
    who: `Jotaro Kujo, ${JOJO}`,
    kind: "time",
    tint: "jotaro",
    jojo: true,
    ink: MONO,
    power: 0.9,
    gain: 2.6,
  },
  {
    id: "made-in-heaven",
    jp: "メイド・イン・ヘブン",
    en: "MADE IN HEAVEN",
    sub: "時は加速する",
    who: `Enrico Pucci, ${JOJO}`,
    kind: "heaven",
    jojo: true,
    ink: MONO,
    power: 0.5,
    gain: 0.9,
  },
  {
    id: "road-roller",
    jp: "ロードローラーだ！",
    en: "ROAD ROLLER DA!",
    who: `DIO, ${JOJO}`,
    kind: "crash",
    jojo: true,
    ink: MONO,
    power: 1.4,
    gain: 1.1,
    hit: 2250,
  },
  {
    id: "giorno",
    jp: "このジョルノ・ジョバァーナには夢がある",
    en: "I, Giorno Giovanna, have a dream.",
    who: `Giorno Giovanna, ${JOJO}: Golden Wind`,
    kind: "golden",
    jojo: true,
    ink: MONO,
    power: 0.3,
    gain: 1.8,
  },
  {
    id: "kamehameha",
    jp: "かめはめ波",
    en: "KAMEHAMEHA!",
    who: "Goku, Dragon Ball Z",
    kind: "kame",
    ink: MONO,
    power: 1.3,
  },
];

// ---- clips

const decoded = new Map<string, AudioBuffer>();
let clipSrc: AudioBufferSourceNode | null = null;
let warming: Promise<void> | null = null;

// fetch and decode every clip on disk once, starting on the first press
export const preloadClips = () => {
  primeAudio();
  if (!warming) {
    const have = (document.documentElement.dataset.clips ?? "").split(" ");
    const jobs = MOVES.filter((m) => have.includes(m.id)).map((m) =>
      loadSample(`/voices/${m.id}.mp3`).then((buf) => {
        if (buf) decoded.set(m.id, buf);
      }),
    );
    // if any clip failed to load, try again on the next press
    warming = Promise.all(jobs).then(() => {
      if (decoded.size < jobs.length) warming = null;
    });
  }
  return warming;
};

// plays the clip and returns how long it runs (ms)
const playClip = (m: Move, buf: AudioBuffer) => {
  const offset = m.start ?? 0;
  const length = Math.min(m.length ?? buf.duration, buf.duration - offset);
  clipSrc = playSample(buf, { gain: m.gain ?? 1, offset, duration: length });
  const ms = length * 1000;
  window.dispatchEvent(new CustomEvent("svc:duck", { detail: ms }));
  return ms;
};

// when the big shout lands: the start of the loudest stretch in the back two thirds of the clip (ms)
const shoutAt = (m: Move, buf: AudioBuffer, ms: number) => {
  const data = buf.getChannelData(0);
  const win = Math.round(buf.sampleRate * 0.05);
  const from = Math.round(((m.start ?? 0) + (ms / 1000) * 0.35) * buf.sampleRate);
  const to = Math.round(((m.start ?? 0) + ms / 1000) * buf.sampleRate) - win;
  const energy: number[] = [];
  for (let s = from; s < to; s += win) {
    let e = 0;
    for (let i = s; i < s + win; i += 8) e += data[i] * data[i];
    energy.push(e);
  }
  if (!energy.length) return ms * 0.6;
  let peak = 0;
  energy.forEach((e, i) => {
    if (e > energy[peak]) peak = i;
  });
  let k = peak;
  while (k > 0 && energy[k - 1] > energy[peak] * 0.3) k -= 1;
  return ms * 0.35 + k * 50;
};

// ---- visuals

let timers: number[] = [];
let layers: HTMLElement[] = [];
let shakeRaf = 0;
let clockRaf = 0;
let accelerated = false;

const after = (ms: number, fn: () => void) => {
  timers.push(window.setTimeout(fn, ms));
};

const setRate = (rate: number) => {
  document.getAnimations().forEach((a) => {
    const target = (a.effect as KeyframeEffect | null)?.target;
    if (target instanceof Element && target.closest(".anime, .heaven")) return;
    a.playbackRate = rate;
  });
};
const accelerate = (on: boolean) => {
  accelerated = on;
  setRate(on ? 12 : 1);
  window.dispatchEvent(new CustomEvent("svc:accelerate", { detail: on }));
};

// a new move cuts off whatever the previous one still had going
const reset = () => {
  timers.forEach(clearTimeout);
  timers = [];
  layers.forEach((el) => el.remove());
  layers = [];
  cancelAnimationFrame(shakeRaf);
  cancelAnimationFrame(clockRaf);
  document.getElementById("shake-root")?.style.removeProperty("transform");
  document.documentElement.classList.remove("time-stop");
  if (accelerated) accelerate(false);
  try {
    clipSrc?.stop();
  } catch {}
  clipSrc = null;
};

const shake = (power: number, duration: number) => {
  const el = document.getElementById("shake-root");
  if (!el) return;
  cancelAnimationFrame(shakeRaf);
  const start = performance.now();
  const amp = 16 * power;
  const tick = (now: number) => {
    const p = (now - start) / duration;
    if (p >= 1) {
      el.style.transform = "";
      return;
    }
    const a = amp * (1 - p) * (1 - p);
    el.style.transform = `translate(${(Math.random() * 2 - 1) * a}px, ${(Math.random() * 2 - 1) * a}px) rotate(${(Math.random() * 2 - 1) * a * 0.04}deg)`;
    shakeRaf = requestAnimationFrame(tick);
  };
  shakeRaf = requestAnimationFrame(tick);
};

const layer = (cls: string, ms: number) => {
  const el = document.createElement("div");
  el.className = cls;
  el.setAttribute("aria-hidden", "true");
  document.body.appendChild(el);
  layers.push(el);
  after(ms, () => el.remove());
  return el;
};

const impactFrame = () => {
  const f = layer("impact", 160);
  after(70, () => f.classList.add("inv"));
};

const text = (parent: HTMLElement, cls: string, value: string) => {
  const d = document.createElement("div");
  d.className = cls;
  d.textContent = value;
  parent.appendChild(d);
  return d;
};

const at = (parent: HTMLElement, cls: string, value = "") => {
  const s = document.createElement("span");
  s.className = cls;
  s.textContent = value;
  s.style.left = `${6 + Math.random() * 82}%`;
  s.style.top = `${8 + Math.random() * 80}%`;
  s.style.setProperty("--r", `${Math.round(Math.random() * 40 - 20)}deg`);
  parent.appendChild(s);
  return s;
};

// ---- jojo lettering: every character stamped in on its own, tilted and trembling, gradient fill, fat outline, hard shadow

type Style = { latin?: boolean; max: number; fit: number; tilt: number };
const TITLE: Style = { max: 150, fit: 88, tilt: 12 };
const LINE: Style = { latin: true, max: 84, fit: 92, tilt: 5 };
const SUB: Style = { max: 56, fit: 66, tilt: 9 };

const glyph = (ch: string, delay: number, tilt: number) => {
  const c = document.createElement("span");
  c.className = "jj-c";
  c.style.setProperty("--r", `${((Math.random() * 2 - 1) * tilt).toFixed(1)}deg`);
  c.style.setProperty("--y", `${((Math.random() * 2 - 1) * 0.06).toFixed(3)}em`);
  c.style.setProperty("--s", (0.9 + Math.random() * 0.22).toFixed(2));
  c.style.setProperty("--d", `${Math.round(delay)}ms`);
  // the outline layer sits under the gradient fill
  for (const cls of ["jj-o", "jj-f"]) {
    const s = document.createElement("span");
    s.className = cls;
    s.textContent = ch;
    c.appendChild(s);
  }
  return c;
};

const line = (parent: HTMLElement, cls: string) => {
  const d = document.createElement("div");
  d.className = `jj ${cls}`;
  parent.appendChild(d);
  return d;
};

// latin runs about half an em per letter, japanese a full em and wraps after ten
const fit = (el: HTMLElement, chars: number, s: Style) => {
  const per = s.latin ? chars * 0.5 : Math.min(chars, 10);
  el.style.fontSize = `min(${(s.fit / per).toFixed(2)}vw, ${s.max}px)`;
};

// stamps value into el a character at a time and returns when the last one lands (ms)
const stamp = (el: HTMLElement, value: string, s: Style, delay = 0) => {
  el.textContent = "";
  const chars = Array.from(value);
  fit(el, chars.length, s);
  const step = Math.min(34, 320 / chars.length);
  let i = 0;
  if (s.latin)
    value.split(" ").forEach((word) => {
      const w = document.createElement("span");
      w.className = "jj-w";
      Array.from(word).forEach((ch) => w.appendChild(glyph(ch, delay + step * i++, s.tilt)));
      el.appendChild(w);
      i += 1;
    });
  else for (const ch of chars) el.appendChild(glyph(ch, delay + step * i++, s.tilt));
  return delay + step * i;
};

// jojo moves get the menacing ゴゴゴゴ creeping in from the sides
const menace = (o: HTMLElement) => {
  ["l", "r"].forEach((side, s) => {
    const g = document.createElement("div");
    g.className = `jj jj-menace jj-menace-${side}`;
    for (let k = 0; k < 3; k++) {
      const c = glyph("ゴ", 140 + s * 90 + k * 70, 10);
      c.style.marginLeft = `${(side === "l" ? k : 2 - k) * 0.3}em`;
      g.appendChild(c);
    }
    o.appendChild(g);
  });
};

// manga focus lines rushing at the middle
const focusLines = (o: HTMLElement) => {
  const l = document.createElement("div");
  l.className = "jj-lines";
  o.prepend(l);
};

// ---- the moves

// a stopwatch readout running flat out until time stops, then hanging dead until it moves again
const stopwatch = (o: HTMLElement, stopAt: number, resumeAt: number) => {
  const el = document.createElement("div");
  el.className = "ts-clock";
  o.prepend(el);
  const start = performance.now();
  const base = Date.now();
  const two = (n: number) => String(Math.floor(n)).padStart(2, "0");
  const paint = (e: number) => {
    const d = new Date(base + (e < stopAt ? e : e - (resumeAt - stopAt)));
    el.textContent = `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}.${two(d.getMilliseconds() / 10)}`;
  };
  paint(0);
  const tick = (now: number) => {
    if (!el.isConnected) return;
    clockRaf = requestAnimationFrame(tick);
    const e = now - start;
    const frozen = e >= stopAt && e < resumeAt;
    el.classList.toggle("stopped", frozen);
    if (!frozen) paint(e);
  };
  clockRaf = requestAnimationFrame(tick);
};

// time stop: an inverted sphere swallows the screen, the stopwatch dies, the world freezes, then it all snaps back
const timeStop = (m: Move, o: HTMLElement, hold: number) => {
  const root = document.documentElement;
  const sphere = layer(`ts-sphere ts-${m.tint ?? "dio"}`, hold + 1000);
  stopwatch(o, 650, hold);
  after(650, () => {
    sphere.classList.add("frozen");
    root.classList.add("time-stop");
  });
  after(hold, () => {
    sphere.classList.remove("frozen");
    sphere.classList.add("resume");
    const en = o.querySelector<HTMLElement>(".jj-en");
    const sub = o.querySelector<HTMLElement>(".jj-sub");
    if (en) stamp(en, "...and time moves again.", LINE);
    if (sub) stamp(sub, "そして時は動き出す", SUB);
  });
  after(hold + 500, () => root.classList.remove("time-stop"));
};

// made in heaven: everything on the page runs twelve times faster, a fast forward sign blinks, streaks rush past
const heaven = (o: HTMLElement, ms: number) => {
  const box = layer("heaven", ms);
  for (let k = 0; k < 30; k++) {
    const s = document.createElement("i");
    s.className = "ff-streak";
    s.style.top = `${(Math.random() * 100).toFixed(1)}%`;
    s.style.width = `${Math.round(60 + Math.random() * 220)}px`;
    s.style.animationDuration = `${(0.2 + Math.random() * 0.3).toFixed(2)}s`;
    s.style.animationDelay = `${(-Math.random()).toFixed(2)}s`;
    box.appendChild(s);
  }
  const ff = document.createElement("div");
  ff.className = "ff";
  ff.innerHTML = '<svg viewBox="0 0 64 32" aria-hidden="true"><path d="M2 2 L30 16 L2 30 Z M32 2 L60 16 L32 30 Z" fill="white"/></svg><span>×12</span>';
  o.prepend(ff);
  accelerate(true);
  after(ms - 100, () => accelerate(false));
};

// giorno: slow golden light and a few sparkles
const golden = (o: HTMLElement, ms: number) => {
  layer("golden", ms);
  for (let k = 0; k < 12; k++) after((k * ms) / 14, () => at(o, "sparkle", "✦"));
};

// kamehameha: light gathers in cupped hands a syllable at a time, then the beam tears across the screen on the shout
const kame = (m: Move, o: HTMLElement, title: HTMLElement, ms: number, hit: number) => {
  layer("kame-dark", ms);
  const orb = layer("kame-orb", ms);
  fit(title, 6, TITLE);
  ["か", "め", "は", "め"].forEach((s, i) =>
    after((hit * (i + 0.5)) / 4.5, () => {
      title.appendChild(glyph(s, 0, TITLE.tilt));
      orb.style.setProperty("--k", `${0.7 + i * 0.45}`);
      shake(0.1 + i * 0.06, 320);
    }),
  );
  after(hit, () => {
    title.appendChild(glyph("波", 0, TITLE.tilt));
    title.appendChild(glyph("！", 60, TITLE.tilt));
    const en = line(o, "jj-en");
    o.insertBefore(en, o.querySelector(".anime-who"));
    stamp(en, m.en, LINE, 120);
    orb.style.setProperty("--k", "3.4");
    const beam = layer("kame-beam", ms - hit);
    after(Math.max(0, ms - hit - 350), () => beam.classList.add("out"));
    impactFrame();
    shake(m.power, Math.min(1800, ms - hit));
  });
};

// road roller: a shadow grows on the ground, then the roller drops out of the sky and lands on the hit
const ROLLER = `<svg viewBox="0 0 600 300" aria-hidden="true"><g fill="#0b0b0b" stroke="#f2f2f2" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"><rect x="250" y="64" width="18" height="60" rx="4"/><rect x="330" y="28" width="150" height="96" rx="10"/><rect x="352" y="46" width="106" height="56" rx="6"/><rect x="200" y="118" width="310" height="112" rx="14"/><path d="M66 150 L135 106 L206 150"/><circle cx="135" cy="215" r="76"/><circle cx="135" cy="215" r="22"/><circle cx="450" cy="236" r="56"/><circle cx="450" cy="236" r="17"/></g><text x="228" y="190" fill="#f2f2f2" font-size="26" style="font-family: var(--font-jp-heavy), sans-serif">ロードローラー</text></svg>`;
const CRACKS = `<svg viewBox="-550 -60 1100 120" aria-hidden="true"><g fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M0 0 L-90 8 L-160 -4 L-260 14 L-380 6 L-540 22"/><path d="M0 0 L80 -6 L170 10 L250 2 L360 18 L540 10"/><path d="M-30 4 L-70 40 L-120 52"/><path d="M40 2 L90 36 L150 44"/><path d="M-200 -2 L-240 -36"/><path d="M220 6 L270 -30"/></g></svg>`;

const roller = (hit: number) => {
  const shadow = layer("rr-shadow", hit + 1700);
  shadow.style.setProperty("--grow", `${hit}ms`);
  const r = layer("rr", hit + 1700);
  r.innerHTML = ROLLER;
  r.style.setProperty("--fall", `${Math.max(0, hit - 520)}ms`);
  after(hit, () => {
    r.classList.add("landed");
    layer("rr-cracks", 1700).innerHTML = CRACKS;
  });
};

let last = "";
const played = new Set<string>();

// picks a move whose clip is ready. none repeats until every one of them has played
const pick = (kind?: Kind) => {
  const ready = MOVES.filter((x) => decoded.has(x.id));
  const ofKind = ready.filter((x) => x.kind === kind);
  const pool = ofKind.length ? ofKind : ready;
  if (!pool.length) return null;
  let fresh = pool.filter((x) => !played.has(x.id));
  if (!fresh.length) {
    // only a full round resets the bag, a konami time stop just reuses one of the two
    if (pool === ready) played.clear();
    fresh = pool.filter((x) => x.id !== last);
    if (!fresh.length) fresh = pool;
  }
  const m = fresh[Math.floor(Math.random() * fresh.length)];
  played.add(m.id);
  last = m.id;
  return m;
};

// fires the next move from the bag (or one of the given kind) and resolves to its line, or "" if there are no clips
export async function unleash(kind?: Kind) {
  await preloadClips();
  const m = pick(kind);
  const buf = m && decoded.get(m.id);
  if (!m || !buf) return "";
  reset();
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const clipMs = playClip(m, buf);
  // time stop resumes 0.7s before the clip ends, the roller lands on its hit and the kamehameha fires on the shout.
  // either way the overlay holds a beat after that moment before it starts fading at 80%
  const hold = Math.max(2550, clipMs - 700);
  const hit = m.kind === "kame" ? shoutAt(m, buf, clipMs) : 0;
  const moment = m.kind === "time" ? hold : m.kind === "crash" ? (m.hit ?? 2250) : hit;
  const duration = Math.max(1900, clipMs + 200, moment ? Math.ceil((moment + 900) / 0.8) : 0);

  const o = layer(`anime anime-${m.kind}`, duration);
  o.style.setProperty("--dur", `${duration}ms`);
  m.ink.forEach((c, i) => o.style.setProperty(`--ink${i}`, c));
  const title = line(o, "jj-title");
  // the kamehameha spells itself out in time with the shout, everything else slams in at once
  if (m.kind !== "kame" || reduce) {
    const landed = stamp(title, m.jp, TITLE);
    const next = stamp(line(o, "jj-en"), m.en, LINE, landed * 0.5);
    if (m.sub) stamp(line(o, "jj-sub"), m.sub, SUB, next * 0.85);
  }
  text(o, "anime-who", m.who);
  if (reduce) return m.en;

  if (m.jojo) menace(o);
  if (m.kind === "time" || m.kind === "crash") focusLines(o);
  if (m.kind === "time") timeStop(m, o, hold);
  if (m.kind === "heaven") heaven(o, duration);
  if (m.kind === "crash") roller(m.hit ?? 2250);
  if (m.kind === "golden") golden(o, duration);
  if (m.kind === "kame") kame(m, o, title, duration, hit);
  if (m.kind === "time" || m.kind === "crash") after(m.hit ?? 0, impactFrame);
  if (m.kind === "time" || m.kind === "crash" || m.kind === "heaven") after(m.hit ?? 0, () => shake(m.power, 750));
  return m.en;
}
