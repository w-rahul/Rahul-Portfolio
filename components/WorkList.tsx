"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Item = { title: string; tag: string; line: string; preview: string[] };

// "$ cmd", "> step", "ok done" get their own colors, like a real terminal
const Line = ({ text }: { text: string }) => {
  const m = /^(\$|>|ok)(\s.*)$/.exec(text);
  if (!m) return <>{text}</>;
  const cls = m[1] === "$" ? "t-cmd" : m[1] === ">" ? "t-step" : "t-ok";
  return (
    <>
      <b className={cls}>{m[1]}</b>
      {m[2]}
    </>
  );
};

// Big rows. Hovering one dims the rest and a little terminal follows the cursor, typing out what it does.
export function WorkList({ items }: { items: Item[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = pos.current;
      p.x += (p.tx - p.x) * 0.16;
      p.y += (p.ty - p.y) * 0.16;
      if (card.current) card.current.style.transform = `translate3d(${p.x + 28}px, ${p.y - 40}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    if (active !== null) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const onMove = (e: React.PointerEvent) => {
    pos.current.tx = e.clientX;
    pos.current.ty = e.clientY;
    if (active === null) {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    }
  };

  return (
    <div className="worklist" data-hovering={active !== null} onPointerMove={onMove} onPointerLeave={() => setActive(null)}>
      {items.map((w, i) => (
        <div key={w.title} className="wrow" data-on={active === i} onPointerEnter={() => setActive(i)}>
          <span className="label wrow-i">{String(i + 1).padStart(2, "0")}</span>
          <div className="min-w-0">
            <h3 className="wrow-title">{w.title}</h3>
            <p className="wrow-line">{w.line}</p>
            <pre className="term mt-4 md:hidden">
              {w.preview.map((line, k) => (
                <span key={k}>
                  <Line text={line} />
                  {"\n"}
                </span>
              ))}
            </pre>
          </div>
          <span className="label wrow-tag">{w.tag}</span>
        </div>
      ))}
      {/* portaled so a transformed ancestor (the anime shake) can't change what "fixed" means */}
      {mounted &&
        createPortal(
          <div ref={card} className="wcard" data-on={active !== null} aria-hidden>
            <div className="term-bar">
              <span />
              <span />
              <span />
              <em>{active !== null ? items[active].title : ""}</em>
            </div>
            {active !== null && (
              <pre key={active} className="term">
                {items[active].preview.map((line, k) => (
                  <span key={k} style={{ animationDelay: `${k * 110}ms` }}>
                    <Line text={line} />
                    {"\n"}
                  </span>
                ))}
              </pre>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
