import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, API_BASE } from "../../config/api";
import { EstadoBadge } from "../../components/EstadoBadge";
import type { EstadoPedido, PedidoRead } from "../../models/Pedido";
import { ESTADO_LABEL, ESTADOS_FLUJO } from "../../models/Pedido";
import { fechaCorta, precio } from "../../lib/pedidosUtils";

const PEDIDOS_PATH = `${API_BASE}/pedidos/`;
const LIMITE = 10;

const FILTRO_ESTADOS = [
  { value: "", label: "Todos" },
  ...ESTADOS_FLUJO.map((e) => ({ value: e, label: ESTADO_LABEL[e] })),
  { value: "CANCELADO", label: ESTADO_LABEL.CANCELADO },
];

export function MisPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoRead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorRequest, setErrorRequest] = useState("");

  const totalPages = Math.max(1, Math.ceil(total / LIMITE));

  useEffect(() => {
    const cargarPedidos = async () => {
      setCargando(true);
      setErrorRequest("");
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
          const errorData = await res.json().catch(() => null);
          throw new Error(errorData?.detail || "Error al cargar los pedidos");
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
          error instanceof Error
            ? error.message
            : "Error al cargar los pedidos",
        );
      } finally {
        setCargando(false);
      }
    };

    void cargarPedidos();
  }, [page, estadoFiltro]);

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 2500);
    return () => clearTimeout(timer);
  }, [errorRequest]);

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-3xl space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis pedidos</h1>
          <p className="text-sm text-slate-500">
            Hacé click en un pedido para ver su seguimiento en vivo.
          </p>
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
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        ) : errorRequest && pedidos.length === 0 ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 py-12 text-center">
            <p className="font-medium text-red-800">{errorRequest}</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
            <span className="text-4xl">🛒</span>
            <p className="font-medium text-slate-700">
              {estadoFiltro
                ? `No tenés pedidos en estado "${ESTADO_LABEL[estadoFiltro as EstadoPedido]}"`
                : "Todavía no hiciste ningún pedido"}
            </p>
            <Link
              to="/productos"
              className="mt-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Ver el catálogo
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {pedidos.map((pedido) => (
                <Link
                  key={pedido.id}
                  to={`/pedidos/${pedido.id}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      Pedido #{pedido.id}
                    </p>
                    <p className="text-sm text-slate-500">
                      {fechaCorta(pedido.created_at)} · {precio(pedido.total)}
                      {pedido.cantidad_items != null && (
                        <span>
                          {" "}
                          · {pedido.cantidad_items} ítem
                          {pedido.cantidad_items !== 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <EstadoBadge estado={pedido.estado_codigo} />
                    <span className="text-slate-300">›</span>
                  </div>
                </Link>
              ))}
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

      {errorRequest && pedidos.length > 0 && (
        <div className="fixed bottom-10 right-5 z-50">
          <div className="rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
            {errorRequest}
          </div>
        </div>
      )}
    </main>
  );
}
