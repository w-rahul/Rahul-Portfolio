import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

type ViewTransitionDoc = { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("svc:toast", { detail: message }));
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -48 });
  else el.scrollIntoView({ behavior: "smooth" });
}

export function copy(text: string) {
  navigator.clipboard
    ?.writeText(text)
    .then(() => toast(`copied · ${text}`))
    .catch(() => toast(text));
}

export function toggleCrt(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  const root = document.documentElement;
  const apply = () => {
    const on = root.classList.toggle("crt");
    try {
      localStorage.setItem("crt", on ? "1" : "0");
    } catch {}
    window.dispatchEvent(new CustomEvent("svc:crt", { detail: on }));
  };
  const start = (document as unknown as ViewTransitionDoc).startViewTransition;
  if (!start || matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  start
    .call(document, apply)
    .ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 700, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}
