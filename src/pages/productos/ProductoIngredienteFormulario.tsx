import { useEffect, useState } from "react";
import IngredienteSelectorModal from "../../components/IngredienteSelectorModal";
import { useProductos } from "../../context/ProductoContext";
import { useIngredientes } from "../../context/IngredienteContext";
import type { ProductoIngredienteCreate } from "../../models/Producto";

type Props = {
  value: ProductoIngredienteCreate[];
  onChange: (val: ProductoIngredienteCreate[]) => void;
};

export default function ProductoIngredienteFormulario({
  value,
  onChange,
}: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const { unidadesMedida } = useProductos();
  const { ingredientes, cargarIngredientes } = useIngredientes();

  const datosDe = (id: number) => ingredientes?.find((i) => i.id === id);

  const unidadesCompatibles = (ingId: number) => {
    const ing = datosDe(ingId);
    if (!ing) return unidadesMedida;
    const unidadBase = unidadesMedida.find(
      (u) => u.id === ing.unidad_medida_id,
    );
    if (!unidadBase?.tipo) return unidadesMedida;
    return unidadesMedida.filter((u) => u.tipo === unidadBase.tipo);
  };

  const agregarIngredientes = (ids: number[]) => {
    const nuevos: ProductoIngredienteCreate[] = ids.map((id) => {
      const ing = datosDe(id);
      const compatibles = unidadesCompatibles(id);
      return {
        ingrediente_id: id,
        unidad_medida_id: compatibles[0]?.id ?? ing?.unidad_medida_id ?? 0,
        es_removible: false,
        cantidad: 0,
      };
    });
    onChange([...value, ...nuevos]);
  };

  const quitar = (id: number) =>
    onChange(value.filter((item) => item.ingrediente_id !== id));

  const actualizarCampo = (
    ingredienteId: number,
    campo: keyof ProductoIngredienteCreate,
    valor: any,
  ) => {
    onChange(
      value.map((item) => {
        if (item.ingrediente_id !== ingredienteId) return item;

        if (campo === "cantidad") {
          const unidad = unidadesMedida.find(
            (u) => u.id === item.unidad_medida_id,
          );
          const permiteDecimales =
            unidad?.tipo === "peso" || unidad?.tipo === "volumen";

          if (permiteDecimales) {
            if (!/^\d*\.?\d*$/.test(valor)) return item;
          } else {
            if (!/^\d*$/.test(valor)) return item;
          }
        }

        return { ...item, [campo]: valor };
      }),
    );
  };

  const factorDe = (unidadId: number) =>
    Number(unidadesMedida.find((u) => u.id === unidadId)?.factor ?? 1);

  const costoEstimado = value.reduce((total, item) => {
    const ing = datosDe(item.ingrediente_id);
    if (!ing || !item.cantidad) return total;
    const precioPorBase =
      Number(ing.precio_base) / factorDe(ing.unidad_medida_id);
    const cantidadEnBase =
      Number(item.cantidad) * factorDe(item.unidad_medida_id);
    return total + precioPorBase * cantidadEnBase;
  }, 0);

  return (
    <section className="rounded-2xl border border-slate-200 p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Ingredientes
          </h3>
          <p className="text-sm text-slate-500">
            Configurá la cantidad y si el cliente puede removerlos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          + Agregar ingredientes
        </button>
      </div>

      {value.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 py-10 text-center">
          <p className="text-sm font-medium text-slate-600">
            Este producto todavía no tiene ingredientes
          </p>
          <p className="text-xs text-slate-400">
            Agregalos con el botón de arriba
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left font-semibold">Cantidad</th>
                <th className="px-4 py-3 text-left font-semibold">Unidad</th>
                <th className="px-4 py-3 text-left font-semibold">Removible</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {value.map((item) => {
                const ing = datosDe(item.ingrediente_id);
                const compatibles = unidadesCompatibles(item.ingrediente_id);

                return (
                  <tr key={item.ingrediente_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {ing?.nombre ?? (
                        <span className="text-slate-400 italic">
                          Cargando...
                        </span>
                      )}
                      {ing?.es_alergeno && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          ⚠
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.cantidad}
                        onChange={(e) =>
                          actualizarCampo(
                            item.ingrediente_id,
                            "cantidad",
                            e.target.value,
                          )
                        }
                        className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </td>

                    <td className="px-4 py-3">
                      {compatibles.length > 1 ? (
                        <select
                          value={item.unidad_medida_id}
                          onChange={(e) =>
                            actualizarCampo(
                              item.ingrediente_id,
                              "unidad_medida_id",
                              Number(e.target.value),
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                          {compatibles.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.nombre}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-slate-500">
                          {compatibles[0]?.nombre ?? "—"}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          actualizarCampo(
                            item.ingrediente_id,
                            "es_removible",
                            !item.es_removible,
                          )
                        }
                        aria-label="Cambiar removible"
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          item.es_removible ? "bg-blue-600" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                            item.es_removible ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => quitar(item.ingrediente_id)}
                        className="rounded-lg bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {value.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span>
            <span className="font-semibold text-slate-800">{value.length}</span>{" "}
            ingrediente{value.length !== 1 ? "s" : ""}
          </span>
          <span>
            Costo estimado:{" "}
            <span className="font-semibold text-blue-600">
              ${costoEstimado.toFixed(2)}
            </span>
          </span>
        </div>
      )}

      <IngredienteSelectorModal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        yaAgregados={value.map((item) => item.ingrediente_id)}
        onConfirm={agregarIngredientes}
      />
    </section>
  );
}
