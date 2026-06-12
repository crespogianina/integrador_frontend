import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useIngredientes } from "../../context/IngredienteContext";
import { useProductos } from "../../context/ProductoContext";
import { useForm } from "../../hooks/useForm";
import type {
  IngredienteCreate,
  IngredienteRead,
} from "../../models/Ingrediente";

interface FormularioState {
  nombre: string;
  descripcion: string;
  es_alergeno: boolean;
  unidad_medida_id: number;
  stock_cantidad: string;
  precio_base: string;
}

const initialState: FormularioState = {
  nombre: "",
  descripcion: "",
  es_alergeno: false,
  unidad_medida_id: 0,
  stock_cantidad: "",
  precio_base: "",
};

const inputClass = (hayError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
    hayError
      ? "border-red-500 bg-red-50"
      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
  }`;

export function IngredienteFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { form, setForm, handleChange, errores, setErrores, resetForm } =
    useForm<FormularioState>(initialState);

  const { agregar, editar, getIngredienteById } = useIngredientes();

  const { unidadesMedida } = useProductos();

  const [errorRequest, setErrorRequest] = useState<string>("");
  const [ingredienteEditar, setIngredienteEditar] =
    useState<IngredienteRead | null>(null);

  const esEdicion = Boolean(id);

  useEffect(() => {
    if (!id) {
      setIngredienteEditar(null);
      resetForm();
      return;
    }

    cargar();
  }, []);

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 2000);

    return () => clearTimeout(timer);
  }, [errorRequest]);

  const validarErrores = (): boolean => {
    const nuevos: Partial<Record<keyof FormularioState, string>> = {};

    if (!form.nombre.trim()) {
      nuevos.nombre = "El nombre es obligatorio";
    }

    if (!form.descripcion.trim()) {
      nuevos.descripcion = "La descripción es obligatoria";
    }

    if (!form.unidad_medida_id) {
      nuevos.unidad_medida_id = "Seleccione una unidad de medida";
    }

    const precio = Number(form.precio_base);
    if (!form.precio_base.trim() || isNaN(precio) || precio < 0) {
      nuevos.precio_base = "Ingrese un precio válido";
    }

    const stock = Number(form.stock_cantidad);
    if (
      !form.stock_cantidad.trim() ||
      isNaN(stock) ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      nuevos.stock_cantidad = "Ingrese un stock válido (entero ≥ 0)";
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const obtenerIngrediente = (): IngredienteCreate => ({
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim(),
    es_alergeno: form.es_alergeno,
    precio_base: Number(form.precio_base),
    stock_cantidad: Number(form.stock_cantidad),
    unidad_medida_id: Number(form.unidad_medida_id),
  });

  const onSubmitForm = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!validarErrores()) return;

    const ingrediente = obtenerIngrediente();

    try {
      if (esEdicion && ingredienteEditar) {
        await editar({ ...ingrediente, id: ingredienteEditar.id });
      } else {
        await agregar(ingrediente);
      }

      resetForm();
      navigate("/ingredientes");
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al guardar el ingrediente",
      );
    }
  };

  const handleCancel = () => {
    resetForm();
    navigate("/ingredientes");
  };

  const cargar = async () => {
    try {
      const ingrediente = await getIngredienteById(Number(id));
      setIngredienteEditar(ingrediente);
      setForm({
        nombre: ingrediente.nombre,
        descripcion: ingrediente.descripcion,
        es_alergeno: ingrediente.es_alergeno,
        unidad_medida_id: ingrediente.unidad_medida_id,
        stock_cantidad: String(ingrediente.stock_cantidad),
        precio_base: String(ingrediente.precio_base),
      });
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el ingrediente",
      );
    }
  };

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-semibold text-slate-800">
              {esEdicion ? "Editar ingrediente" : "Nuevo ingrediente"}
            </h2>
            <p className="text-sm text-slate-500">
              Complete los datos del ingrediente.
            </p>
          </div>

          <form onSubmit={onSubmitForm} className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre"
                  className={inputClass(Boolean(errores.nombre))}
                />
                {errores.nombre && (
                  <p className="mt-1 text-sm text-red-500">{errores.nombre}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="descripcion"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Descripción
                </label>
                <input
                  id="descripcion"
                  name="descripcion"
                  type="text"
                  value={form.descripcion}
                  onChange={handleChange}
                  placeholder="Ingrese una descripción"
                  className={inputClass(Boolean(errores.descripcion))}
                />
                {errores.descripcion && (
                  <p className="mt-1 text-sm text-red-500">
                    {errores.descripcion}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Stock
                </label>
                <input
                  id="stock_cantidad"
                  name="stock_cantidad"
                  type="text"
                  inputMode="numeric"
                  value={form.stock_cantidad}
                  onChange={handleChange}
                  placeholder="Ingrese stock"
                  className={inputClass(Boolean(errores.stock_cantidad))}
                />
                {errores.stock_cantidad && (
                  <p className="mt-1 text-sm text-red-500">
                    {errores.stock_cantidad}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="unidad_medida"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Unidad de medida
                </label>
                <select
                  id="unidad_medida_id"
                  name="unidad_medida_id"
                  value={form.unidad_medida_id}
                  onChange={handleChange}
                  className={inputClass(Boolean(errores.unidad_medida_id))}
                >
                  <option value="">Seleccione una unidad</option>
                  {unidadesMedida.map((unidad) => (
                    <option key={unidad.id} value={unidad.id}>
                      {unidad.nombre} ({unidad.simbolo})
                    </option>
                  ))}
                </select>
                {errores.unidad_medida_id && (
                  <p className="mt-1 text-sm text-red-500">
                    {errores.unidad_medida_id}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="precio_base"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Precio
                </label>
                <input
                  id="precio_base"
                  name="precio_base"
                  type="text"
                  inputMode="decimal"
                  value={form.precio_base}
                  onChange={handleChange}
                  placeholder="Ingrese un precio"
                  className={inputClass(Boolean(errores.precio_base))}
                />
                {errores.precio_base && (
                  <p className="mt-1 text-sm text-red-500">
                    {errores.precio_base}
                  </p>
                )}
              </div>

              <div className="flex items-end">
                <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 select-none">
                  <input
                    name="es_alergeno"
                    type="checkbox"
                    checked={form.es_alergeno}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${form.es_alergeno ? "bg-amber-500" : "bg-slate-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.es_alergeno ? "left-[22px]" : "left-0.5"}`}
                    />
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    Es alérgeno
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {esEdicion ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>

        {errorRequest && (
          <div className="fixed bottom-10 right-5 z-50">
            <div className="animate-slide-in rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
              {errorRequest}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
