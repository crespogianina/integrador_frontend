import { useEffect, useState } from "react";
import { useIngredientes } from "../../context/IngredienteContext";
import type {
  IngredienteCreate,
  IngredienteRead,
} from "../../models/Ingrediente";
import { useNavigate, useParams } from "react-router-dom";

interface FormularioState {
  nombre: string;
  descripcion: string;
  es_alergeno: boolean;
  unidad_medida: string;
  stock: number;
  precio: number;
}

const initialState: FormularioState = {
  nombre: "",
  descripcion: "",
  es_alergeno: false,
  stock: 0,
  unidad_medida: "",
  precio: 0,
};

export function IngredienteFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formulario, setFormulario] = useState<FormularioState>(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorRequest, setErrorRequest] = useState<string>("");

  const { agregar, editar, ingredienteEditar, cargarIngrediente } =
    useIngredientes();

  useEffect(() => {
    if (id) {
      cargarIngrediente(Number(id));
    }
  }, []);

  useEffect(() => {
    if (ingredienteEditar) {
      setFormulario({
        nombre: ingredienteEditar.nombre,
        descripcion: ingredienteEditar.descripcion,
        es_alergeno: ingredienteEditar.es_alergeno,
        unidad_medida: ingredienteEditar.unidad_medida,
        stock: Number(ingredienteEditar.stock),
        precio: Number(ingredienteEditar.precio),
      });
    }
  }, [ingredienteEditar]);

  useEffect(() => {
    if (!errorRequest) return;

    const timer = setTimeout(() => {
      setErrorRequest("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [errorRequest]);

  const handleChange = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = evento.target as HTMLInputElement;

    setFormulario((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleEsAlergeno = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = evento.target;

    setFormulario((prev) => ({
      ...prev,
      es_alergeno: checked,
    }));
  };

  const onSubmitForm = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!validarErrores()) return;

    const ingrediente = obtenerIngrediente();
    try {
      if (ingredienteEditar) {
        await editar({
          ...ingrediente,
          id: ingredienteEditar.id,
        });
      } else {
        await agregar(ingrediente);
      }

      navigate("/ingredientes/");
      limpiarFormulario();
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al guardar el ingrediente",
      );
    }
  };

  const validarErrores = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }

    if (!formulario.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const obtenerIngrediente = (): IngredienteCreate => {
    const { nombre, descripcion, es_alergeno, precio, stock, unidad_medida } =
      formulario;

    return {
      nombre,
      descripcion,
      es_alergeno,
      precio: String(precio),
      stock: String(stock),
      unidad_medida,
    };
  };

  const limpiarFormulario = () => {
    setFormulario({ ...initialState });
    setErrores({});
  };

  const handleCancel = () => {
    limpiarFormulario();
    navigate("/ingredientes");
  };

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-semibold text-slate-800">
              {ingredienteEditar ? "Editar ingrediente" : "Nuevo ingrediente"}
            </h2>
            <p className="text-sm text-slate-500">
              Complete los datos del ingrediente.
            </p>
          </div>

          <form onSubmit={onSubmitForm} className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  value={formulario.nombre}
                  type="text"
                  onChange={handleChange}
                  placeholder="Ingrese el nombre"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition
                  ${
                    errores.nombre
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  }`}
                />
                {errores.nombre && (
                  <p className="mt-1 text-sm text-red-500">{errores.nombre}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Descripción
                </label>
                <input
                  id="descripcion"
                  name="descripcion"
                  value={formulario.descripcion}
                  type="text"
                  onChange={handleChange}
                  placeholder="Ingrese una descripción"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition
                  ${
                    errores.descripcion
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  }`}
                />
                {errores.descripcion && (
                  <p className="mt-1 text-sm text-red-500">
                    {errores.descripcion}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Unidad de medida
                </label>
                <select
                  name="unidad_medida"
                  id="unidad_medida"
                  value={formulario.unidad_medida}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition
                  ${
                    errores.unidad_medida
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  }`}
                >
                  <option value="unidad">Unidad</option>
                  <option value="kg">Kilogramos</option>
                  <option value="lts">Litros</option>
                </select>

                {errores.unidad_medida && (
                  <p className="mt-1 text-sm text-red-500">
                    {errores.unidad_medida}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Precio
                </label>
                <input
                  id="precio"
                  name="precio"
                  value={formulario.precio}
                  type="number"
                  onChange={handleChange}
                  placeholder="Ingrese un precio"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition
                  ${
                    errores.precio
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  }`}
                />
                {errores.precio && (
                  <p className="mt-1 text-sm text-red-500">{errores.precio}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Stock
                </label>
                <input
                  id="stock"
                  name="stock"
                  value={formulario.stock}
                  type="number"
                  onChange={handleChange}
                  placeholder="Ingrese stock"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition
                  ${
                    errores.stock
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  }`}
                />
                {errores.stock && (
                  <p className="mt-1 text-sm text-red-500">{errores.stock}</p>
                )}
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  id="es_alergeno"
                  type="checkbox"
                  name="es_alergeno"
                  checked={formulario.es_alergeno}
                  onChange={handleEsAlergeno}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">
                  Es alérgeno
                </span>
              </label>
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
                {ingredienteEditar ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>

        {errorRequest && (
          <div className="fixed bottom-10 right-5 z-50">
            <div className="bg-red-500 text-white px-4 py-3 rounded-b-md shadow-lg animate-slide-in">
              {errorRequest}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
