import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import { useCart } from "../../context/CartContext";
import type { ProductoRead } from "../../models/Producto";

export default function ProductoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [producto, setProducto] = useState<ProductoRead | null>(null);
  const [cargando, setCargando] = useState(true);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/productos/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        setProducto(await res.json());
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  const handleAddToCart = () => {
    if (!producto) return;
    addItem({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio_base,
      imagen: producto.imagenes_url?.[0] ?? undefined,
      personalizacion: [],
      removidos_nombres: [],
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Producto no encontrado.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-4xl space-y-6">
        <button
          type="button"
          onClick={() => navigate("/catalogo")}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← Volver al catálogo
        </button>

        <div className="grid gap-6 rounded-2xl bg-white p-6 shadow md:grid-cols-2">
          {producto.imagenes_url[0] && (
            <img
              src={producto.imagenes_url[0]}
              alt={producto.nombre}
              className="w-full rounded-xl object-cover md:h-80"
            />
          )}

          <div className="flex flex-col justify-between gap-4">
            <div>
              <div className="mb-2 flex items-start justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-800">
                  {producto.nombre}
                </h1>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    producto.disponible
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {producto.disponible ? "Disponible" : "No disponible"}
                </span>
              </div>

              <p className="text-slate-500">
                {producto.descripcion || "Sin descripción"}
              </p>

              {producto.categorias.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {producto.categorias.map((c) => (
                    <span
                      key={c.id}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        c.es_principal
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.nombre}
                    </span>
                  ))}
                </div>
              )}

              {producto.ingredientes.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Ingredientes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {producto.ingredientes.map((ing) => (
                      <span
                        key={ing.id}
                        className={`rounded-full px-3 py-1 text-xs ${
                          ing.es_removible
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ing.nombre}
                        {ing.es_removible && " ✕"}
                      </span>
                    ))}
                  </div>
                  {producto.ingredientes.some((i) => i.es_removible) && (
                    <p className="mt-1 text-xs text-slate-400">
                      ✕ podés pedirlo sin ese ingrediente
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-3xl font-bold text-slate-800">
                ${producto.precio_base.toLocaleString("es-AR")}
              </p>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!producto.disponible}
                className="mt-4 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {agregado ? "¡Agregado al carrito!" : "Agregar al carrito"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
