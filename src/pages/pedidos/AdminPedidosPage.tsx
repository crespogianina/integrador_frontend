import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import type { Column } from "../../components/Tabla";
import Tabla from "../../components/Tabla";
import Filtros from "../../components/Filtros";
import type { Filter } from "../../components/Filtros";

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

const initialFiltros = {
  busquedaId: "",
  estadoFiltro: "",
  fechaDesde: "",
  fechaHasta: "",
};

type Vista = "tabla" | "kanban";

export function AdminPedidosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const roles = user?.roles ?? [];

  const [pedidos, setPedidos] = useState<PedidoRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState(initialFiltros);
  const [filtrosDebounced, setFiltrosDebounced] = useState(initialFiltros);
  const [vista, setVista] = useState<Vista>("tabla");
  const [cargando, setCargando] = useState(true);
  const [avanzando, setAvanzando] = useState<number | null>(null);
  const [cancelarId, setCancelarId] = useState<number | null>(null);
  const [errorRequest, setErrorRequest] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / LIMITE));

  const columns: Column<PedidoRead>[] = [
    { header: "N°", accessor: "id" },
    {
      header: "Cliente",
      accessor: "cliente_nombre",
      customLabelFn: (v) => v ?? "-",
    },
    {
      header: "Email",
      accessor: "cliente_email",
      customLabelFn: (v) => v ?? "-",
    },
    {
      header: "Estado",
      accessor: "estado_codigo",
      customLabelFn: (v) => ESTADO_LABEL[v as EstadoPedido] ?? v,
    },
    {
      header: "Total",
      accessor: "total",
      customLabelFn: (v) => precio(Number(v)),
    },
    {
      header: "Items",
      accessor: "cantidad_items",
      customLabelFn: (v) => v ?? "-",
    },
    {
      header: "Fecha",
      accessor: "created_at",
      customLabelFn: (v) => fechaCorta(String(v)),
    },
  ];

  const pedidosFiltrosConfig: Filter[] = [
    {
      name: "busquedaId",
      value: filtros.busquedaId,
      type: "input",
      placeholder: "Buscar por N°",
      label: "N° de pedido",
    },
    {
      name: "estadoFiltro",
      value: filtros.estadoFiltro,
      type: "select",
      label: "Estado",
      options: FILTRO_ESTADOS.filter((o) => o.value !== "").map((o) => ({
        label: o.label,
        value: o.value,
      })),
    },
    {
      name: "fechaDesde",
      value: filtros.fechaDesde,
      type: "date",
      placeholder: "Desde (YYYY-MM-DD)",
      label: "Desde",
    },
    {
      name: "fechaHasta",
      value: filtros.fechaHasta,
      type: "date",
      placeholder: "Hasta (YYYY-MM-DD)",
      label: "Hasta",
    },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFiltrosDebounced(filtros);
      setPage(1);
    }, 800);
    return () => clearTimeout(timeout);
  }, [filtros]);

  const cargarPedidos = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        offset: String((page - 1) * LIMITE),
        limit: String(LIMITE),
      });
      if (filtrosDebounced.estadoFiltro)
        params.set("estado", filtrosDebounced.estadoFiltro);
      if (filtrosDebounced.fechaDesde)
        params.set("fecha_desde", filtrosDebounced.fechaDesde);
      if (filtrosDebounced.fechaHasta)
        params.set("fecha_hasta", filtrosDebounced.fechaHasta);

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
  }, [page, filtrosDebounced]);

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
    if (!filtros.busquedaId.trim()) return pedidos;
    return pedidos.filter((p) =>
      String(p.id).includes(filtros.busquedaId.trim()),
    );
  }, [pedidos, filtros.busquedaId]);

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
        (pedido.estado_codigo === "EN_PREPARACION" && roles.includes("ADMIN")));

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
          <p className="font-semibold text-slate-800">#{pedido.id}</p>
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
        <div className="flex items-center gap-2">
          <EstadoBadge estado={pedido.estado_codigo} />
          <button
            type="button"
            onClick={() => navigate(`/pedidos/${pedido.id}`)}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            Ver detalle
          </button>
        </div>
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
                onClick={() => setVista("tabla")}
                className={`rounded-md px-3 py-1.5 ${vista === "tabla" ? "bg-blue-600 text-white" : "text-slate-600"}`}
              >
                Tabla
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

        <Filtros
          filters={pedidosFiltrosConfig}
          onChange={(name, value) =>
            setFiltros((prev) => ({ ...prev, [name]: value }))
          }
          onClear={() => setFiltros(initialFiltros)}
        />

        {cargando ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-2xl bg-slate-200"
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
                    <span className="ml-2 text-slate-400">
                      ({items.length})
                    </span>
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
          <Tabla
            title="Pedidos"
            total={total}
            data={pedidosFiltrados}
            columns={columns}
            getRowId={(p) => p.id}
            page={page}
            totalPages={totalPages}
            onPrevious={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            onPageChange={setPage}
            onEdit={(p) => navigate(`/pedidos/${p.id}`)}
            onDelete={(p) => setCancelarId(p.id)}
            customAction={{
              label: (p) => {
                const sig = accionesAvanceStaff(p.estado_codigo, roles)[0];
                return sig ? `→ ${ESTADO_LABEL[sig]}` : "";
              },
              actionCallback: (p) => {
                const sig = accionesAvanceStaff(p.estado_codigo, roles)[0];
                if (sig) void avanzarEstado(p.id, sig);
              },
            }}
          />
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
