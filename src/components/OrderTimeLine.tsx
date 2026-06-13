import {
  ESTADO_LABEL,
  ESTADOS_FLUJO,
  type EstadoPedido,
  type HistorialEstadoRead,
} from "../models/Pedido";

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function OrderTimeline({
  estadoActual,
  historial,
  mostrarAuditoria = false,
}: {
  estadoActual: EstadoPedido;
  historial: HistorialEstadoRead[];
  mostrarAuditoria?: boolean;
}) {
  if (estadoActual === "CANCELADO") {
    const cancelacion = historial.find((h) => h.estado_hacia === "CANCELADO");
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-800">Pedido cancelado</p>
        {cancelacion?.motivo && (
          <p className="mt-1 text-sm text-red-700">
            Motivo: {cancelacion.motivo}
          </p>
        )}
        {cancelacion && (
          <p className="mt-1 text-xs text-red-500">
            {fecha(cancelacion.created_at)}
          </p>
        )}
      </div>
    );
  }

  const idxActual = ESTADOS_FLUJO.indexOf(estadoActual);
  const fechaDe = (estado: EstadoPedido) =>
    historial.find((h) => h.estado_hacia === estado)?.created_at;

  return (
    <>
      <ol className="relative space-y-0">
        {ESTADOS_FLUJO.map((estado, i) => {
          const completado = i < idxActual;
          const actual = i === idxActual;
          const ts = fechaDe(estado);

          return (
            <li key={estado} className="relative flex gap-4 pb-8 last:pb-0">
              {i < ESTADOS_FLUJO.length - 1 && (
                <span
                  className={`absolute left-[11px] top-6 h-full w-0.5 ${completado ? "bg-emerald-500" : "bg-neutral-200"}`}
                />
              )}
              <span
                className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold
                ${completado ? "bg-emerald-500 text-white" : ""}
                ${actual ? "animate-pulse bg-blue-600 text-white ring-4 ring-blue-100" : ""}
                ${!completado && !actual ? "border-2 border-neutral-300 bg-white text-neutral-300" : ""}`}
              >
                {completado ? "✓" : i + 1}
              </span>
              <div>
                <p
                  className={`font-medium ${actual ? "text-blue-700" : completado ? "text-neutral-900" : "text-neutral-400"}`}
                >
                  {ESTADO_LABEL[estado]}
                </p>
                {ts && <p className="text-xs text-neutral-400">{fecha(ts)}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {mostrarAuditoria && historial.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Historial completo
          </h3>
          <ul className="space-y-2 text-xs text-slate-600">
            {[...historial].reverse().map((h) => (
              <li key={h.id} className="rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-medium">
                  {h.estado_desde ?? "—"} → {h.estado_hacia}
                </span>
                <span className="text-slate-400"> · {fecha(h.created_at)}</span>
                {h.motivo && (
                  <p className="mt-0.5 text-slate-500">{h.motivo}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
