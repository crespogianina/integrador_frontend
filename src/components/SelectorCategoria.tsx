import { useState } from "react";
import type { CategoriaTreeRead } from "../models/Categoria";

type Props = {
  categorias: CategoriaTreeRead[];
  selectedId: number | null;
  excludeId?: number;
  onSelect: (id: number | null) => void;
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

function NodoSelector({
  categoria,
  selectedId,
  excludeId,
  onSelect,
  depth = 0,
}: {
  categoria: CategoriaTreeRead;
  selectedId: number | null;
  excludeId?: number;
  onSelect: (id: number | null) => void;
  depth?: number;
}) {
  const [abierto, setAbierto] = useState(true);

  if (categoria.id === excludeId) return null;

  const selected = selectedId === categoria.id;
  const hijos = categoria.hijos ?? [];
  const tieneHijos = hijos.length > 0;

  return (
    <div>
      <div
        className={`group flex items-center gap-1 rounded-lg pr-2 transition-colors ${
          selected
            ? "bg-blue-50 text-blue-700"
            : "text-slate-700 hover:bg-slate-100"
        }`}
      >
        {tieneHijos ? (
          <button
            type="button"
            onClick={() => setAbierto((a) => !a)}
            aria-label={abierto ? "Colapsar" : "Expandir"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-slate-200/70"
          >
            <Chevron abierto={abierto} />
          </button>
        ) : (
          <span className="h-7 w-7 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onSelect(selected ? null : categoria.id)}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-sm"
        >
          <span
            className={`truncate ${selected ? "font-semibold" : "font-medium"}`}
          >
            {categoria.nombre}
          </span>

          {tieneHijos && (
            <span className="rounded-full bg-slate-200/80 px-1.5 text-[11px] font-medium text-slate-500 group-hover:bg-slate-200">
              {hijos.length}
            </span>
          )}

          {selected && (
            <svg
              viewBox="0 0 16 16"
              className="ml-auto h-4 w-4 shrink-0 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 8.5l3.5 3.5L13 5" />
            </svg>
          )}
        </button>
      </div>

      {tieneHijos && abierto && (
        <div className="ml-[13px] border-l border-slate-200 pl-2">
          {hijos.map((hijo) => (
            <NodoSelector
              key={hijo.id}
              categoria={hijo}
              selectedId={selectedId}
              excludeId={excludeId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoriaSelectorArbol({
  categorias,
  selectedId,
  excludeId,
  onSelect,
}: Props) {
  return (
    <div className="space-y-0.5">
      {categorias.map((categoria) => (
        <NodoSelector
          key={categoria.id}
          categoria={categoria}
          selectedId={selectedId}
          excludeId={excludeId}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  );
}
