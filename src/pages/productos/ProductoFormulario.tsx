import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductos } from "../../context/ProductoContext";
import { useCategorias } from "../../context/CategoriaContext";
import { useIngredientes } from "../../context/IngredienteContext";
import type { ProductoCreate } from "../../models/Producto";

const initialState = {
  nombre: "",
  descripcion: "",
  precio_base: "",
  stock_cantidad: "",
  disponible: true,
  imagenes_url: [] as string[],
  categorias: [] as number[],
  categoriaPrincipal: "",
  ingredientes: [] as number[],
  ingredientesRemovibles: [] as number[],
};

export default function ProductoFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { agregar, editar } = useProductos();
  const { categorias, cargarCategorias } = useCategorias();
  const { ingredientes, cargarIngredientes } = useIngredientes();

  const [formulario, setFormulario] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const imagenes = formulario.imagenes_url;
  useEffect(() => {
    cargarCategorias(1, 50);
    cargarIngredientes(1, 50, "");
  }, []);

  useEffect(() => {
    if (!id) return;

    async function cargarProducto() {
      const res = await fetch(`http://localhost:8000/productos/${id}`);
      const producto = await res.json();

      setFormulario({
        nombre: producto.nombre ?? "",
        descripcion: producto.descripcion ?? "",
        precio_base: String(producto.precio_base ?? ""),
        stock_cantidad: String(producto.stock_cantidad ?? ""),
        disponible: producto.disponible ?? true,
        imagenes_url: producto.imagenes_url ?? [],
        categorias: producto.categorias?.map((c: any) => c.categoria_id) ?? [],
        categoriaPrincipal:
          producto.categorias
            ?.find((c: any) => c.es_principal)
            ?.categoria_id?.toString() ?? "",
        ingredientes:
          producto.ingredientes?.map((i: any) => i.ingrediente_id) ?? [],
        ingredientesRemovibles:
          producto.ingredientes
            ?.filter((i: any) => i.es_removible)
            .map((i: any) => i.ingrediente_id) ?? [],
      });
    }

    cargarProducto();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrores((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleDisponible = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario((prev) => ({
      ...prev,
      disponible: e.target.checked,
    }));
  };

  const handleCategoria = (categoriaId: number, checked: boolean) => {
    setFormulario((prev) => {
      const nuevasCategorias = checked
        ? [...prev.categorias, categoriaId]
        : prev.categorias.filter((id) => id !== categoriaId);

      return {
        ...prev,
        categorias: nuevasCategorias,
        categoriaPrincipal:
          prev.categoriaPrincipal === String(categoriaId) && !checked
            ? ""
            : prev.categoriaPrincipal,
      };
    });

    setErrores((prev) => ({
      ...prev,
      categorias: "",
    }));
  };

  const handleIngrediente = (ingredienteId: number, checked: boolean) => {
    setFormulario((prev) => ({
      ...prev,
      ingredientes: checked
        ? [...prev.ingredientes, ingredienteId]
        : prev.ingredientes.filter((id) => id !== ingredienteId),
      ingredientesRemovibles: checked
        ? prev.ingredientesRemovibles
        : prev.ingredientesRemovibles.filter((id) => id !== ingredienteId),
    }));
  };

  const handleIngredienteRemovible = (
    ingredienteId: number,
    checked: boolean,
  ) => {
    setFormulario((prev) => ({
      ...prev,
      ingredientesRemovibles: checked
        ? [...prev.ingredientesRemovibles, ingredienteId]
        : prev.ingredientesRemovibles.filter((id) => id !== ingredienteId),
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

    if (!formulario.precio_base || Number(formulario.precio_base) <= 0) {
      nuevosErrores.precio_base = "El precio debe ser mayor a 0";
    }

    if (!formulario.stock_cantidad || Number(formulario.stock_cantidad) < 0) {
      nuevosErrores.stock_cantidad = "El stock no puede ser negativo";
    }

    if (formulario.categorias.length === 0) {
      nuevosErrores.categorias = "Debe seleccionar al menos una categoría";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validarErrores()) return;

    const payload: ProductoCreate = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      precio_base: Number(formulario.precio_base),
      stock_cantidad: Number(formulario.stock_cantidad),
      disponible: formulario.disponible,
      imagenes_url: imagenes,
      categorias: formulario.categorias.map((categoriaId) => ({
        categoria_id: categoriaId,
        es_principal: formulario.categoriaPrincipal === String(categoriaId),
      })),
      ingredientes: formulario.ingredientes.map((ingredienteId) => ({
        ingrediente_id: ingredienteId,
        es_removible: formulario.ingredientesRemovibles.includes(ingredienteId),
      })),
    };

    if (id) {
      editar({
        ...payload,
        id: Number(id),
      });
    } else {
      agregar(payload);
    }

    navigate("/productos");
  };

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800">
              {id ? "Editar producto" : "Nuevo producto"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete los datos del producto, sus categorías, ingredientes e
              imágenes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <section className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-5">
                <p className="text-sm text-slate-500">
                  Datos principales del producto.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Nombre
                  </label>
                  <input
                    name="nombre"
                    value={formulario.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Hamburguesa"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  {errores.nombre && (
                    <p className="mt-1 text-sm text-red-500">
                      {errores.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Precio
                  </label>
                  <input
                    name="precio_base"
                    type="number"
                    min="0"
                    value={formulario.precio_base}
                    onChange={handleChange}
                    placeholder="Ej: 100"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  {errores.precio_base && (
                    <p className="mt-1 text-sm text-red-500">
                      {errores.precio_base}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción del producto"
                    className="min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  {errores.descripcion && (
                    <p className="mt-1 text-sm text-red-500">
                      {errores.descripcion}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Stock
                  </label>
                  <input
                    name="stock_cantidad"
                    type="number"
                    min="0"
                    value={formulario.stock_cantidad}
                    onChange={handleChange}
                    placeholder="Ej: 20"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                  {errores.stock_cantidad && (
                    <p className="mt-1 text-sm text-red-500">
                      {errores.stock_cantidad}
                    </p>
                  )}
                </div>

                <div className="flex items-end">
                  <label className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formulario.disponible}
                      onChange={handleDisponible}
                      className="h-4 w-4"
                    />
                    Disponible
                  </label>
                </div>
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-800">
                  Imágenes del producto
                </h3>
                <p className="text-sm text-slate-500">
                  Seleccioná imágenes desde tu computadora.
                </p>
              </div>

              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);

                  const nombresArchivos = files.map((file) => file.name);

                  setFormulario((prev) => ({
                    ...prev,
                    imagenes_url: [...prev.imagenes_url, ...nombresArchivos],
                  }));

                  e.target.value = "";
                }}
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
              />

              {imagenes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {imagenes.map((imagen, index) => (
                    <span
                      key={`${imagen}-${index}`}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {imagen}

                      <button
                        type="button"
                        onClick={() =>
                          setFormulario((prev) => ({
                            ...prev,
                            imagenes_url: prev.imagenes_url.filter(
                              (_, i) => i !== index,
                            ),
                          }))
                        }
                        className="font-bold text-red-500 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Categorias */}
            <section className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-800">
                  Categorías
                </h3>
                <p className="text-sm text-slate-500">
                  Selecciona una o más categorías
                </p>
              </div>

              {errores.categorias && (
                <p className="mb-3 text-sm text-red-500">
                  {errores.categorias}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {categorias.map((categoria) => {
                  const selected = formulario.categorias.includes(categoria.id);

                  return (
                    <div
                      key={categoria.id}
                      className={`rounded-2xl border p-3 transition ${
                        selected
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleCategoria(categoria.id, !selected)}
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                      >
                        <span
                          className={`h-4 w-4 rounded border ${
                            selected
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        />
                        {categoria.nombre}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Ingredientes */}
            <section className="rounded-2xl border border-slate-200 p-5">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-slate-800">
                  Ingredientes
                </h3>
                <p className="text-sm text-slate-500">
                  Selecciona los ingredientes.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {ingredientes.map((ingrediente) => {
                  const selected = formulario.ingredientes.includes(
                    ingrediente.id,
                  );

                  return (
                    <div
                      key={ingrediente.id}
                      className={`rounded-2xl border p-3 transition ${
                        selected
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleIngrediente(ingrediente.id, !selected)
                        }
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                      >
                        <span
                          className={`h-4 w-4 rounded border ${
                            selected
                              ? "border-blue-600 bg-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        />
                        {ingrediente.nombre}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
              <button
                type="button"
                onClick={() => navigate("/productos")}
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
              >
                {id ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
