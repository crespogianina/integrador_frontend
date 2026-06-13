import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import { EstadoBadge } from "../../components/EstadoBadge";
import { WSBadge } from "../../components/WSBadge";
import type { EstadoPedido, PedidoRead } from "../../models/Pedido";
import { ESTADO_LABEL, ESTADOS_FLUJO, TRANSICIONES } from "../../models/Pedido";
import { usePedidosWS } from "../../hooks/usePedidosWS";

const PEDIDOS_PATH = `${API_BASE}/pedidos/`;
const LIMITE = 15;

const FILTRO_ESTADOS = [
  { value: "", label: "Todos" },
  ...ESTADOS_FLUJO.map((e) => ({ value: e, label: ESTADO_LABEL[e] })),
  { value: "CANCELADO", label: ESTADO_LABEL.CANCELADO },
];

const precio = (n: number) =>
  Number(n).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const fecha = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [avanzando, setAvanzando] = useState<number | null>(null);
  const [errorRequest, setErrorRequest] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / LIMITE));

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        offset: String((page - 1) * LIMITE),
        limit: String(LIMITE),
      });
      if (estadoFiltro) params.set("estado", estadoFiltro);

      const res = await apiFetch(`${PEDIDOS_PATH}?${params}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Error al cargar los pedidos");
      }

      const body = await res.json();
      if (Array.isArray(body)) {
        setPedidos(body);
        setTotal(body.length);
      } else {
        setPedidos(body.items ?? []);
        setTotal(body.total ?? 0);
      }
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al cargar los pedidos",
      );
    } finally {
      setCargando(false);
    }
  }, [page, estadoFiltro]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  usePedidosWS(() => {
    cargarPedidos();
  });

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 2500);
    return () => clearTimeout(timer);
  }, [errorRequest]);

  const handleFiltroEstado = (estado: string) => {
    setEstadoFiltro(estado);
    setPage(1);
  };

  const avanzarEstado = async (pedidoId: number, nuevoEstado: EstadoPedido) => {
    setAvanzando(pedidoId);
    try {
      const res = await apiFetch(`${PEDIDOS_PATH}${pedidoId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_codigo: nuevoEstado }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "No se pudo actualizar el estado");
      }
      await cargarPedidos();
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado",
      );
    } finally {
      setAvanzando(null);
    }
  };

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-4xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Gestión de pedidos
            </h1>
            <p className="text-sm text-slate-500">
              {total} pedido{total !== 1 ? "s" : ""}
            </p>
          </div>
          <WSBadge />
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTRO_ESTADOS.map((op) => (
            <button
              key={op.value}
              type="button"
              onClick={() => handleFiltroEstado(op.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                estadoFiltro === op.value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        {cargando ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            No hay pedidos
            {estadoFiltro
              ? ` con estado "${ESTADO_LABEL[estadoFiltro as EstadoPedido]}"`
              : ""}
            .
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {pedidos.map((pedido) => {
                const siguientes = TRANSICIONES[pedido.estado_codigo] ?? [];
                return (
                  <div
                    key={pedido.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <Link
                          to={`/pedidos/${pedido.id}`}
                          className="font-semibold text-slate-800 hover:text-blue-600"
                        >
                          Pedido #{pedido.id}
                        </Link>
                        <p className="text-sm text-slate-500">
                          {fecha(pedido.created_at)} · {precio(pedido.total)}
                        </p>
                      </div>
                      <EstadoBadge estado={pedido.estado_codigo} />
                    </div>

                    {siguientes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                        {siguientes.map((sig) => (
                          <button
                            key={sig}
                            type="button"
                            disabled={avanzando === pedido.id}
                            onClick={() => avanzarEstado(pedido.id, sig)}
                            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                          >
                            {avanzando === pedido.id
                              ? "Actualizando…"
                              : `→ ${ESTADO_LABEL[sig]}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  ‹ Anterior
                </button>
                <span className="text-sm text-slate-500">
                  Página {page} de {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                >
                  Siguiente ›
                </button>
              </div>
            )}
          </>
        )}
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
