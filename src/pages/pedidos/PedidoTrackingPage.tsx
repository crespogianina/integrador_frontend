import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { EstadoBadge } from "../../components/EstadoBadge";
import { ModalCancelarPedido } from "../../components/ModalCancelarPedido";
import { WSBadge } from "../../components/WSBadge";
import { OrderTimeline } from "../../components/OrderTimeLine";
import type { EstadoPedido, PedidoDetail } from "../../models/Pedido";
import { ESTADO_LABEL } from "../../models/Pedido";
import {
  accionesAvanceStaff,
  cargarMapaIngredientes,
  esStaff,
  fechaCorta,
  iniciarPagoMercadoPago,
  nombresExclusion,
  precio,
} from "../../lib/pedidosUtils";
import { usePedidosWS } from "../../hooks/usePedidosWS";
import { brand } from "../../lib/brand";

const PEDIDOS_PATH = `${API_BASE}/pedidos/`;

function textoDireccion(pedido: PedidoDetail): string | null {
  const snap = pedido.direccion_snapshot;
  if (snap) {
    const partes = [
      snap.alias,
      snap.linea1,
      snap.linea2,
      snap.ciudad,
      snap.provincia,
      snap.codigo_postal,
    ].filter(Boolean);
    return partes.join(", ");
  }
  if (pedido.direccion) {
    return `${pedido.direccion.linea1}, ${pedido.direccion.ciudad}`;
  }
  return null;
}

