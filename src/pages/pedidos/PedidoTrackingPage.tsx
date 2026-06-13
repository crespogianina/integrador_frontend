import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import { EstadoBadge } from "../../components/EstadoBadge";
import { WSBadge } from "../../components/WSBadge";
import { OrderTimeline } from "../../components/OrderTimeLine";
import type { PedidoDetail } from "../../models/Pedido";
import { usePedidosWS } from "../../hooks/usePedidosWS";
const PEDIDOS_PATH = `${API_BASE}/pedidos/`;

const precio = (n: number) =>
  Number(n).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

export function PedidoTrackingPage() {
  const { id } = useParams();
  const pedidoId = Number(id);

  const [pedido, setPedido] = useState<PedidoDetail | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cancelando, setCancelando] = useState(false);
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
    cargarPedido();
  }, [pedidoId, cargarPedido]);

  usePedidosWS((evento) => {
    if (evento.pedido_id === pedidoId) cargarPedido();
  });

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 2500);
    return () => clearTimeout(timer);
  }, [errorRequest]);

  const cancelar = async () => {
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

  if (cargando) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <div className="h-8 w-1/3 animate-pulse rounded-lg bg-neutral-200" />
        <div className="h-64 animate-pulse rounded-lg bg-neutral-200" />
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="mx-auto max-w-3xl p-6 text-center text-neutral-500">
        No encontramos el pedido #{pedidoId}.
      </div>
    );
  }

  const cancelable =
    pedido.estado_codigo === "PENDIENTE" ||
    pedido.estado_codigo === "CONFIRMADO";

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{pedido.id}</h1>
          <p className="text-sm text-neutral-500">
            {new Date(pedido.created_at).toLocaleString("es-AR")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EstadoBadge estado={pedido.estado_codigo} />
          <WSBadge />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 font-semibold">Seguimiento</h2>
          <OrderTimeline
            estadoActual={pedido.estado_codigo}
            historial={pedido.historial_estados}
          />
        </section>

        <div className="space-y-6">
          <section className="rounded-xl border border-neutral-200 bg-white p-6 text-sm">
            <h2 className="mb-3 font-semibold">Detalle</h2>
            <ul className="space-y-2">
              {pedido.detalles.map((item, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <div>
                    <p>
                      {item.cantidad}× {item.nombre_snapshot}
                    </p>
                    {!!item.personalizacion?.length && (
                      <p className="text-xs text-neutral-400">
                        con personalización
                      </p>
                    )}
                  </div>
                  <span>{precio(item.subtotal_snap)}</span>
                </li>
              ))}
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
              <div className="flex justify-between text-neutral-500">
                <dt>Envío</dt>
                <dd>{precio(pedido.costo_envio)}</dd>
              </div>
              <div className="flex justify-between pt-1 text-base font-bold">
                <dt>Total</dt>
                <dd>{precio(pedido.total)}</dd>
              </div>
            </dl>
          </section>

          {pedido.pagos?.length > 0 && (
            <section className="rounded-xl border border-neutral-200 bg-white p-6 text-sm">
              <h2 className="mb-2 font-semibold">Pago</h2>
              <p className="text-neutral-600">
                Estado:{" "}
                <span className="font-medium">{pedido.pagos[0].mp_status}</span>
                {pedido.pagos[0].mp_payment_id &&
                  ` · #${pedido.pagos[0].mp_payment_id}`}
              </p>
            </section>
          )}

          {cancelable && (
            <button
              type="button"
              onClick={cancelar}
              disabled={cancelando}
              className="w-full rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {cancelando ? "Cancelando…" : "Cancelar pedido"}
            </button>
          )}
        </div>
      </div>

      {errorRequest && (
        <div className="fixed bottom-10 right-5 z-50">
          <div className="rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
            {errorRequest}
          </div>
        </div>
      )}
    </div>
  );
}
