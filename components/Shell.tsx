"use client";

import Lenis from "lenis";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { profile } from "@/content/profile";
import { copy, scrollToId, toggleCrt } from "./bus";
import { preloadClips, unleash } from "./anime";
import { Jp } from "./Jp";
import { Scramble } from "./Scramble";

const NAV = ["about", "work", "stack", "play", "contact"];

export function Header() {
  return (
    <header className="sl-bottom sticky top-0 z-50 bg-bg/80 backdrop-blur-md">
      <div className="col flex h-12 items-center justify-between px-5 sm:px-6">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-serif text-[21px] italic leading-none text-fg">
            Rahul<span className="caret" aria-hidden />
          </span>
          <Jp en="rahul" className="tip-down text-[11px] text-sakura">
            ラフル
          </Jp>
        </a>
        <nav className="label hidden items-center gap-5 md:flex" aria-label="Sections">
          {NAV.map((id) => (
            <a key={id} href={`#${id}`} className="lnk" data-scramble-host>
              <Scramble text={id} hover />
            </a>
          ))}
        </nav>
        <PaletteHint />
      </div>
    </header>
  );
}

export function Clock() {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
    let offset = 0;
    let fast = 0;
    const tick = () => setTime(fmt.format(new Date(Date.now() + offset)));
    tick();
    const id = window.setInterval(tick, 10_000);
    // made in heaven: time accelerates
    const onAccelerate = (e: Event) => {
      clearInterval(fast);
      if ((e as CustomEvent<boolean>).detail) {
        fast = window.setInterval(() => {
          offset += 7 * 60_000;
          tick();
        }, 40);
      } else {
        offset = 0;
        tick();
      }
    };
    window.addEventListener("svc:accelerate", onAccelerate);
    return () => {
      clearInterval(id);
      clearInterval(fast);
      window.removeEventListener("svc:accelerate", onAccelerate);
    };
  }, []);
  return <span className="tabular-nums">{time}</span>;
}

export function CrtToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(document.documentElement.classList.contains("crt"));
    const sync = (e: Event) => flushSync(() => setOn((e as CustomEvent<boolean>).detail));
    window.addEventListener("svc:crt", sync);
    return () => window.removeEventListener("svc:crt", sync);
  }, []);
  return (
    <button type="button" className="lnk" onClick={(e) => toggleCrt(e.clientX, e.clientY)}>
      crt <span className={on ? "text-accent" : ""}>{on ? "on" : "off"}</span>
    </button>
  );
}

export function PaletteHint() {
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  return (
    <button
      type="button"
      className="label rounded-md border border-line px-2 py-0.5 transition-colors hover:text-fg"
      onClick={() => window.dispatchEvent(new Event("svc:palette"))}
    >
      {mac ? "⌘" : "ctrl"} k
    </button>
  );
}

type Command = { k: string; hint: string; run: () => void; hidden?: boolean };