export function PedidoTrackingPage() {
  const { id } = useParams();
  const pedidoId = Number(id);
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const staff = esStaff(roles);
  const pageClass = `min-h-screen w-lvw p-6 ${staff ? "bg-slate-100" : brand.pageBg}`;

  const [pedido, setPedido] = useState<PedidoDetail | null>(null);
  const [mapaIngredientes, setMapaIngredientes] = useState<Map<number, string>>(
    new Map(),
  );
  const [cargando, setCargando] = useState(true);
  const [cancelando, setCancelando] = useState(false);
  const [avanzando, setAvanzando] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [errorRequest, setErrorRequest] = useState("");

  const cargarPedido = useCallback(async () => {
    try {
      const res = await apiFetch(`${PEDIDOS_PATH}${pedidoId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Error al cargar el pedido");
      }
      setPedido(await res.json());
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al cargar el pedido",
      );
    } finally {
      setCargando(false);
    }
  }, [pedidoId]);

  useEffect(() => {
    if (!pedidoId) return;
    setCargando(true);
    void cargarPedido();
    void cargarMapaIngredientes().then(setMapaIngredientes);
  }, [pedidoId, cargarPedido]);

  usePedidosWS((evento) => {
    if (evento.pedido_id === pedidoId) void cargarPedido();
  });

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 3000);
    return () => clearTimeout(timer);
  }, [errorRequest]);

  const cancelarCliente = async () => {
    setCancelando(true);
    try {
      const res = await apiFetch(`${PEDIDOS_PATH}${pedidoId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.detail || "El pedido ya no se puede cancelar",
        );
      }
      await cargarPedido();
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "No se pudo cancelar",
      );
    } finally {
      setCancelando(false);
    }
  };

  const cancelarStaff = async (motivo: string) => {
    const res = await apiFetch(`${PEDIDOS_PATH}${pedidoId}/cancelar`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observacion: motivo }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || "No se pudo cancelar");
    }
    await cargarPedido();
  };

  const avanzarEstado = async (nuevoEstado: EstadoPedido) => {
    setAvanzando(true);
    try {
      const res = await apiFetch(`${PEDIDOS_PATH}${pedidoId}/avanzar`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevo_estado: nuevoEstado }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "No se pudo avanzar el estado");
      }
      await cargarPedido();
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "No se pudo avanzar",
      );
    } finally {
      setAvanzando(false);
    }
  };

  const pagar = async () => {
    setPagando(true);
    try {
      await iniciarPagoMercadoPago(pedidoId);
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al pagar",
      );
      setPagando(false);
    }
  };

  if (cargando) {
    return (
      <main className={pageClass}>
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="h-8 w-1/3 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-64 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </main>
    );
  }

  if (!pedido) {
    return (
      <main className={pageClass}>
        <p className="mx-auto max-w-3xl text-center text-slate-500">
          No encontramos el pedido #{pedidoId}.
        </p>
      </main>
    );
  }

  const direccion = textoDireccion(pedido);
  const ultimoPago = pedido.pagos?.[0];
  const pagoRechazado =
    ultimoPago?.mp_status === "rejected" ||
    ultimoPago?.mp_status === "cancelled";
  const esMp = pedido.forma_pago_codigo === "MERCADOPAGO";
  const cancelableCliente =
    !staff &&
    (pedido.estado_codigo === "PENDIENTE" ||
      pedido.estado_codigo === "CONFIRMADO");
  const avancesStaff = accionesAvanceStaff(pedido.estado_codigo, roles);
  const puedeCancelarStaff =
    staff &&
    pedido.estado_codigo !== "ENTREGADO" &&
    pedido.estado_codigo !== "CANCELADO" &&
    (pedido.estado_codigo === "PENDIENTE" ||
      pedido.estado_codigo === "CONFIRMADO" ||
      (pedido.estado_codigo === "EN_PREPARACION" && roles.includes("ADMIN")));

  return (
    <main className={pageClass}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Pedido #{pedido.id}
            </h1>
            <p className="text-sm text-slate-500">
              {fechaCorta(pedido.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <EstadoBadge estado={pedido.estado_codigo} />
            <WSBadge />
          </div>
        </div>

        {staff && (
          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">
            <h2 className="font-semibold text-blue-900">Cliente</h2>
            <p className="mt-1 text-blue-800">
              {pedido.usuario.nombre} {pedido.usuario.apellido}
            </p>
            <p className="text-blue-700">{pedido.usuario.email}</p>
          </section>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 font-semibold text-slate-800">Seguimiento</h2>
            <OrderTimeline
              estadoActual={pedido.estado_codigo}
              historial={pedido.historial_estados}
              mostrarAuditoria={staff}
              variant={staff ? "default" : "brand"}
            />
          </section>

          <div className="space-y-4">
            <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm">
              <h2 className="mb-3 font-semibold text-slate-800">Productos</h2>
              <ul className="space-y-3">
                {pedido.detalles.map((item, i) => {
                  const sin = nombresExclusion(
                    item.personalizacion,
                    mapaIngredientes,
                  );
                  return (
                    <li key={i} className="flex justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-800">
                          {item.cantidad}× {item.nombre_snapshot}
                        </p>
                        {sin && (
                          <p className="text-xs text-slate-500">Sin: {sin}</p>
                        )}
                      </div>
                      <span>{precio(item.subtotal_snap)}</span>
                    </li>
                  );
                })}
              </ul>
              <dl className="mt-3 space-y-1 border-t pt-3">
                <div className="flex justify-between">
                  <dt>Subtotal</dt>
                  <dd>{precio(pedido.subtotal)}</dd>
                </div>
                {pedido.descuento > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <dt>Descuento</dt>
                    <dd>−{precio(pedido.descuento)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <dt>Envío</dt>
                  <dd>{precio(pedido.costo_envio)}</dd>
                </div>
                <div className="flex justify-between pt-1 text-base font-bold">
                  <dt>Total</dt>
                  <dd>{precio(pedido.total)}</dd>
                </div>
              </dl>
            </section>

            {direccion && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm">
                <h2 className="mb-2 font-semibold text-slate-800">Entrega</h2>
                <p className="text-slate-600">{direccion}</p>
              </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm">
              <h2 className="mb-2 font-semibold text-slate-800">Pago</h2>
              <p className="text-slate-600">
                Forma:{" "}
                <span className="font-medium">
                  {pedido.forma_pago?.descripcion ?? pedido.forma_pago_codigo}
                </span>
              </p>
              {ultimoPago && (
                <p className="mt-1 text-slate-600">
                  Estado MP:{" "}
                  <span className="font-medium">{ultimoPago.mp_status}</span>
                </p>
              )}
            </section>

            {pedido.notas && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 text-sm">
                <h2 className="mb-2 font-semibold text-slate-800">Notas</h2>
                <p className="text-slate-600">{pedido.notas}</p>
              </section>
            )}

            {!staff && pedido.estado_codigo === "PENDIENTE" && esMp && (
              <button
                type="button"
                disabled={pagando}
                onClick={() => void pagar()}
                className={`w-full rounded-lg py-2.5 font-semibold ${brand.solid} disabled:opacity-50`}
              >
                {pagando ? "Redirigiendo…" : "Pagar con MercadoPago"}
              </button>
            )}

            {!staff && pedido.estado_codigo === "PENDIENTE" && !esMp && (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <p className="font-medium">Pago en efectivo</p>
                <p className="mt-1">
                  Abonás al recibir tu pedido. El local confirmará tu pedido a
                  la brevedad.
                </p>
              </div>
            )}

            {!staff &&
              pagoRechazado &&
              pedido.estado_codigo === "PENDIENTE" && (
                <button
                  type="button"
                  disabled={pagando}
                  onClick={() => void pagar()}
                  className="w-full rounded-lg border border-amber-400 bg-amber-50 py-2.5 font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                >
                  {pagando ? "Redirigiendo…" : "Reintentar pago"}
                </button>
              )}

            {staff && (avancesStaff.length > 0 || puedeCancelarStaff) && (
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-slate-800">
                  Acciones
                </h2>
                <div className="flex flex-wrap gap-2">
                  {avancesStaff.map((sig) => (
                    <button
                      key={sig}
                      type="button"
                      disabled={avanzando}
                      onClick={() => void avanzarEstado(sig)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      → {ESTADO_LABEL[sig]}
                    </button>
                  ))}
                  {puedeCancelarStaff && (
                    <button
                      type="button"
                      onClick={() => setModalCancelar(true)}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Cancelar pedido
                    </button>
                  )}
                </div>
              </section>
            )}

            {cancelableCliente && (
              <button
                type="button"
                onClick={() => void cancelarCliente()}
                disabled={cancelando}
                className="w-full rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {cancelando ? "Cancelando…" : "Cancelar pedido"}
              </button>
            )}

            {staff && (
              <Link
                to="/admin/pedidos"
                className="block text-center text-sm text-blue-600 hover:underline"
              >
                ← Volver al tablero
              </Link>
            )}
          </div>
        </div>

        <ModalCancelarPedido
          pedidoId={pedido.id}
          abierto={modalCancelar}
          onCerrar={() => setModalCancelar(false)}
          onConfirmar={cancelarStaff}
        />

        {errorRequest && (
          <div className="fixed bottom-10 right-5 z-50">
            <div className="rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
              {errorRequest}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
