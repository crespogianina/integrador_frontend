import { useEffect, useMemo, useState } from "react";
import { useProductos } from "../context/ProductoContext";
import type { IngredienteRead } from "../models/Ingrediente";
import { API_BASE, apiFetch } from "../config/api";

type Props = {
  open: boolean;
  onClose: () => void;
  yaAgregados: number[];
  onConfirm: (ids: number[]) => void;
};

const LIMITE = 10;
const LIMITE_FETCH = 50;

function stockBadge(stock: number) {
  if (stock > 10) return "bg-green-100 text-green-700";
  if (stock > 0) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-600";
}

export default function IngredienteSelectorModal({
  open,
  onClose,
  yaAgregados,
  onConfirm,
}: Props) {
  const { unidadesMedida } = useProductos();

  const [todos, setTodos] = useState<IngredienteRead[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [errorCarga, setErrorCarga] = useState("");
  const [seleccion, setSeleccion] = useState<number[]>([]);

  const simboloDeIng = (ing: IngredienteRead) =>
    unidadesMedida.find((u) => u.id === ing.unidad_medida_id)?.simbolo ?? "—";

  // Fetch único al abrir el modal
  useEffect(() => {
    if (!open) return;
    setCargando(true);
    setErrorCarga("");

    apiFetch(`${API_BASE}/ingredientes/?offset=0&limit=${LIMITE_FETCH}`)
      .then((res) => res.json())
      .then((data) => setTodos(data.data ?? []))
      .catch(() => setErrorCarga("No se pudieron cargar los ingredientes"))
      .finally(() => setCargando(false));
  }, [open]);

  // Filtrado y paginado en cliente
  const disponibles = useMemo(
    () =>
      todos.filter(
        (ing) =>
          !yaAgregados.includes(ing.id) &&
          ing.nombre.toLowerCase().includes(busqueda.toLowerCase().trim()),
      ),
    [todos, yaAgregados, busqueda],
  );

  const totalPaginas = Math.ceil(disponibles.length / LIMITE);
  const paginaActual = Math.min(pagina, totalPaginas || 1);
  const enPagina = disponibles.slice(
    (paginaActual - 1) * LIMITE,
    paginaActual * LIMITE,
  );

  useEffect(() => {
    setPagina(1);
  }, [busqueda]);

  if (!open) return null;

  const seleccionados = seleccion.length;

  const toggle = (id: number) =>
    setSeleccion((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const cerrar = () => {
    setSeleccion([]);
    setBusqueda("");
    setPagina(1);
    onClose();
  };

  const confirmar = () => {
    onConfirm(seleccion);
    cerrar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={cerrar}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
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
            <div className="space-y-2 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-slate-600">
                <tr>
                  <th className="w-10 px-4 py-3" />
                  <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold">Stock</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Alérgeno
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enPagina.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      {busqueda
                        ? "No hay ingredientes que coincidan con la búsqueda."
                        : "No hay ingredientes disponibles para agregar."}
                    </td>
                  </tr>
                ) : (
                  enPagina.map((ing) => {
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
                          <span className="ml-1.5 text-xs text-slate-400">
                            ({simboloDeIng(ing)})
                          </span>
                          {ing.es_alergeno && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                              ⚠
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${stockBadge(Number(ing.stock_cantidad))}`}
                          >
                            {ing.stock_cantidad} {simboloDeIng(ing)}
                          </span>
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
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPaginas > 1 && (
          <div className="flex items-center justify-center gap-1 border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              ←
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPagina(p)}
                className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                  p === paginaActual
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <p className="text-sm text-slate-500">
            {seleccionados > 0
              ? `${seleccionados} seleccionado${seleccionados !== 1 ? "s" : ""}`
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
              disabled={seleccionados === 0}
              onClick={confirmar}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Agregar ({seleccionados})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
