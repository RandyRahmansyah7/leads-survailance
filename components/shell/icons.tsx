export function EntityGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <circle cx="8" cy="8.6" r="2.3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M2.7 6a6.5 6.5 0 0 1 10.6 0"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M5 7.3a3.5 3.5 0 0 1 6 0"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M2.5 2.5h11v11h-11z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 8h11" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
