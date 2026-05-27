import { useState } from "react";

export type ProductoIngredienteItem = {
  ingrediente_id: number;
  es_removible: boolean;
  cantidad: number;
};

type Ingrediente = {
  id: number;
  nombre: string;
  precio: number;
  unidad: string;
  stock_disponible: number;
};

type Props = {
  ingredientes: Ingrediente[];
  value: ProductoIngredienteItem[];
  onChange: (val: ProductoIngredienteItem[]) => void;
};

export default function ProductoIngredienteFormulario({
  ingredientes,
  value,
  onChange,
}: Props) {
  const [busqueda, setBusqueda] = useState("");

  const ingredientesFiltrados = ingredientes.filter((ing) =>
    ing.nombre.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const getSeleccionado = (id: number) =>
    value.find((item) => item.ingrediente_id === id);

  const toggleIngrediente = (ing: Ingrediente, checked: boolean) => {
    if (checked) {
      onChange([
        ...value,
        { ingrediente_id: ing.id, es_removible: false, cantidad: 1 },
      ]);
    } else {
      onChange(value.filter((item) => item.ingrediente_id !== ing.id));
    }
  };

  const actualizarCampo = (
    id: number,
    campo: keyof Omit<ProductoIngredienteItem, "ingrediente_id">,
    val: number | boolean,
  ) => {
    onChange(
      value.map((item) =>
        item.ingrediente_id === id ? { ...item, [campo]: val } : item,
      ),
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 p-5">
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-base font-semibold text-slate-800">Ingredientes</h3>
        <p className="text-sm text-slate-500">
          Seleccioná los ingredientes, su cantidad y si el cliente puede
          removerlos.
        </p>
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar ingrediente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      />

      {/* Tabla de selección */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Usar</th>
              <th className="px-4 py-3 text-left font-semibold">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold">Unidad</th>
              <th className="px-4 py-3 text-left font-semibold">Stock disp.</th>
              <th className="px-4 py-3 text-left font-semibold">Precio</th>
              <th className="px-4 py-3 text-left font-semibold">Cantidad</th>
              <th className="px-4 py-3 text-left font-semibold">Removible</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {ingredientesFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-slate-400"
                >
                  No se encontraron ingredientes.
                </td>
              </tr>
            )}

            {ingredientesFiltrados.map((ing) => {
              const seleccionado = getSeleccionado(ing.id);
              const activo = !!seleccionado;

              return (
                <tr
                  key={ing.id}
                  className={activo ? "bg-blue-50" : "hover:bg-slate-50"}
                >
                  {/* Checkbox de selección */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-blue-600"
                      checked={activo}
                      onChange={(e) => toggleIngrediente(ing, e.target.checked)}
                    />
                  </td>

                  {/* Nombre */}
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {ing.nombre}
                  </td>

                  {/* Unidad */}
                  <td className="px-4 py-3 text-slate-500">{ing.unidad}</td>

                  {/* Stock disponible */}
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        ing.stock_disponible > 10
                          ? "bg-green-100 text-green-700"
                          : ing.stock_disponible > 0
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {ing.stock_disponible}
                    </span>
                  </td>

                  {/* Precio */}
                  <td className="px-4 py-3 text-slate-600">
                    ${Number(ing.precio).toFixed(2)}
                  </td>

                  {/* Cantidad */}
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0.01}
                      step={0.01}
                      disabled={!activo}
                      value={seleccionado?.cantidad ?? ""}
                      onChange={(e) =>
                        actualizarCampo(
                          ing.id,
                          "cantidad",
                          Number(e.target.value),
                        )
                      }
                      className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                    />
                  </td>

                  {/* Removible */}
                  <td className="px-4 py-3">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-blue-600"
                        disabled={!activo}
                        checked={seleccionado?.es_removible ?? false}
                        onChange={(e) =>
                          actualizarCampo(
                            ing.id,
                            "es_removible",
                            e.target.checked,
                          )
                        }
                      />
                      Sí
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Resumen de seleccionados */}
      {value.length > 0 && (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{value.length}</span>{" "}
          ingrediente{value.length !== 1 ? "s" : ""} seleccionado
          {value.length !== 1 ? "s" : ""}. Costo estimado:{" "}
          <span className="font-semibold text-blue-600">
            $
            {value
              .reduce((total, item) => {
                const ing = ingredientes.find(
                  (i) => i.id === item.ingrediente_id,
                );
                return total + (ing ? Number(ing.precio) * item.cantidad : 0);
              }, 0)
              .toFixed(2)}
          </span>
        </div>
      )}
    </section>
  );
}
