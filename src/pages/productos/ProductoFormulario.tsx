import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProductos } from "../../context/ProductoContext";
import { useCategorias } from "../../context/CategoriaContext";
import { useIngredientes } from "../../context/IngredienteContext";
import type {
  ProductoIngredienteCreate,
  ProductoRead,
} from "../../models/Producto";
import { API_BASE, apiFetch } from "../../config/api";
import ImageUploader from "../../components/ImageUploader";
import ProductoIngredienteFormulario from "./ProductoIngredienteFormulario";
import ProductoCategoriaFormulario from "../../components/ArbolCategoria";
import type { CategoriaTreeRead } from "../../models/Categoria";

const API_PRODUCTOS = `${API_BASE}/productos/`;

const initialState = {
  nombre: "",
  descripcion: "",
  precio_base: "",
  stock_cantidad: "",
  disponible: true,
  es_producto_final: false,
  imagenes_url: [] as string[],
  categorias: [] as number[],
  categoriaPrincipal: 0,
  ingredientes: [] as ProductoIngredienteCreate[],
};

const inputClass = (hayError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
    hayError
      ? "border-red-500 bg-red-50"
      : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
  }`;

export default function ProductoFormulario() {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    agregar,
    editar,
    actualizarImagenes,
    unidadesMedida,
    obtenerUnidadesMedida,
  } = useProductos();
  const { cargarCategoriasArbol } = useCategorias();
  const { cargarIngredientes, ingredientes } = useIngredientes();

  const [categoriasArbol, setCategoriasArbol] = useState<CategoriaTreeRead[]>(
    [],
  );
  const [formulario, setFormulario] = useState(initialState);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorRequest, setErrorRequest] = useState("");

  const factorDe = (unidadId: number) =>
    Number(unidadesMedida.find((u) => u.id === unidadId)?.factor ?? 1);

  const precioSugerido = useMemo(() => {
    if (formulario.es_producto_final) return 0;
    return (
      formulario.ingredientes.reduce((total, item) => {
        const ing = ingredientes.find((i) => i.id === item.ingrediente_id);
        if (!ing) return total;
        const precioPorBase =
          Number(ing.precio_base) / factorDe(ing.unidad_medida_id);
        const cantidadEnBase =
          Number(item.cantidad) * factorDe(item.unidad_medida_id);
        return total + precioPorBase * cantidadEnBase;
      }, 0) * 1.3
    );
  }, [
    formulario.ingredientes,
    formulario.es_producto_final,
    ingredientes,
    unidadesMedida,
  ]);

  const stockEstimado = useMemo(() => {
    if (formulario.es_producto_final) return null;

    const unidadesPosibles: number[] = [];

    for (const item of formulario.ingredientes) {
      const ing = ingredientes.find((i) => i.id === item.ingrediente_id);
      const cantidad = Number(item.cantidad);
      if (!ing || !cantidad || cantidad <= 0) continue;

      const stockEnBase =
        Number(ing.stock_cantidad) * factorDe(ing.unidad_medida_id);
      const necesarioEnBase = cantidad * factorDe(item.unidad_medida_id);
      unidadesPosibles.push(Math.floor(stockEnBase / necesarioEnBase));
    }

    return unidadesPosibles.length > 0 ? Math.min(...unidadesPosibles) : 0;
  }, [
    formulario.ingredientes,
    formulario.es_producto_final,
    ingredientes,
    unidadesMedida,
  ]);

  useEffect(() => {
    cargarCategoriaArbol();
    cargarIngredientes(1, 50, "");
    obtenerUnidadesMedida();
  }, []);

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 2500);
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
        const esFinal = producto.es_producto_final ?? false;

        setFormulario({
          nombre: producto.nombre ?? "",
          descripcion: producto.descripcion ?? "",
          precio_base: String(producto.precio_base ?? ""),
          stock_cantidad: String(producto.stock_cantidad ?? 0),
          disponible: producto.disponible ?? true,
          es_producto_final: esFinal,
          imagenes_url: producto.imagenes_url ?? [],
          categorias: producto.categorias?.map((c) => c.id) ?? [],
          categoriaPrincipal:
            producto.categorias?.find((c) => c.es_principal)?.id ?? 0,
          ingredientes: esFinal
            ? []
            : (producto.ingredientes?.map((i) => {
                const unidad = unidadesMedida.find(
                  (u) => u.id === i.unidad_medida_id,
                );
                const permiteDecimales =
                  unidad?.tipo === "peso" || unidad?.tipo === "volumen";
                const cantidadNum = Number(i.cantidad);
                return {
                  ingrediente_id: i.id,
                  es_removible: i.es_removible,
                  unidad_medida_id: i.unidad_medida_id,
                  cantidad: permiteDecimales
                    ? cantidadNum
                    : Math.round(cantidadNum),
                };
              }) ?? []),
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
    setFormulario((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
  };

  const handleEsProductoFinal = (checked: boolean) => {
    setFormulario((prev) => ({
      ...prev,
      es_producto_final: checked,
      ingredientes: checked ? [] : prev.ingredientes,
      stock_cantidad: checked ? prev.stock_cantidad : "",
    }));
    setErrores((prev) => ({ ...prev, ingredientes: "", stock_cantidad: "" }));
  };

  const handleCategoria = (categoriaId: number, checked: boolean) => {
    setFormulario((prev) => {
      const nuevasCategorias = checked
        ? [...prev.categorias, categoriaId]
        : prev.categorias.filter((cid) => cid !== categoriaId);
      return {
        ...prev,
        categorias: nuevasCategorias,
        categoriaPrincipal:
          !checked && prev.categoriaPrincipal === categoriaId
            ? 0
            : prev.categoriaPrincipal,
      };
    });
    setErrores((prev) => ({ ...prev, categorias: "", categoriaPrincipal: "" }));
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

    if (!formulario.nombre.trim())
      nuevosErrores.nombre = "El nombre es obligatorio";

    if (!formulario.descripcion.trim())
      nuevosErrores.descripcion = "La descripción es obligatoria";

    if (!formulario.precio_base || Number(formulario.precio_base) <= 0)
      nuevosErrores.precio_base = "El precio debe ser mayor a 0";

    if (formulario.categorias.length === 0)
      nuevosErrores.categorias = "Debe seleccionar al menos una categoría";

    if (formulario.categorias.length > 0 && !formulario.categoriaPrincipal)
      nuevosErrores.categoriaPrincipal =
        "Debe marcar una categoría como principal";

    if (formulario.es_producto_final) {
      if (
        formulario.stock_cantidad === "" ||
        Number(formulario.stock_cantidad) < 0
      ) {
        nuevosErrores.stock_cantidad = "El stock debe ser 0 o mayor";
      }
    } else {
      if (formulario.ingredientes.length === 0) {
        nuevosErrores.ingredientes = "Debe agregar al menos un ingrediente";
      } else if (
        formulario.ingredientes.some((item) => {
          const num = Number(item.cantidad);
          return isNaN(num) || num <= 0;
        })
      ) {
        nuevosErrores.ingredientes =
          "Todas las cantidades deben ser mayores a 0";
      }
    }

    setErrores(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrorRequest("Tiene errores en el formulario");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validarErrores()) return;

    const payload = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim(),
      precio_base: Number(Number(formulario.precio_base).toFixed(2)),
      disponible: formulario.disponible,
      es_producto_final: formulario.es_producto_final,
      ...(formulario.es_producto_final
        ? { stock_cantidad: Number(formulario.stock_cantidad) }
        : {}),
      categorias: formulario.categorias.map((categoriaId) => ({
        categoria_id: categoriaId,
        es_principal: formulario.categoriaPrincipal === categoriaId,
      })),
      ingredientes: formulario.es_producto_final
        ? []
        : formulario.ingredientes.map((item) => {
            const unidad = unidadesMedida.find(
              (u) => u.id === item.unidad_medida_id,
            );
            const permiteDecimales =
              unidad?.tipo === "peso" || unidad?.tipo === "volumen";
            const cantidadNum = Number(item.cantidad);
            const cantidadValida = isNaN(cantidadNum) ? 0 : cantidadNum;
            return {
              ingrediente_id: item.ingrediente_id,
              es_removible: item.es_removible,
              cantidad: permiteDecimales
                ? Number(cantidadValida.toFixed(3))
                : Math.round(cantidadValida),
              unidad_medida_id: item.unidad_medida_id,
            };
          }),
    };

    try {
      let productoId: number;

      if (id) {
        productoId = Number(id);
        await editar({ ...payload, id: productoId });
      } else {
        const nuevo = await agregar({ ...payload, imagenes_url: [] });
        productoId = nuevo.id;
      }

      await actualizarImagenes(productoId, formulario.imagenes_url);
      navigate("/productos");
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al guardar el producto",
      );
    }
  };

  const cargarCategoriaArbol = async () => {
    try {
      const categorias = await cargarCategoriasArbol();
      setCategoriasArbol(categorias);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "No se pudo cargar las categorías",
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
              Complete los datos del producto, sus categorías e ingredientes.
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
                    className={inputClass(Boolean(errores.nombre))}
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
                    className={inputClass(Boolean(errores.precio_base))}
                  />
                  {!formulario.es_producto_final &&
                    formulario.ingredientes.length > 0 && (
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
                    className={inputClass(Boolean(errores.descripcion))}
                  />
                  {errores.descripcion && (
                    <p className="mt-1 text-sm text-red-500">
                      {errores.descripcion}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={formulario.es_producto_final}
                      onChange={(e) => handleEsProductoFinal(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Producto final (sin ingredientes)
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        El stock se define al crear y se actualiza desde el
                        panel de stock. No requiere ingredientes ni se calcula
                        automáticamente.
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Stock{" "}
                    {formulario.es_producto_final
                      ? "inicial"
                      : id
                        ? "actual"
                        : "estimado"}
                  </label>

                  {formulario.es_producto_final ? (
                    <>
                      <input
                        name="stock_cantidad"
                        type="number"
                        min="0"
                        value={formulario.stock_cantidad}
                        onChange={handleChange}
                        placeholder="Ej: 10"
                        className={inputClass(Boolean(errores.stock_cantidad))}
                      />
                      {errores.stock_cantidad && (
                        <p className="mt-1 text-sm text-red-500">
                          {errores.stock_cantidad}
                        </p>
                      )}
                      {id && (
                        <p className="mt-1 text-xs text-slate-400">
                          Para ajustes posteriores usá el panel de control de
                          stock.
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-700">
                        {stockEstimado ?? 0}
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        Se calcula automáticamente según los ingredientes.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <h3 className="mb-3 text-base font-semibold text-slate-800">
                Imágenes del producto
              </h3>
              <ImageUploader
                multiple
                maxFiles={10}
                value={formulario.imagenes_url}
                onChange={(urls) =>
                  setFormulario((prev) => ({ ...prev, imagenes_url: urls }))
                }
              />
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

            {!formulario.es_producto_final && (
              <ProductoIngredienteFormulario
                value={formulario.ingredientes}
                onChange={(val) =>
                  setFormulario((prev) => ({ ...prev, ingredientes: val }))
                }
              />
            )}

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
