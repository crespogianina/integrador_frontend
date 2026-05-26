import { useState } from "react";
import Tabla, { type Column } from "../../components/Tabla";

type Ingrediente = {
  id: number;
  nombre: string;
};

export type ProductoIngredienteItem = {
  ingrediente_id: number;
  es_removible: boolean;
};

type Props = {
  ingredientes: Ingrediente[];
  value: ProductoIngredienteItem[];
  onChange: (value: ProductoIngredienteItem[]) => void;
};

type Fila = {
  id: number;
  nombre: string;
  es_removible: boolean;
};

export default function ProductoIngrediente({
  ingredientes,
  value,
  onChange,
}: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<
    number | null
  >(null);
  const [esRemovible, setEsRemovible] = useState(false);

  const columnas: Column<Fila>[] = [
    { header: "Nombre", accessor: "nombre" },
    {
      header: "Removible",
      accessor: "es_removible",
      customLabelFn: (val) => (val ? "✓ Sí" : "No"),
    },
  ];

  const filas: Fila[] = value.map(({ ingrediente_id, es_removible }) => {
    const ing = ingredientes.find((i) => i.id === ingrediente_id)!;
    return { id: ing.id, nombre: ing.nombre, es_removible };
  });

  const cerrarModal = () => {
    setModalAbierto(false);
    setIngredienteSeleccionado(null);
    setEsRemovible(false);
  };

  const handleAgregar = () => {
    if (ingredienteSeleccionado == null) return;
    onChange([
      ...value,
      { ingrediente_id: ingredienteSeleccionado, es_removible: esRemovible },
    ]);
    cerrarModal();
  };

  const handleEliminar = (fila: Fila) => {
    onChange(value.filter((v) => v.ingrediente_id !== fila.id));
  };

  return (
    <section>
      <Tabla
        title="Ingredientes"
        total={filas.length}
        data={filas}
        columns={columnas}
        getRowId={(item) => item.id}
        emptyMessage="No hay ingredientes agregados."
        onAdd={() => setModalAbierto(true)}
        onDelete={handleEliminar}
        page={1}
        totalPages={1}
        onPrevious={() => {}}
        onNext={() => {}}
        onPageChange={() => {}}
      />

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h4 className="mb-4 text-base font-semibold text-slate-800">
              Agregar Ingrediente
            </h4>

            <label className="mb-1 block text-sm font-medium text-slate-700">
              Producto
            </label>
            <select
              value={ingredienteSeleccionado ?? ""}
              onChange={(e) =>
                setIngredienteSeleccionado(Number(e.target.value))
              }
              className="mb-4 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="" disabled>
                Seleccionar ingrediente…
              </option>
              {ingredientes
                .filter(
                  (ing) => !value.some((v) => v.ingrediente_id === ing.id),
                )
                .map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.nombre}
                  </option>
                ))}
            </select>

            <label className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={esRemovible}
                onChange={(e) => setEsRemovible(e.target.checked)}
                className="rounded"
              />
              Removible
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAgregar}
                disabled={ingredienteSeleccionado == null}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirmar
              </button>
              <button
                type="button"
                onClick={cerrarModal}
                className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
