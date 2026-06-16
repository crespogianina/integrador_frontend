import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import { useCart } from "../../context/CartContext";
import type { CrearPedidoRequest, PedidoRead } from "../../models/Pedido";
import type { ProductoRead } from "../../models/Producto";
import { brand } from "../../lib/brand";

interface Direccion {
  id: number;
  alias?: string | null;
  linea1: string;
  ciudad: string;
  es_principal: boolean;
}

const precio = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      })
    : "$0";

const UMBRAL_ENVIO_GRATIS = 10000;
const COSTO_ENVIO_FIJO = 500;
const FORMAS_PAGO_CON_ENVIO = ["MERCADOPAGO"];

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    clear,
    setCantidad,
    removeItem,
    itemKey,
    actualizarStocks,
    stockDisponible,
    cantidadEnCarrito,
  } = useCart();
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionId, setDireccionId] = useState<number | null>(null);
  const [formaPago, setFormaPago] = useState<string>("MERCADOPAGO");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorRequest, setErrorRequest] = useState("");

  const costoEnvioLocal =
    !FORMAS_PAGO_CON_ENVIO.includes(formaPago) || direccionId === null
      ? 0
      : subtotal >= UMBRAL_ENVIO_GRATIS
        ? 0
        : COSTO_ENVIO_FIJO;

  const totalLocal = subtotal + costoEnvioLocal;

  const productoIds = useMemo(
    () => [...new Set(items.map((i) => i.producto_id))],
    [items],
  );

  useEffect(() => {
    if (productoIds.length === 0) return;

    const cargarStocks = async () => {
      const stocks: Record<number, number> = {};

      await Promise.all(
        productoIds.map(async (id) => {
          try {
            const res = await apiFetch(`${API_BASE}/productos/${id}`, {
              credentials: "include",
            });
            if (!res.ok) return;
            const producto: ProductoRead = await res.json();
            stocks[id] = producto.stock_cantidad ?? 0;
          } catch {
            /* ignorar */
          }
        }),
      );

      if (Object.keys(stocks).length > 0) {
        actualizarStocks(stocks);
      }
    };

    cargarStocks();
  }, [productoIds, actualizarStocks]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/direcciones/`, {
          credentials: "include",
        });
        if (!res.ok) return;

        const json = await res.json();

        const lista: Direccion[] = Array.isArray(json)
          ? json
          : (json.data ?? []);

        setDirecciones(lista);
        const principal = lista.find((d) => d.es_principal) ?? lista[0];
        if (principal) setDireccionId(principal.id);
      } catch {}
    };
    cargar();
  }, []);

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 3000);
    return () => clearTimeout(timer);
  }, [errorRequest]);

  const confirmarPedido = async () => {
    if (FORMAS_PAGO_CON_ENVIO.includes(formaPago) && direccionId === null) {
      setErrorRequest("MercadoPago requiere una dirección de entrega.");
      return;
    }

    setEnviando(true);
    try {
      const cantidadPorProducto = new Map<number, number>();

      for (const item of items) {
        cantidadPorProducto.set(
          item.producto_id,
          (cantidadPorProducto.get(item.producto_id) ?? 0) + item.cantidad,
        );
      }

      for (const [productoId, cantidadTotal] of cantidadPorProducto) {
        const res = await apiFetch(`${API_BASE}/productos/${productoId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const item = items.find((i) => i.producto_id === productoId);
          throw new Error(`El producto "${item?.nombre ?? productoId}" ya no existe.`);
        }

        const producto: ProductoRead = await res.json();

        if (!producto.disponible) {
          throw new Error(
            `"${producto.nombre}" ya no está disponible. Quitálo del carrito para continuar.`,
          );
        }

        if ((producto.stock_cantidad ?? 0) < cantidadTotal) {
          throw new Error(
            `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock_cantidad ?? 0}, en carrito: ${cantidadTotal}.`,
          );
        }
      }

      const body: CrearPedidoRequest = {
        items: items.map((i) => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad,
          personalizacion: i.personalizacion,
        })),
        forma_pago_codigo: formaPago,
        direccion_id: FORMAS_PAGO_CON_ENVIO.includes(formaPago) ? direccionId : null,
        notas: notas.trim() || null,
      };

      const res = await apiFetch(`${API_BASE}/pedidos/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "No pudimos crear el pedido");
      }

      const pedido: PedidoRead = await res.json();
      clear();
      navigate(`/pedidos/confirmacion/${pedido.id}`);
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al confirmar el pedido",
      );
      setEnviando(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className={`min-h-screen w-lvw p-6 ${brand.pageBg}`}>
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="font-medium text-slate-700">Tu carrito está vacío</p>
          <Link
            to="/catalogo"
            className={`mt-3 inline-block rounded-lg px-5 py-2 text-sm font-semibold ${brand.solid}`}
          >
            Ir al catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen w-lvw p-6 ${brand.pageBg}`}>
      <section className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <h1 className="text-2xl font-bold text-slate-800">Checkout</h1>

          {FORMAS_PAGO_CON_ENVIO.includes(formaPago) ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-slate-800">
                ¿Dónde entregamos?
              </h2>
              {direcciones.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No tenés direcciones guardadas — podés continuar igual y
                  coordinar la entrega.
                </p>
              ) : (
                <div className="space-y-2">
                  {direcciones.map((d) => (
                    <label
                      key={d.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${
                        direccionId === d.id
                          ? brand.selectedOption
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="direccion"
                        checked={direccionId === d.id}
                        onChange={() => setDireccionId(d.id)}
                        className={brand.accent}
                      />
                      <span>
                        <span className="font-medium">
                          {d.alias ?? "Dirección"}
                        </span>
                        {d.es_principal && (
                          <span className="ml-1 text-xs text-emerald-600">
                            · principal
                          </span>
                        )}
                        <span className="block text-slate-500">
                          {d.linea1}, {d.ciudad}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-slate-800">Retiro</h2>
              <p className="text-sm text-slate-600">
                El pedido se retira en el local. Te avisamos cuando esté listo.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-800">
              ¿Cómo querés pagar?
            </h2>
            <div className="space-y-2">
              {[
                {
                  codigo: "MERCADOPAGO",
                  label: "MercadoPago — tarjeta, débito o dinero en cuenta",
                },
                { codigo: "EFECTIVO", label: "Efectivo al recibir" },
              ].map((f) => (
                <label
                  key={f.codigo}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${
                    formaPago === f.codigo
                      ? brand.selectedOption
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="forma_pago"
                    checked={formaPago === f.codigo}
                    onChange={() => setFormaPago(f.codigo)}
                    className={brand.accent}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-800">
              Notas para el pedido
            </h2>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: tocar timbre del fondo"
              rows={2}
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ${brand.inputFocusSm}`}
            />
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 text-sm">
          <h2 className="mb-3 font-semibold text-slate-800">Tu pedido</h2>

          <ul className="space-y-3">
            {items.map((i) => {
              const key = itemKey(i);
              const stock = stockDisponible(i.producto_id);
              const totalProducto = cantidadEnCarrito(i.producto_id);
              const enTope = stock !== null && totalProducto >= stock;

              return (
                <li
                  key={key}
                  className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-slate-700">
                      {i.nombre}
                    </span>
                    <span className="shrink-0 text-slate-600">
                      {precio(i.precio * i.cantidad)}
                    </span>
                  </div>

                  {i.removidos_nombres.length > 0 && (
                    <span className="text-xs text-slate-400">
                      sin {i.removidos_nombres.join(", sin ")}
                    </span>
                  )}

                  {stock !== null && (
                    <span className="text-xs text-slate-500">
                      Stock disponible: {stock}
                      {totalProducto > 0 && ` · En carrito: ${totalProducto}`}
                    </span>
                  )}

                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCantidad(key, i.cantidad - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      −
                    </button>

                    <span className="w-5 text-center text-sm font-medium">
                      {i.cantidad}
                    </span>

                    <button
                      type="button"
                      onClick={() => setCantidad(key, i.cantidad + 1)}
                      disabled={enTope}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      title={
                        enTope ? "Alcanzaste el stock disponible" : undefined
                      }
                    >
                      +
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(key)}
                      className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-red-400 hover:bg-red-50"
                      aria-label="Eliminar"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <dl className="mt-3 space-y-1 border-t pt-3">
            {FORMAS_PAGO_CON_ENVIO.includes(formaPago) && (
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{precio(subtotal)}</dd>
              </div>
            )}
            {FORMAS_PAGO_CON_ENVIO.includes(formaPago) && (
              <div className="flex justify-between text-slate-500">
                <dt>Envío</dt>
                <dd>
                  {direccionId === null ? (
                    <span className="text-slate-400 italic">sin dirección</span>
                  ) : costoEnvioLocal === 0 ? (
                    <span className="font-medium text-emerald-600">¡Gratis!</span>
                  ) : (
                    precio(costoEnvioLocal)
                  )}
                </dd>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-bold">
              <dt>Total</dt>
              <dd>{precio(totalLocal)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={confirmarPedido}
            disabled={
              enviando ||
              (FORMAS_PAGO_CON_ENVIO.includes(formaPago) &&
                direccionId === null)
            }
            className={`mt-4 w-full rounded-lg py-2.5 font-semibold ${brand.solid} disabled:opacity-60`}
          >
            {enviando
              ? "Procesando…"
              : formaPago === "MERCADOPAGO"
                ? "Confirmar y pagar"
                : "Confirmar pedido"}
          </button>
          {FORMAS_PAGO_CON_ENVIO.includes(formaPago) &&
            direccionId === null && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                MercadoPago requiere una dirección de entrega.
              </p>
            )}
        </aside>
      </section>

      {errorRequest && (
        <div className="fixed bottom-10 right-5 z-50">
          <div className="rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
            {errorRequest}
          </div>
        </div>
      )}
    </main>
  );
}
