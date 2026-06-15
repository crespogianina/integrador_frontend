import { useEffect, useState } from "react";
import type { IngredienteResumen, ProductoRead } from "../models/Producto";
import { brand } from "../lib/brand";

type AgregarCarritoModalProps = {
  producto: ProductoRead | null;
  onClose: () => void;
  onConfirm: (
    producto: ProductoRead,
    removidos: IngredienteResumen[],
  ) => void;
};

function AlergenoInline() {
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
      title="Alérgeno"
    >
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
      Alérgeno
    </span>
  );
}

export default function AgregarCarritoModal({
  producto,
  onClose,
  onConfirm,
}: AgregarCarritoModalProps) {
  const [sinIngredientes, setSinIngredientes] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    setSinIngredientes(new Set());
  }, [producto?.id]);

  if (!producto) return null;

  const ingredientes = producto.ingredientes ?? [];
  const tieneAlergenos = ingredientes.some((i) => i.es_alergeno);
  const removibles = ingredientes.filter((i) => i.es_removible);

  const toggleRemovible = (id: number) => {
    setSinIngredientes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmar = () => {
    const removidos = ingredientes.filter((i) => sinIngredientes.has(i.id));
    onConfirm(producto, removidos);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-800">
          {producto.nombre}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          ${producto.precio_base.toFixed(2)}
        </p>

        {tieneAlergenos && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Este producto contiene ingredientes alérgenos. Revisá la lista antes
            de agregarlo al carrito.
          </p>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-700">Ingredientes</h3>

          {ingredientes.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Sin ingredientes cargados.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {ingredientes.map((ing) => (
                <li
                  key={ing.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-800">
                      {ing.nombre}
                    </span>
                    {ing.es_alergeno && <AlergenoInline />}
                    {ing.es_removible && (
                      <span className="text-xs text-slate-400">(opcional)</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {removibles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Personalizar
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Marcá los ingredientes que querés quitar.
            </p>
            <ul className="mt-2 space-y-2">
              {removibles.map((ing) => (
                <li key={ing.id}>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={sinIngredientes.has(ing.id)}
                      onChange={() => toggleRemovible(ing.id)}
                      className={brand.accent}
                    />
                    <span className="text-slate-700">Sin {ing.nombre}</span>
                    {ing.es_alergeno && <AlergenoInline />}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${brand.solid}`}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}
