import { useWSStore } from "../store/wsStore";

export function WSBadge() {
  const status = useWSStore((s) => s.status);

  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        En tiempo real
      </span>
    );
  }
  if (status === "connecting" || status === "reconnecting") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
        <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
        Reconectando…
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-500">
      <span className="h-2 w-2 rounded-full bg-neutral-400" />
      Sin conexión en tiempo real
    </span>
  );
}