export function CommandPalette({ anime }: { anime: boolean }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [note, setNote] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      { k: "about", hint: "who i am", run: () => scrollToId("about") },
      { k: "connect", hint: "all my links", run: () => scrollToId("connect") },
      { k: "work", hint: "what i've built", run: () => scrollToId("work") },
      { k: "stack", hint: "what i use", run: () => scrollToId("stack") },
      { k: "badminton", hint: "take a point off me", run: () => scrollToId("play") },
      { k: "contact", hint: "say hi", run: () => scrollToId("contact") },
      { k: "resume", hint: "open resume.pdf", run: () => window.open(profile.resume, "_blank") },
      { k: "email", hint: "copy email", run: () => copy(profile.email) },
      { k: "book", hint: "book a call", run: () => window.open(profile.cal, "_blank") },
      ...profile.links.map((l) => ({ k: l.label, hint: l.href.replace("https://", ""), run: () => window.open(l.href, "_blank") })),
      ...(anime ? [{ k: "power up", hint: "a random anime moment, sound on", run: () => void unleash() }] : []),
      { k: "crt", hint: "toggle crt mode", run: () => toggleCrt() },
      { k: "api", hint: "copy a curl for my api", run: () => copy(`curl ${profile.site}/api/hello`) },
      {
        k: "sudo hire rahul",
        hint: "permission granted",
        hidden: true,
        run: () => {
          window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("We'd like to hire you")}`;
        },
      },
    ],
    [anime],
  );

  const term = q.trim().toLowerCase();
  const list = commands.filter((c) =>
    c.hidden ? term.length > 1 && c.k.startsWith(term) : !term || c.k.includes(term) || c.hint.includes(term),
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest?.("input, textarea");
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    let timer = 0;
    const onToast = (e: Event) => {
      setNote((e as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = window.setTimeout(() => setNote(""), 2200);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("svc:palette", onOpen);
    window.addEventListener("svc:toast", onToast);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("svc:palette", onOpen);
      window.removeEventListener("svc:toast", onToast);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      window.__lenis?.stop();
      requestAnimationFrame(() => input.current?.focus());
    } else {
      window.__lenis?.start();
    }
  }, [open]);

  const exec = (c: Command) => {
    void preloadClips();
    setOpen(false);
    window.setTimeout(c.run, 60);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/55 px-4 pt-[18vh] backdrop-blur-[3px]"
          onMouseDown={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Command menu"
            className="palette w-full max-w-[460px] overflow-hidden rounded-xl border border-line bg-bg text-[14px]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 items-center gap-3 border-b border-line px-4">
              <span className="text-accent">›</span>
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, list.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  } else if (e.key === "Enter" && list[active]) {
                    exec(list[active]);
                  }
                }}
                placeholder="type a command"
                aria-label="Command"
                className="flex-1 bg-transparent text-fg outline-none placeholder:text-dim"
              />
            </div>
            <ul className="max-h-[46vh] overflow-auto py-1.5" data-lenis-prevent>
              {list.map((c, i) => (
                <li key={c.k}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => exec(c)}
                    className={`flex w-full items-center justify-between gap-4 px-4 py-2 text-left ${
                      i === active ? "bg-fg/[0.05] text-fg" : "text-muted"
                    }`}
                  >
                    <span>
                      <span className="inline-block w-4 text-accent">{i === active ? "›" : ""}</span>
                      {c.k}
                    </span>
                    <span className="label truncate text-dim">{c.hint}</span>
                  </button>
                </li>
              ))}
              {!list.length && <li className="px-4 py-2 text-dim">command not found: {q}</li>}
            </ul>
          </div>
        </div>
      )}
      <div
        aria-live="polite"
        className={`label fixed bottom-6 left-1/2 z-[85] -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-bg px-3 py-1.5 text-fg transition-all duration-300 ${
          note ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {note}
      </div>
    </>
  );
}

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

// Smooth scroll, reveals, section spy and the small easter eggs.
export function Motion() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | undefined;
    let raf = 0;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.1 });
      window.__lenis = lenis;
      const loop = (t: number) => {
        lenis!.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    const onClick = (e: MouseEvent) => {
      const id = (e.target as Element | null)?.closest?.('a[href^="#"]')?.getAttribute("href")?.slice(1);
      if (!id) return;
      e.preventDefault();
      scrollToId(id);
    };
    document.addEventListener("click", onClick);

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => reveal.observe(el));

    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.classList.toggle("on", entry.isIntersecting);
      },
      { rootMargin: "-30% 0px -55% 0px" },
    );
    document.querySelectorAll("[data-spy]").forEach((el) => spy.observe(el));

    // konami code stops time
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      pos = e.key === KONAMI[pos] ? pos + 1 : e.key === "ArrowUp" ? (pos === 2 ? 2 : 1) : 0;
      if (pos < KONAMI.length) return;
      pos = 0;
      void unleash("time");
    };
    window.addEventListener("keydown", onKey);

    const title = document.title;
    const onVisibility = () => {
      document.title = document.hidden ? "やれやれだぜ · come back" : title;
    };
    document.addEventListener("visibilitychange", onVisibility);

    console.log(
      "%c rahul %c backend engineer\n\nyou opened devtools, so you're my kind of person.\ntry: curl " +
        profile.site +
        "/api/hello\nor press ctrl/⌘ k and type 'sudo'.",
      "background:#e5484d;color:#0a0a0a;padding:2px 6px;font-weight:bold",
      "color:#8c8c8c",
    );

    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      window.__lenis = undefined;
      document.removeEventListener("click", onClick);
      reveal.disconnect();
      spy.disconnect();
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      document.title = title;
    };
  }, []);

  return null;
}
