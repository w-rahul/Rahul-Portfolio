// Japanese text that shows its English meaning on hover or focus.
export function Jp({ children, en, className = "", vertical = false }: { children: string; en: string; className?: string; vertical?: boolean }) {
  return (
    <span lang="ja" tabIndex={0} data-en={en} className={`jp tip ${vertical ? "tip-v" : ""} ${className}`}>
      {children}
      <span className="sr-only"> ({en})</span>
    </span>
  );
}
