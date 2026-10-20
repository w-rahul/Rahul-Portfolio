"use client";

import { useEffect, useRef, useState } from "react";

// the files live in /public/music, git-ignored so they stay on this machine. the layout passes the ones on disk
const TRACKS = [
  { id: "addiction", title: "addiction", by: "TheGoldenYami · slowed + reverb" },
  { id: "worry", title: "worry", by: "LONOWN, riserayss · ultra slowed" },
];
const VOLUME = 0.45;

// A tiny jukebox in the corner. Off until you turn it on, ducks under the anime clips.
export function Jukebox({ songs }: { songs: string[] }) {
  const tracks = TRACKS.filter((t) => songs.includes(t.id));
  const audio = useRef<HTMLAudioElement | null>(null);
  const [on, setOn] = useState(false);
  const [track, setTrack] = useState(0);
  const [missing, setMissing] = useState(false);
  const t = tracks.length ? tracks[track % tracks.length] : null;

  useEffect(() => {
    const a = new Audio();
    a.preload = "none";
    a.volume = VOLUME;
    audio.current = a;
    const next = () => setTrack((x) => x + 1);
    const fail = () => {
      if (!a.getAttribute("src")) return;
      setMissing(true);
      setOn(false);
    };
    let timer = 0;
    const duck = (e: Event) => {
      a.volume = VOLUME * 0.25;
      clearTimeout(timer);
      timer = window.setTimeout(() => (a.volume = VOLUME), (e as CustomEvent<number>).detail);
    };
    a.addEventListener("ended", next);
    a.addEventListener("error", fail);
    window.addEventListener("svc:duck", duck);
    return () => {
      a.pause();
      clearTimeout(timer);
      a.removeEventListener("ended", next);
      a.removeEventListener("error", fail);
      window.removeEventListener("svc:duck", duck);
    };
  }, []);

  const src = t ? `/music/${t.id}.mp3` : "";
  useEffect(() => {
    const a = audio.current;
    if (!a || !src) return;
    if (a.getAttribute("src") !== src) a.src = src;
    if (on)
      void a.play().catch((e: unknown) => {
        // skipping tracks fast aborts the previous play(), that's fine
        if ((e as DOMException | null)?.name !== "AbortError") setOn(false);
      });
    else a.pause();
    // track is a dep so a lone song starts over when it ends: same src, and play() restarts it
  }, [on, src, track]);

  if (missing || !t) return null;
  return (
    <div className={`jukebox ${on ? "is-on" : ""}`}>
      <button type="button" className="jb-btn" onClick={() => setOn((v) => !v)} aria-label={on ? "Pause music" : "Play music"}>
        {on ? (
          <span className="eq" aria-hidden>
            <i />
            <i />
            <i />
          </span>
        ) : (
          <span aria-hidden>♪</span>
        )}
      </button>
      {on && (
        <>
          <span className="jb-title">
            <span className="jb-scroll">
              {t.title} <em>{t.by}</em>
            </span>
          </span>
          {tracks.length > 1 && (
            <button type="button" className="jb-btn" onClick={() => setTrack((x) => x + 1)} aria-label="Next track">
              <span aria-hidden>»</span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
