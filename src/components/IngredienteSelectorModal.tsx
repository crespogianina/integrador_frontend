import { useEffect, useState } from "react";
import { useIngredientes } from "../context/IngredienteContext";
import { useProductos } from "../context/ProductoContext";

type Props = {
  open: boolean;
  onClose: () => void;
  yaAgregados: number[];
  onConfirm: (ids: number[]) => void;
};

const LIMITE = 50;
const DEBOUNCE_MS = 400;

export default function IngredienteSelectorModal({
  open,
  onClose,
  yaAgregados,
  onConfirm,
}: Props) {
  const { ingredientes, cargarIngredientes } = useIngredientes();

  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const { unidadesMedida } = useProductos();

  useEffect(() => {
    if (!open) return;

    setCargando(true);
    setErrorCarga("");

    const timer = setTimeout(
      async () => {
        try {
          await cargarIngredientes(1, LIMITE, undefined, busqueda);
        } catch {
          setErrorCarga("No se pudieron cargar los ingredientes");
        } finally {
          setCargando(false);
        }
      },
      busqueda ? DEBOUNCE_MS : 0,
    );

    return () => clearTimeout(timer);
  }, [open, busqueda]);

  if (!open) return null;

  const disponibles = ingredientes.filter(
    (ing) => !yaAgregados.includes(ing.id),
  );

  const toggle = (id: number) =>
    setSeleccion((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const cerrar = () => {
    setSeleccion([]);
    setBusqueda("");
    onClose();
  };

  const confirmar = () => {
    onConfirm(seleccion);
    cerrar();
  };

  const stockBadge = (stock: number) =>
    stock > 10
      ? "bg-green-100 text-green-700"
      : stock > 0
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-600";

  const obtenerUnidadMedidaNombre = (id: number): string => {
    const medidaEncontrada = unidadesMedida.find((unidad) => unidad.id === id);

    return medidaEncontrada?.nombre || "g";
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={cerrar}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Agregar ingredientes
            </h3>
            <p className="text-sm text-slate-500">
              Seleccioná los ingredientes que lleva el producto.
            </p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-slate-100 p-4">
          <input
            type="text"
            autoFocus
            placeholder="Buscar ingrediente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {errorCarga ? (
            <p className="px-4 py-10 text-center text-sm text-red-500">
              {errorCarga}
            </p>
          ) : cargando ? (
            <p className="px-4 py-10 text-center text-sm text-slate-400">
              Cargando ingredientes…
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-600">
                <tr>
                  <th className="w-12 px-4 py-3" />
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Unidad de Medida
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Alérgeno
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disponibles.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      {ingredientes.length > 0
                        ? "Todos los ingredientes de esta búsqueda ya están agregados."
                        : "No se encontraron ingredientes."}
                    </td>
                  </tr>
                )}

                {disponibles.map((ing) => {
                  const marcado = seleccion.includes(ing.id);

                  return (
                    <tr
                      key={ing.id}
                      onClick={() => toggle(ing.id)}
                      className={
                        marcado
                          ? "cursor-pointer bg-blue-50"
                          : "cursor-pointer hover:bg-slate-50"
                      }
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-blue-600"
                          checked={marcado}
                          onChange={() => toggle(ing.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-700">
                        {ing.nombre}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stockBadge(Number(ing.stock_cantidad))}`}
                        >
                          {ing.stock_cantidad}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {obtenerUnidadMedidaNombre(ing.unidad_medida_id) ?? "—"}
                      </td>

                      <td className="px-4 py-3">
                        {ing.es_alergeno && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            ⚠ alérgeno
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <p className="text-sm text-slate-500">
            {seleccion.length > 0
              ? `${seleccion.length} seleccionado${seleccion.length !== 1 ? "s" : ""}`
              : "Hacé click en una fila para seleccionarla"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cerrar}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={seleccion.length === 0}
              onClick={confirmar}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Agregar ({seleccion.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
