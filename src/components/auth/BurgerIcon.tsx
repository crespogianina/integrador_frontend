export default function BurgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 8.5c0-2 3.13-3.5 7-3.5s7 1.5 7 3.5" />
      <path d="M4 11h16" />
      <path d="M4 14h16" />
      <path d="M5 17.5c0 2 3.13 3.5 7 3.5s7-1.5 7-3.5" />
      <circle cx="9" cy="8" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="15" cy="8" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}
