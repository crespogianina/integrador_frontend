export type StockLevel = "critical" | "low" | "ok";
export type StockLevelFilter = StockLevel | "all";

const STOCK_STYLES: Record<StockLevel, string> = {
  critical: "bg-red-100 text-red-700",
  low: "bg-yellow-100 text-yellow-800",
  ok: "bg-green-100 text-green-700",
};

const STOCK_STYLES_ACTIVE: Record<StockLevel, string> = {
  critical: "bg-red-600 text-white ring-2 ring-red-300",
  low: "bg-yellow-500 text-white ring-2 ring-yellow-300",
  ok: "bg-green-600 text-white ring-2 ring-green-300",
};

export const STOCK_LEVEL_OPTIONS: {
  id: StockLevel;
  label: string;
  description: string;
}[] = [
  { id: "critical", label: "Crítico", description: "menos de 5" },
  { id: "low", label: "Bajo", description: "5 a 14" },
  { id: "ok", label: "OK", description: "15 o más" },
];

const STOCK_LABELS: Record<StockLevel, string> = {
  critical: "Crítico",
  low: "Bajo",
  ok: "OK",
};

export function getStockLevel(stock: number): StockLevel {
  if (stock < 5) return "critical";
  if (stock < 15) return "low";
  return "ok";
}

export function matchesStockLevel(
  stock: number,
  filter: StockLevelFilter,
): boolean {
  if (filter === "all") return true;
  return getStockLevel(stock) === filter;
}

export function stockLevelStyle(
  level: StockLevel,
  active: boolean,
): string {
  return active ? STOCK_STYLES_ACTIVE[level] : STOCK_STYLES[level];
}

type StockBadgeProps = {
  stock: number;
};

export default function StockBadge({ stock }: StockBadgeProps) {
  const level = getStockLevel(stock);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STOCK_STYLES[level]}`}
    >
      <span>{stock}</span>
      <span className="font-medium opacity-80">· {STOCK_LABELS[level]}</span>
    </span>
  );
}
