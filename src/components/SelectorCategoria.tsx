import type { CategoriaTreeRead } from "../models/Categoria";

type Props = {
  categorias: CategoriaTreeRead[];
  selectedId: number | null;
  excludeId?: number;
  onSelect: (id: number | null) => void;
};

export function NodoSelector({
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
  if (categoria.id === excludeId) return null;

  const selected = selectedId === categoria.id;
  const tieneHijos = categoria.hijos && categoria.hijos.length > 0;

  return (
    <div className={depth > 0 ? "ml-5 border-l border-slate-200 pl-4" : ""}>
      <div
        className={`rounded-xl border p-3 transition ${
          selected
            ? "border-blue-300 bg-blue-50"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <button
          type="button"
          onClick={() => onSelect(selected ? null : categoria.id)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700"
        >
          <span
            className={`h-4 w-4 flex-shrink-0 rounded-full border ${
              selected
                ? "border-blue-600 bg-blue-600"
                : "border-slate-300 bg-white"
            }`}
          />
          <span>{categoria.nombre}</span>
          {tieneHijos && (
            <span className="ml-1 text-xs font-normal text-slate-400">
              ({categoria.hijos.length})
            </span>
          )}
        </button>
      </div>

      {tieneHijos && (
        <div className="mt-2 space-y-2">
          {categoria.hijos.map((hijo) => (
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
    <div className="space-y-3">
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
