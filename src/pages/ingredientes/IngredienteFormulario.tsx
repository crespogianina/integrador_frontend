import { useEffect, useState } from "react";
import { useIngredientes } from "../../context/IngredienteContext";
import type { IngredienteCreate } from "../../models/Ingrediente";
import { useNavigate } from "react-router-dom";

interface FormularioState {
  nombre: string;
  descripcion: string;
  es_alergeno: boolean;
}

const initialState: FormularioState = {
  nombre: "",
  descripcion: "",
  es_alergeno: false,
};

export function IngredienteFormulario() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState<FormularioState>(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const { agregar, editar, ingredienteEditar } = useIngredientes();

  useEffect(() => {
    if (ingredienteEditar) {
      setFormulario({
        nombre: ingredienteEditar.nombre,
        descripcion: ingredienteEditar.descripcion,
        es_alergeno: ingredienteEditar.es_alergeno,
      });
    }
  }, [ingredienteEditar]);

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

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!validarErrores()) return;

    const participante = obtenerParticipante();

    if (ingredienteEditar) {
      editar({ ...participante, id: ingredienteEditar.id });
    } else {
      agregar(participante);
    }

    navigate("/ingredientes/");
    limpiarFormulario();
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

  const obtenerParticipante = (): IngredienteCreate => {
    const { nombre, descripcion, es_alergeno } = formulario;

    return {
      nombre,
      descripcion,
      es_alergeno,
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
      </section>
    </main>
  );
}
