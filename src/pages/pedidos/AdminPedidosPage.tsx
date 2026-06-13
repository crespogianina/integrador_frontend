import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { EstadoBadge } from "../../components/EstadoBadge";
import { ModalCancelarPedido } from "../../components/ModalCancelarPedido";
import { WSBadge } from "../../components/WSBadge";
import type { EstadoPedido, PedidoRead } from "../../models/Pedido";
import { ESTADO_LABEL, ESTADOS_FLUJO } from "../../models/Pedido";
import {
  accionesAvanceStaff,
  fechaCorta,
  precio,
} from "../../lib/pedidosUtils";
import { usePedidosWS } from "../../hooks/usePedidosWS";

const PEDIDOS_PATH = `${API_BASE}/pedidos/`;
const LIMITE = 15;

const FILTRO_ESTADOS = [
  { value: "", label: "Todos" },
  ...ESTADOS_FLUJO.map((e) => ({ value: e, label: ESTADO_LABEL[e] })),
  { value: "CANCELADO", label: ESTADO_LABEL.CANCELADO },
];

const COLUMNAS_KANBAN: EstadoPedido[] = [
  "CONFIRMADO",
  "EN_PREPARACION",
  "EN_CAMINO",
];

type Vista = "lista" | "kanban";

export function AdminPedidosPage() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];

  const [pedidos, setPedidos] = useState<PedidoRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [busquedaId, setBusquedaId] = useState("");
  const [vista, setVista] = useState<Vista>("lista");
  const [cargando, setCargando] = useState(true);
  const [avanzando, setAvanzando] = useState<number | null>(null);
  const [cancelarId, setCancelarId] = useState<number | null>(null);
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
      if (fechaDesde) params.set("fecha_desde", fechaDesde);
      if (fechaHasta) params.set("fecha_hasta", fechaHasta);

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
  }, [page, estadoFiltro, fechaDesde, fechaHasta]);

  useEffect(() => {
    void cargarPedidos();
  }, [cargarPedidos]);

  usePedidosWS(() => {
    void cargarPedidos();
  });

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 3000);
    return () => clearTimeout(timer);
  }, [errorRequest]);

  const pedidosFiltrados = useMemo(() => {
    if (!busquedaId.trim()) return pedidos;
    const q = busquedaId.trim();
    return pedidos.filter((p) => String(p.id).includes(q));
  }, [pedidos, busquedaId]);

  const avanzarEstado = async (pedidoId: number, nuevoEstado: EstadoPedido) => {
    setAvanzando(pedidoId);
    try {
      const res = await apiFetch(`${PEDIDOS_PATH}${pedidoId}/avanzar`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevo_estado: nuevoEstado }),
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

  const cancelarPedido = async (pedidoId: number, motivo: string) => {
    const res = await apiFetch(`${PEDIDOS_PATH}${pedidoId}/cancelar`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ observacion: motivo }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.detail || "No se pudo cancelar el pedido");
    }
    await cargarPedidos();
  };

  const renderAcciones = (pedido: PedidoRead) => {
    const avances = accionesAvanceStaff(pedido.estado_codigo, roles);
    const puedeCancelar =
      pedido.estado_codigo !== "ENTREGADO" &&
      pedido.estado_codigo !== "CANCELADO" &&
      (pedido.estado_codigo === "PENDIENTE" ||
        pedido.estado_codigo === "CONFIRMADO" ||
        (pedido.estado_codigo === "EN_PREPARACION" &&
          roles.includes("ADMIN")));

    if (!avances.length && !puedeCancelar) return null;

    return (
      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        {avances.map((sig) => (
          <button
            key={sig}
            type="button"
            disabled={avanzando === pedido.id}
            onClick={() => void avanzarEstado(pedido.id, sig)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
          >
            {avanzando === pedido.id
              ? "Actualizando…"
              : `→ ${ESTADO_LABEL[sig]}`}
          </button>
        ))}
        {puedeCancelar && (
          <button
            type="button"
            disabled={avanzando === pedido.id}
            onClick={() => setCancelarId(pedido.id)}
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Cancelar
          </button>
        )}
      </div>
    );
  };

  const renderCard = (pedido: PedidoRead, compacto = false) => (
    <div
      key={pedido.id}
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${compacto ? "p-3" : "p-4"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            to={`/pedidos/${pedido.id}`}
            className="font-semibold text-slate-800 hover:text-blue-600"
          >
            #{pedido.id}
          </Link>
          {pedido.cliente_nombre && (
            <p className="truncate text-sm font-medium text-slate-700">
              {pedido.cliente_nombre}
            </p>
          )}
          {pedido.cliente_email && (
            <p className="truncate text-xs text-slate-500">
              {pedido.cliente_email}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-500">
            {fechaCorta(pedido.created_at)} · {precio(pedido.total)}
            {pedido.cantidad_items != null && (
              <span> · {pedido.cantidad_items} ítems</span>
            )}
          </p>
        </div>
        <EstadoBadge estado={pedido.estado_codigo} />
      </div>
      {renderAcciones(pedido)}
    </div>
  );

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Tablero de pedidos
            </h1>
            <p className="text-sm text-slate-500">
              {total} pedido{total !== 1 ? "s" : ""} en el sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <WSBadge />
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
              <button
                type="button"
                onClick={() => setVista("lista")}
                className={`rounded-md px-3 py-1.5 ${vista === "lista" ? "bg-blue-600 text-white" : "text-slate-600"}`}
              >
                Lista
              </button>
              <button
                type="button"
                onClick={() => setVista("kanban")}
                className={`rounded-md px-3 py-1.5 ${vista === "kanban" ? "bg-blue-600 text-white" : "text-slate-600"}`}
              >
                Kanban
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Buscar por N°
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={busquedaId}
              onChange={(e) => setBusquedaId(e.target.value)}
              placeholder="Ej: 12"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Desde
            </label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => {
                setFechaDesde(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Hasta
            </label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => {
                setFechaHasta(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTRO_ESTADOS.map((op) => (
            <button
              key={op.value}
              type="button"
              onClick={() => {
                setEstadoFiltro(op.value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                estadoFiltro === op.value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
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
        ) : pedidosFiltrados.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            No hay pedidos con esos filtros.
          </div>
        ) : vista === "kanban" ? (
          <div className="grid gap-4 md:grid-cols-3">
            {COLUMNAS_KANBAN.map((col) => {
              const items = pedidosFiltrados.filter(
                (p) => p.estado_codigo === col,
              );
              return (
                <div
                  key={col}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
                >
                  <h2 className="mb-3 text-sm font-bold text-slate-700">
                    {ESTADO_LABEL[col]}
                    <span className="ml-2 text-slate-400">({items.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {items.length === 0 ? (
                      <p className="py-6 text-center text-xs text-slate-400">
                        Sin pedidos
                      </p>
                    ) : (
                      items.map((p) => renderCard(p, true))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {pedidosFiltrados.map((p) => renderCard(p))}
            </div>
            {totalPages > 1 && !busquedaId && (
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

      <ModalCancelarPedido
        pedidoId={cancelarId ?? 0}
        abierto={cancelarId !== null}
        onCerrar={() => setCancelarId(null)}
        onConfirmar={async (motivo) => {
          if (cancelarId === null) return;
          await cancelarPedido(cancelarId, motivo);
          setCancelarId(null);
        }}
      />

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
