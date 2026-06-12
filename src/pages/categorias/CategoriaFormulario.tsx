import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCategorias } from "../../context/CategoriaContext";
import ImageUploader from "../../components/ImageUploader";
import type {
  CategoriaCreate,
  CategoriaTreeRead,
} from "../../models/Categoria";
import CategoriaSelectorArbol from "../../components/SelectorCategoria";

const initialState: {
  nombre: string;
  descripcion: string | null;
  parent_id: number | null;
} = {
  nombre: "",
  descripcion: "",
  parent_id: null,
};

const inputClass = (hayError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
    hayError
      ? "border-red-500 bg-red-50"
      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
  }`;

export default function CategoriaFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    agregar,
    editar,
    actualizarImagen,
    categoriaEditar,
    setCategoriaEditar,
    cargarCategoriasArbol,
    cargarCategoria,
  } = useCategorias();

  const [formulario, setFormulario] = useState(initialState);
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorRequest, setErrorRequest] = useState<string>("");
  const [categoriasArbol, setCategoriasArbol] = useState<CategoriaTreeRead[]>(
    [],
  );

  useEffect(() => {
    cargarCategoriaArbol();
    if (id) {
      cargarCategoria(Number(id));
    }
  }, []);

  useEffect(() => {
    if (categoriaEditar) {
      setFormulario({
        nombre: categoriaEditar.nombre,
        descripcion: categoriaEditar?.descripcion || null,
        parent_id: categoriaEditar.parent_id || null,
      });
      setImagenUrl(categoriaEditar.imagen_url ?? null);
    }
  }, [categoriaEditar]);

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

    if (!formulario.descripcion || !formulario.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarErrores()) return;

    try {
      let categoriaId: number;

      if (categoriaEditar) {
        categoriaId = categoriaEditar.id;
        await editar({
          ...formulario,
          parent_id: formulario.parent_id || null,
          id: categoriaEditar.id,
        });
      } else {
        const nueva = await agregar(formulario as CategoriaCreate);
        categoriaId = nueva.id;
      }

      await actualizarImagen(categoriaId, imagenUrl);

      setCategoriaEditar(null);
      navigate("/categorias");
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al guardar la categoría",
      );
    }
  };

  const handleCancel = () => {
    setCategoriaEditar(null);
    setFormulario(initialState);
    setImagenUrl(null);
    navigate("/categorias");
  };

  const cargarCategoriaArbol = async () => {
    try {
      const categorias = await cargarCategoriasArbol();
      setCategoriasArbol(categorias);
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
                  className={inputClass(Boolean(errores.nombre))}
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
                  value={formulario.descripcion || ""}
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

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Categoría padre
                </label>

                <p className="mb-3 text-xs text-slate-400">
                  {formulario.parent_id
                    ? `Seleccionada: ID ${formulario.parent_id}`
                    : "Sin categoría padre"}
                </p>

                <div className="max-h-64 overflow-y-auto  p-3">
                  {categoriasArbol.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      Cargando categorías...
                    </p>
                  ) : categoriasArbol.every(
                      (c) => c.id === categoriaEditar?.id,
                    ) ? (
                    <p className="text-sm text-slate-400">
                      No hay otras categorías disponibles para asignar como
                      padre.
                    </p>
                  ) : (
                    <CategoriaSelectorArbol
                      categorias={categoriasArbol}
                      selectedId={formulario.parent_id}
                      excludeId={categoriaEditar?.id}
                      onSelect={(id) =>
                        setFormulario((prev) => ({ ...prev, parent_id: id }))
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <h3 className="mb-3 text-base font-semibold text-slate-800">
                Imagen de la categoría
              </h3>

              <ImageUploader
                value={imagenUrl ? [imagenUrl] : []}
                onChange={(urls) => setImagenUrl(urls[0] ?? null)}
              />
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
