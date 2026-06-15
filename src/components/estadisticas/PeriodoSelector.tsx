import {
  formatearRango,
  PERIODO_BOTONES,
  PERIODO_ETIQUETAS,
  type FiltrosEstadisticas,
  type PeriodoPreset,
} from "../../models/Estadisticas";

type Props = {
  filtros: FiltrosEstadisticas;
  onSelectPreset: (preset: PeriodoPreset) => void;
  onChangeFecha: (campo: "desde" | "hasta", valor: string) => void;
  onLimpiar: () => void;
};

export function PeriodoSelector({
  filtros,
  onSelectPreset,
  onChangeFecha,
  onLimpiar,
}: Props) {
  const mostrarRango = filtros.periodo === "rango";

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Período de análisis
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {PERIODO_ETIQUETAS[filtros.periodo]} ·{" "}
            {formatearRango(filtros.desde, filtros.hasta)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIODO_BOTONES.map((boton) => {
            const activo = filtros.periodo === boton.value;
            return (
              <button
                key={boton.value}
                type="button"
                onClick={() => onSelectPreset(boton.value)}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                  activo
                    ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100"
                    : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {boton.label}
              </button>
            );
          })}
        </div>
      </div>

      {mostrarRango && (
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
          <label className="text-sm text-slate-600">
            Desde
            <input
              type="date"
              value={filtros.desde}
              max={filtros.hasta}
              onChange={(e) => onChangeFecha("desde", e.target.value)}
              className="mt-1 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <label className="text-sm text-slate-600">
            Hasta
            <input
              type="date"
              value={filtros.hasta}
              min={filtros.desde}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => onChangeFecha("hasta", e.target.value)}
              className="mt-1 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </label>
          <button
            type="button"
            onClick={onLimpiar}
            className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
}
