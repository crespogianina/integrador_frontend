import type { CategoriaTreeRead } from "../models/Categoria";

type Props = {
  categorias: CategoriaTreeRead[];
  selectedIds: number[];
  categoriaPrincipal: string;
  onToggle: (id: number, checked: boolean) => void;
  onMarcarPrincipal: (id: number) => void;
  depth?: number;
};

function NodoCategoriaArbol({
  categoria,
  selectedIds,
  categoriaPrincipal,
  onToggle,
  onMarcarPrincipal,
  depth = 0,
}: {
  categoria: CategoriaTreeRead;
} & Omit<Props, "categorias">) {
  const selected = selectedIds.includes(categoria.id);
  const esPrincipal = categoriaPrincipal === String(categoria.id);
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
          onClick={() => onToggle(categoria.id, !selected)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700"
        >
          <span
            className={`h-4 w-4 flex-shrink-0 rounded border ${
              selected
                ? "border-blue-600 bg-blue-600"
                : "border-slate-300 bg-white"
            }`}
          />
          <span>{categoria.nombre}</span>
          {tieneHijos && (
            <span className="ml-1 text-xs font-normal text-slate-400">
              ({categoria.hijos && categoria.hijos.length})
            </span>
          )}
        </button>

        {selected && (
          <button
            type="button"
            onClick={() => onMarcarPrincipal(categoria.id)}
            className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold ${
              esPrincipal
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            {esPrincipal ? "Quitar principal" : "Marcar principal"}
          </button>
        )}
      </div>

      {tieneHijos && (
        <div className="mt-2 space-y-2">
          {categoria.hijos &&
            categoria.hijos.map((hijo) => (
              <NodoCategoriaArbol
                key={hijo.id}
                categoria={hijo}
                selectedIds={selectedIds}
                categoriaPrincipal={categoriaPrincipal}
                onToggle={onToggle}
                onMarcarPrincipal={onMarcarPrincipal}
                depth={depth + 1}
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
    <div className="mt-4 space-y-3">
      {categorias.map((categoria) => (
        <NodoCategoriaArbol
          key={categoria.id}
          categoria={categoria}
          selectedIds={selectedIds}
          categoriaPrincipal={categoriaPrincipal}
          onToggle={onToggle}
          onMarcarPrincipal={onMarcarPrincipal}
          depth={0}
        />
      ))}
    </div>
  );
}
