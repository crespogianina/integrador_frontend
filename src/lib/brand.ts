/** Colores de marca Food Store — usar en flujo CLIENT */

const burgerPatternSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#B8956A" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8.5c0-2 3.13-3.5 7-3.5s7 1.5 7 3.5"/><path d="M4 11h16"/><path d="M4 14h16"/><path d="M5 17.5c0 2 3.13 3.5 7 3.5s7-1.5 7-3.5"/><circle cx="9" cy="8" r="0.75" fill="#B8956A" stroke="none"/><circle cx="12" cy="7.5" r="0.75" fill="#B8956A" stroke="none"/><circle cx="15" cy="8" r="0.75" fill="#B8956A" stroke="none"/></svg>`;

export const brand = {
  solid: "bg-amber-600 text-white hover:bg-amber-700",
  soft: "bg-amber-100 text-amber-800",
  softHover: "hover:bg-amber-200",
  navActive: "bg-amber-100 text-amber-800",
  inputFocus:
    "focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100",
  inputFocusSm: "focus:border-amber-400 focus:ring-2 focus:ring-amber-100",
  accent: "accent-amber-600",
  selectedOption: "border-amber-500 bg-amber-50",
  paginationActive: "bg-amber-600 text-white",
  spinner: "border-t-amber-600",
  timelineCurrent:
    "animate-pulse bg-amber-600 text-white ring-4 ring-amber-100",
  timelineCurrentText: "text-amber-700",
  pageBg:
    "bg-gradient-to-b from-[#FAF6F0] via-[#F2E8DC] to-[#E9DDD0]",
  catalogPattern: `url("data:image/svg+xml,${encodeURIComponent(burgerPatternSvg)}")`,
} as const;
