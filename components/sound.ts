// Tiny Web Audio helpers: synthesized tones and noise, plus a cached sample player for the few real recordings.

let audio: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;
const samples = new Map<string, Promise<AudioBuffer | null>>();

// call from a pointer or key handler so the browser lets sound play
export function primeAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audio) {
      audio = new AC();
      // loud enough to feel, with a compressor so stacked hits don't clip
      const comp = audio.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.knee.value = 18;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.2;
      out = audio.createGain();
      out.gain.value = 0.8;
      out.connect(comp).connect(audio.destination);
    }
    if (audio.state === "suspended") void audio.resume();
  } catch {
    audio = null;
  }
}

// never queue sounds on a suspended context, they'd fire late
export const audioTime = () => (audio && audio.state === "running" ? audio.currentTime : null);

export const tone = (t: number, f0: number, f1: number, dur: number, gain: number, type: OscillatorType = "sine") => {
  if (!audio || !out) return;
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  // a few ms of attack so nothing clicks on the way in
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.006, dur * 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.02);
};

// one second of noise, reused from a random offset so rapid-fire sounds stay cheap
const noiseBuffer = () => {
  if (!audio) return null;
  if (!noise) {
    noise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
};

export const hiss = (t: number, dur: number, gain: number, freq: number, q = 0.8, rise = false, type: BiquadFilterType = "bandpass") => {
  const buf = noiseBuffer();
  if (!audio || !out || !buf) return;
  const src = audio.createBufferSource();
  src.buffer = buf;
  const filter = audio.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, t);
  if (rise) g.gain.exponentialRampToValueAtTime(gain, t + dur);
  else {
    g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.005, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }
  src.connect(filter).connect(g).connect(out);
  src.start(t, Math.random() * Math.max(0, 1 - dur));
  src.stop(t + dur);
};

// a sword cut through the air
export const swish = (gain = 0.25) => {
  const t = audioTime();
  if (t !== null) hiss(t, 0.16, gain, 2600, 0.9, true);
};

// fetch + decode once, then reuse. resolves to null if the file isn't there
export const loadSample = (url: string) => {
  if (!audio) return Promise.resolve(null);
  let p = samples.get(url);
  if (!p) {
    const ctx = audio;
    p = fetch(url)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then((data) => ctx.decodeAudioData(data))
      .catch(() => {
        // forget the failure so the next call tries again
        samples.delete(url);
        return null;
      });
    samples.set(url, p);
  }
  return p;
};

// lowpass (Hz) muffles it, like a bang coming out of a pipe or bouncing off a far wall
type PlayOpts = { gain?: number; rate?: number; offset?: number; duration?: number; when?: number; lowpass?: number };

export const playSample = (buf: AudioBuffer, { gain = 1, rate = 1, offset = 0, duration, when, lowpass }: PlayOpts = {}) => {
  if (!audio || !out) return null;
  const t = when ?? audio.currentTime;
  const src = audio.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = rate;
  const g = audio.createGain();
  g.gain.value = gain;
  if (lowpass) {
    const f = audio.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = lowpass;
    src.connect(f).connect(g);
  } else src.connect(g);
  g.connect(out);
  const len = duration ?? buf.duration - offset;
  src.start(t, offset, len);
  // fade the tail so a trimmed clip doesn't end on a click
  g.gain.setValueAtTime(gain, t + Math.max(0, len / rate - 0.15));
  g.gain.linearRampToValueAtTime(0.0001, t + len / rate);
  return src;
};

// mahoraga's wheel turning: a heavy thud, a click, and a ringing metal body
export const clank = (gain = 1) => {
  const t = audioTime();
  if (t === null) return;
  tone(t, 70, 40, 0.5, 0.6 * gain);
  hiss(t, 0.05, 0.35 * gain, 3000, 1.5);
  tone(t + 0.01, 520, 500, 1.4, 0.07 * gain, "triangle");
  tone(t + 0.01, 1240, 1200, 1.1, 0.045 * gain, "triangle");
  tone(t + 0.01, 1980, 1950, 0.8, 0.03 * gain);
};
