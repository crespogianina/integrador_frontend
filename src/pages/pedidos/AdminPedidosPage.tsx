import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
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

const esCancelable = (estado: string) =>
  ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION"].includes(estado);

const initialFiltros = {
  busquedaId: "",
  estadoFiltro: "",
  fechaDesde: "",
  fechaHasta: "",
};

export function AdminPedidosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const roles = user?.roles ?? [];

  const [pedidos, setPedidos] = useState<PedidoRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState(initialFiltros);
  const [filtrosDebounced, setFiltrosDebounced] = useState(initialFiltros);
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
          <WSBadge />
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
            editLabel="Detalle"
            onEdit={(p) => navigate(`/admin/pedidos/${p.id}`)}
            onDelete={(p) => setCancelarId(p.id)}
            showDeleteButtonCondition={(p) => esCancelable(p.estado_codigo)}
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
