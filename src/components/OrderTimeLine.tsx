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
}: {
  estadoActual: EstadoPedido;
  historial: HistorialEstadoRead[];
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
  );
}
