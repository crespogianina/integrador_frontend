import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategorias } from "../../context/CategoriaContext";
import type { CategoriaCreate } from "../../models/Categoria";

const initialState = {
  nombre: "",
  descripcion: "",
  parent_id: "",
};

export default function CategoriaFormulario() {
  const navigate = useNavigate();
  const { agregar, editar, categoriaEditar, setCategoriaEditar, categorias } =
    useCategorias();

  const [formulario, setFormulario] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});
  useEffect(() => {
    if (categoriaEditar) {
      setFormulario({
        nombre: categoriaEditar.nombre,
        descripcion: categoriaEditar.descripcion,
        parent_id: categoriaEditar.parent_id
          ? String(categoriaEditar.parent_id)
          : "",
      });
    }
  }, [categoriaEditar]);

  const handleChange = (
    evento: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = evento.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarErrores()) return;

    if (categoriaEditar) {
      editar({
        ...formulario,
        id: categoriaEditar.id,
      });
      setCategoriaEditar(null);
    } else {
      agregar(formulario as CategoriaCreate);
    }

    navigate("/categorias");
  };

  const handleCancel = () => {
    setCategoriaEditar(null);
    setFormulario(initialState);
    navigate("/categorias");
  };

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-semibold text-slate-800">
              {categoriaEditar ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <p className="text-sm text-slate-500">
              Complete los datos de la categoría.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Nombre
                </label>
                <input
                  name="nombre"
                  value={formulario.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                  name="descripcion"
                  value={formulario.descripcion}
                  onChange={handleChange}
                  placeholder="Ingrese una descripción"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
                {errores.descripcion && (
                  <p className="mt-1 text-sm text-red-500">
                    {errores.descripcion}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Categoría Principal
                </label>

                <select
                  name="parent_id"
                  value={formulario.parent_id}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Sin categoría padre</option>

                  {categorias
                    .filter((categoria) => categoria.id !== categoriaEditar?.id)
                    .map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                </select>
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
                {categoriaEditar ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
