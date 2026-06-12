import { useState } from "react";
import type { CategoriaTreeRead } from "../models/Categoria";

type Props = {
  categorias: CategoriaTreeRead[];
  selectedIds: number[];
  categoriaPrincipal: number | null;
  onToggle: (id: number, checked: boolean) => void;
  onMarcarPrincipal: (id: number) => void;
};

function Chevron({ abierto }: { abierto: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
        abierto ? "rotate-90" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function NodoCategoria({
  categoria,
  selectedIds,
  categoriaPrincipal,
  onToggle,
  onMarcarPrincipal,
}: {
  categoria: CategoriaTreeRead;
} & Omit<Props, "categorias">) {
  const [abierto, setAbierto] = useState(true);

  const hijos = categoria.hijos ?? [];
  const tieneHijos = hijos.length > 0;

  const selected = selectedIds.includes(categoria.id);
  const esPrincipal = categoriaPrincipal === categoria.id;

  return (
    <div>
      <div
        className={`group flex items-center gap-2 rounded-lg px-2 py-1 transition-colors ${
          selected ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-100"
        }`}
      >
        {tieneHijos ? (
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-200"
          >
            <Chevron abierto={abierto} />
          </button>
        ) : (
          <span className="h-7 w-7 shrink-0" />
        )}

        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onToggle(categoria.id, e.target.checked)}
          className="h-4 w-4"
        />

        <span
          className={`flex-1 truncate text-sm ${
            selected ? "font-semibold text-blue-700" : "text-slate-700"
          }`}
        >
          {categoria.nombre}
        </span>

        {tieneHijos && (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-500">
            {hijos.length}
          </span>
        )}

        {selected && (
          <button
            type="button"
            onClick={() => onMarcarPrincipal(categoria.id)}
            className={`rounded-full px-2 py-1 text-xs font-semibold transition ${
              esPrincipal
                ? "bg-amber-500 text-white"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            {esPrincipal ? "⭐ Principal" : "Marcar principal"}
          </button>
        )}
      </div>

      {tieneHijos && abierto && (
        <div className="ml-[13px] border-l border-slate-200 pl-2">
          {hijos.map((hijo) => (
            <NodoCategoria
              key={hijo.id}
              categoria={hijo}
              selectedIds={selectedIds}
              categoriaPrincipal={categoriaPrincipal}
              onToggle={onToggle}
              onMarcarPrincipal={onMarcarPrincipal}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductoCategoriaFormulario({
  categorias,
  selectedIds,
  categoriaPrincipal,
  onToggle,
  onMarcarPrincipal,
}: Props) {
  return (
    <div className="space-y-1">
      {categorias.map((categoria) => (
        <NodoCategoria
          key={categoria.id}
          categoria={categoria}
          selectedIds={selectedIds}
          categoriaPrincipal={categoriaPrincipal}
          onToggle={onToggle}
          onMarcarPrincipal={onMarcarPrincipal}
        />
      ))}
    </div>
  );
}
