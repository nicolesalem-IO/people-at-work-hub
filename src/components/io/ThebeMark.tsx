// Thebe IO mark: a small, slightly irregular moon (Thebe is one of Jupiter's inner moons) on a tilted orbit.
export function ThebeMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="16" cy="16" rx="14.5" ry="6" transform="rotate(-24 16 16)" fill="none" stroke="var(--brand-pink)" strokeWidth="2.2" />
      <path d="M16.6 7.6c4.5.3 7.6 3.9 7.3 8.6-.3 4.6-3.9 8-8.3 7.8-4.6-.2-7.9-3.9-7.6-8.5.3-4.7 4.1-8.2 8.6-7.9z" fill="var(--brand-yellow)" stroke="var(--ink)" strokeWidth="1.6" />
      <circle cx="13.4" cy="13.6" r="1.6" fill="var(--ink)" opacity=".85" />
      <circle cx="18.6" cy="18.8" r="1.1" fill="var(--ink)" opacity=".85" />
      <path d="M3.9 21.4c3.5 1.9 10.3 1 17.3-2.2" fill="none" stroke="var(--brand-pink)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
