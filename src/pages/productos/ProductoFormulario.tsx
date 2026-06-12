import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductos } from "../../context/ProductoContext";
import { useCategorias } from "../../context/CategoriaContext";
import { useIngredientes } from "../../context/IngredienteContext";
import type {
  ProductoIngredienteCreate,
  ProductoRead,
} from "../../models/Producto";
import { apiFetch } from "../../config/api";
import ProductoIngredienteFormulario from "./ProductoIngredienteFormulario";
import ProductoCategoriaFormulario from "../../components/ArbolCategoria";
import type { CategoriaTreeRead } from "../../models/Categoria";

const API_PRODUCTOS = "http://localhost:8000/api/v1/productos/";

const initialState = {
  nombre: "",
  descripcion: "",
  precio_base: "",
  cantidad: "",
  disponible: true,
  es_producto_final: false,
  imagenes_url: [] as string[],
  categorias: [] as number[],
  categoriaPrincipal: 0,
  ingredientes: [] as ProductoIngredienteCreate[],
};

export default function ProductoFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { agregar, editar, unidadesMedida } = useProductos();
  const { cargarCategoriasArbol } = useCategorias();
  const { cargarIngredientes, ingredientes } = useIngredientes();
  const [categoriasArbol, setCategoriasArbol] = useState<CategoriaTreeRead[]>(
    [],
  );
  const [formulario, setFormulario] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorRequest, setErrorRequest] = useState("");

  const precioSugerido =
    formulario.ingredientes.reduce((total, item) => {
      const ing = ingredientes.find((i) => i.id === item.ingrediente_id);
      if (!ing) return total;
      return total + Number(ing.precio_base) * Number(item.cantidad);
    }, 0) * 1.3;

  useEffect(() => {
    cargarCategoriaArbol();
    cargarIngredientes(1, 50, "");
  }, []);

  useEffect(() => {
    if (!errorRequest) return;

    const timer = setTimeout(() => {
      setErrorRequest("");
    }, 2500);

    return () => clearTimeout(timer);
  }, [errorRequest]);

  useEffect(() => {
    if (!id) return;

    async function cargarProducto() {
      try {
        const res = await apiFetch(`${API_PRODUCTOS}${id}`);

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.detail || "Error al cargar el producto");
        }

        const producto: ProductoRead = await res.json();

        setFormulario({
          nombre: producto.nombre ?? "",
          descripcion: producto.descripcion ?? "",
          precio_base: String(producto.precio_base ?? ""),
          cantidad: String(producto.stock_cantidad ?? ""),
          disponible: producto.disponible ?? true,
          es_producto_final: producto.es_producto_final,
          imagenes_url: producto.imagenes_url ?? [],
          categorias: producto.categorias?.map((c) => c.id) ?? [],
          categoriaPrincipal:
            producto.categorias?.find((c) => c.es_principal)?.id ?? 0,

          ingredientes:
            producto.ingredientes?.map((i) => ({
              ingrediente_id: i.id,
              es_removible: i.es_removible,
              unidad_medida_id: i.unidad_medida_id,
              cantidad: i.cantidad,
            })) ?? [],
        });
      } catch (error) {
        setErrorRequest(
          error instanceof Error
            ? error.message
            : "Error al cargar el producto",
        );
      }
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

  const handleProductoFinal = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormulario((prev) => ({
      ...prev,
      es_producto_final: e.target.checked,
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
          !checked && prev.categoriaPrincipal === categoriaId
            ? 0
            : prev.categoriaPrincipal,
      };
    });

    setErrores((prev) => ({
      ...prev,
      categorias: "",
      categoriaPrincipal: "",
    }));
  };

  const marcarCategoriaPrincipal = (categoriaId: number) => {
    setFormulario((prev) => ({
      ...prev,
      categoriaPrincipal:
        prev.categoriaPrincipal === categoriaId ? 0 : categoriaId,
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

    // if (
    //   formulario.stock_cantidad === "" ||
    //   Number(formulario.stock_cantidad) < 0
    // ) {
    //   nuevosErrores.stock_cantidad = "El stock no puede ser negativo";
    // }

    if (formulario.categorias.length === 0) {
      nuevosErrores.categorias = "Debe seleccionar al menos una categoría";
    }

    if (formulario.categorias.length > 0 && !formulario.categoriaPrincipal) {
      nuevosErrores.categoriaPrincipal =
        "Debe marcar una categoría como principal";
    }

    if (formulario.ingredientes.length === 0 && !formulario.es_producto_final) {
      nuevosErrores.ingredientes =
        "Debe agregar al menos un ingrediente o marcar al producto como consumo final";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validarErrores()) return;

    const payload = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      precio_base: Number(formulario.precio_base),
      disponible: formulario.disponible,
      imagenes_url: formulario.imagenes_url,
      categorias: formulario.categorias.map((categoriaId) => ({
        categoria_id: categoriaId,
        es_principal: formulario.categoriaPrincipal === categoriaId,
      })),
      ingredientes: formulario.ingredientes.map((item) => ({
        ingrediente_id: item.ingrediente_id,
        es_removible: item.es_removible,
        cantidad: Number(item.cantidad),
        unidad_medida_id: item.unidad_medida_id,
      })),
    };

    try {
      if (id) {
        await editar({
          ...payload,
          id: Number(id),
        });
      } else {
        await agregar(payload);
      }

      navigate("/productos");
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al guardar el producto",
      );
    }
  };

  const datosDe = (id: number) => {
    console.log("datos de funcion", id);
    return ingredientes?.find((i) => i.id === id);
  };

  const factorDe = (unidadId: number) =>
    Number(unidadesMedida.find((u) => u.id === unidadId)?.factor ?? 1);

  const stockEstimado = (() => {
    const unidadesPosibles: number[] = [];

    for (const item of formulario.ingredientes) {
      const ing = datosDe(item.ingrediente_id);
      console.log("ingrediente_id", item.ingrediente_id);
      console.log("resultado", datosDe(item.ingrediente_id));
      const cantidad = Number(item.cantidad);
      console.log("ing", ing);
      console.log("cantidad", cantidad);

      if (!ing || !cantidad || cantidad <= 0) continue;

      const stockEnBase =
        Number(ing.stock_cantidad) * factorDe(ing.unidad_medida_id);
      console.log("stockEnBase", stockEnBase);
      const necesarioEnBase = cantidad * factorDe(item.unidad_medida_id);
      console.log("necesarioEnBase", necesarioEnBase);

      console.log("unidadesPosibles", unidadesPosibles);
      unidadesPosibles.push(Math.floor(stockEnBase / necesarioEnBase));
    }

    return unidadesPosibles.length > 0 ? Math.min(...unidadesPosibles) : 0;
  })();

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
      <section className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800">
              {id ? "Editar producto" : "Nuevo producto"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Complete los datos del producto, sus categorías, ingredientes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <section className="rounded-2xl border border-slate-200 p-5">
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
                    step="0.01"
                    value={formulario.precio_base}
                    onChange={handleChange}
                    placeholder="Ej: 100"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />

                  {formulario.ingredientes.length > 0 && (
                    <p className="mt-1 text-sm text-slate-500">
                      Precio sugerido (costo + 30%):
                      <span className="ml-1 font-semibold text-blue-600">
                        ${precioSugerido.toFixed(2)}
                      </span>
                    </p>
                  )}

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
                    Stock {id ? "actual" : "estimado"}
                  </label>
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700">
                    {id ? formulario.cantidad : stockEstimado}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    El stock se calcula automáticamente según los ingredientes.
                  </p>
                </div>

                {/* <div className="flex items-end">
                  <label className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formulario.es_producto_final}
                      onChange={handleProductoFinal}
                      className="h-4 w-4"
                    />
                    Es un producto consumo final
                  </label>
                </div> */}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-800">
                Imágenes del producto
              </h3>

              <input
                type="file"
                multiple
                accept="image/*"
                className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);

                  const urls = files.map((file) => URL.createObjectURL(file));

                  setFormulario((prev) => ({
                    ...prev,
                    imagenes_url: [...prev.imagenes_url, ...urls],
                  }));

                  e.target.value = "";
                }}
              />

              {formulario.imagenes_url.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {formulario.imagenes_url.map((imagen, index) => (
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

            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="text-base font-semibold text-slate-800">
                Categorías
              </h3>
              <p className="text-sm text-slate-500">
                Selecciona una o más categorías y marcá una como principal.
              </p>

              {errores.categorias && (
                <p className="mt-3 text-sm text-red-500">
                  {errores.categorias}
                </p>
              )}
              {errores.categoriaPrincipal && (
                <p className="mt-3 text-sm text-red-500">
                  {errores.categoriaPrincipal}
                </p>
              )}

              <ProductoCategoriaFormulario
                categorias={categoriasArbol}
                selectedIds={formulario.categorias}
                categoriaPrincipal={formulario.categoriaPrincipal}
                onToggle={handleCategoria}
                onMarcarPrincipal={marcarCategoriaPrincipal}
              />
            </section>

            <ProductoIngredienteFormulario
              value={formulario.ingredientes}
              onChange={(val) =>
                setFormulario((prev) => ({ ...prev, ingredientes: val }))
              }
            />

            {errores.ingredientes && (
              <p className="mt-1 text-sm text-red-500">
                {errores.ingredientes}
              </p>
            )}

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
