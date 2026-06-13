import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import { useCart } from "../../context/CartContext";
import type { CrearPedidoRequest, PedidoRead } from "../../models/Pedido";

interface Direccion {
  id: number;
  alias?: string | null;
  linea1: string;
  ciudad: string;
  es_principal: boolean;
}

interface DireccionListResponse {
  data: Direccion[];
  total: number;
}

const precio = (n: number) =>
  Number.isFinite(n)
    ? n.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
      })
    : "$0";

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, costoEnvio, total, clear } = useCart();

  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [direccionId, setDireccionId] = useState<number | null>(null);
  const [formaPago, setFormaPago] = useState<string>("MP");
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorRequest, setErrorRequest] = useState("");

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/direcciones/`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const body: DireccionListResponse | Direccion[] = await res.json();
        const lista = Array.isArray(body) ? body : (body.data ?? []);
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
    setEnviando(true);
    try {
      const body: CrearPedidoRequest = {
        items: items.map((i) => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad,
          personalizacion: i.personalizacion,
        })),
        forma_pago_codigo: formaPago,
        direccion_id: direccionId,
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
      <main className="min-h-screen w-lvw bg-slate-100 p-6">
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="font-medium text-slate-700">Tu carrito está vacío</p>
          <Link
            to="/productos"
            className="mt-3 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white"
          >
            Ir al catálogo
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <h1 className="text-2xl font-bold text-slate-800">Checkout</h1>

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
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="direccion"
                      checked={direccionId === d.id}
                      onChange={() => setDireccionId(d.id)}
                      className="accent-blue-600"
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

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-800">
              ¿Cómo querés pagar?
            </h2>
            <div className="space-y-2">
              {[
                {
                  codigo: "MP",
                  label: "MercadoPago — tarjeta, débito o dinero en cuenta",
                },
                { codigo: "EFECTIVO", label: "Efectivo al recibir" },
              ].map((f) => (
                <label
                  key={f.codigo}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${
                    formaPago === f.codigo
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="forma_pago"
                    checked={formaPago === f.codigo}
                    onChange={() => setFormaPago(f.codigo)}
                    className="accent-blue-600"
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 text-sm">
          <h2 className="mb-3 font-semibold text-slate-800">Tu pedido</h2>
          <ul className="space-y-2">
            {items.map((i, idx) => (
              <li key={idx} className="flex justify-between gap-2">
                <span className="text-slate-600">
                  {i.cantidad}× {i.nombre}
                  {(i.removidos_nombres ?? []).length > 0 && (
                    <span className="block text-xs text-slate-400">
                      sin {(i.removidos_nombres ?? []).join(", sin ")}
                    </span>
                  )}
                </span>
                <span>{precio(i.precio * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t pt-3">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{precio(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-slate-500">
              <dt>Envío</dt>
              <dd>
                {costoEnvio === 0 ? (
                  <span className="font-medium text-emerald-600">¡Gratis!</span>
                ) : (
                  precio(costoEnvio)
                )}
              </dd>
            </div>
            <div className="flex justify-between pt-1 text-base font-bold">
              <dt>Total</dt>
              <dd>{precio(total)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={confirmarPedido}
            disabled={enviando}
            className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {enviando
              ? "Procesando…"
              : formaPago === "MP"
                ? "Confirmar y pagar"
                : "Confirmar pedido"}
          </button>
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
