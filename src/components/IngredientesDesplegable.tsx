import { useState } from "react";
import type { ProductoRead } from "../models/Producto";

type IngredientesDesplegableProps = {
  producto: ProductoRead;
};

export default function IngredientesDesplegable({
  producto,
}: IngredientesDesplegableProps) {
  const [abierto, setAbierto] = useState(false);
  const ingredientes = producto.ingredientes ?? [];

  if (ingredientes.length === 0) {
    return (
      <p className="text-xs text-slate-400">Sin ingredientes informados.</p>
    );
  }

  const tieneAlergenos = ingredientes.some((i) => i.es_alergeno);

  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierto((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-slate-700 hover:text-slate-900"
        aria-expanded={abierto}
      >
        <span className="flex flex-wrap items-center gap-2">
          Ingredientes
          {tieneAlergenos && !abierto && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              Contiene alérgenos
            </span>
          )}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${
            abierto ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {abierto && (
        <div className="mt-2 space-y-2 border-t border-slate-100 pt-2">
          <div className="flex flex-wrap gap-1">
            {ingredientes.map((ing) => (
              <span
                key={ing.id}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                  ing.es_alergeno
                    ? "bg-amber-100 font-medium text-amber-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {ing.nombre}
                {ing.es_alergeno && (
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                )}
              </span>
            ))}
          </div>
          {tieneAlergenos && (
            <p className="text-[10px] text-amber-700">Contiene alérgenos</p>
          )}
        </div>
      )}
    </div>
  );
}
