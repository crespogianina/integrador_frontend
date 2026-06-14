import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch, API_BASE } from "../../config/api";
import {
  ESTADOS_COLORES,
  formatearMoneda,
  truncarNombre,
  type AgrupacionVentas,
  type IngresoFormaPagoItem,
  type PedidosEstadoItem,
  type ProductoTopItem,
  type ResumenEstadisticas,
  type VentasPeriodoItem,
} from "../../models/Estadisticas";

const BASE = `${API_BASE}/estadisticas`;

function hace30Dias(): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - 30);
  return fecha.toISOString().slice(0, 10);
}

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type KpiCardProps = {
  titulo: string;
  valor: string;
  detalle?: string;
};

function KpiCard({ titulo, valor, detalle }: KpiCardProps) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow">
      <p className="text-sm font-medium text-slate-500">{titulo}</p>
      <p className="mt-2 text-2xl font-bold text-slate-800">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-400">{detalle}</p>}
    </article>
  );
}

export function EstadisticasPage() {
  const [desde, setDesde] = useState(hace30Dias());
  const [hasta, setHasta] = useState(hoyIso());
  const [agrupacion, setAgrupacion] = useState<AgrupacionVentas>("day");

  const [resumen, setResumen] = useState<ResumenEstadisticas | null>(null);
  const [ventas, setVentas] = useState<VentasPeriodoItem[]>([]);
  const [productosTop, setProductosTop] = useState<ProductoTopItem[]>([]);
  const [pedidosEstado, setPedidosEstado] = useState<PedidosEstadoItem[]>([]);
  const [ingresos, setIngresos] = useState<IngresoFormaPagoItem[]>([]);

  const [cargando, setCargando] = useState(true);
  const [errorRequest, setErrorRequest] = useState("");

  const productosGrafico = useMemo(
    () =>
      productosTop.map((item) => ({
        ...item,
        nombreCorto: truncarNombre(item.nombre),
      })),
    [productosTop],
  );

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorRequest("");

    try {
      const paramsVentas = new URLSearchParams({
        desde,
        hasta,
        agrupacion,
      });
      const paramsIngresos = new URLSearchParams({ desde, hasta });

      const [resResumen, resVentas, resTop, resEstados, resIngresos] =
        await Promise.all([
          apiFetch(`${BASE}/resumen`),
          apiFetch(`${BASE}/ventas?${paramsVentas}`),
          apiFetch(`${BASE}/productos-top?limit=8`),
          apiFetch(`${BASE}/pedidos-por-estado`),
          apiFetch(`${BASE}/ingresos?${paramsIngresos}`),
        ]);

      if (
        !resResumen.ok ||
        !resVentas.ok ||
        !resTop.ok ||
        !resEstados.ok ||
        !resIngresos.ok
      ) {
        const errorBody = await resResumen.json().catch(() => null);
        throw new Error(errorBody?.detail || "No se pudieron cargar las estadísticas");
      }

      setResumen(await resResumen.json());
      setVentas(await resVentas.json());
      setProductosTop(await resTop.json());
      setPedidosEstado(await resEstados.json());
      setIngresos(await resIngresos.json());
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al cargar estadísticas",
      );
    } finally {
      setCargando(false);
    }
  }, [agrupacion, desde, hasta]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (!errorRequest) return;
    const timeout = setTimeout(() => setErrorRequest(""), 3000);
    return () => clearTimeout(timeout);
  }, [errorRequest]);

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Panel de estadísticas
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Métricas del negocio para administración
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm text-slate-600">
              Desde
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="mt-1 block rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-600">
              Hasta
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="mt-1 block rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-slate-600">
              Agrupación
              <select
                value={agrupacion}
                onChange={(e) =>
                  setAgrupacion(e.target.value as AgrupacionVentas)
                }
                className="mt-1 block rounded-lg border border-slate-200 px-3 py-2"
              >
                <option value="day">Día</option>
                <option value="week">Semana</option>
                <option value="month">Mes</option>
              </select>
            </label>
            <button
              type="button"
              onClick={cargarDatos}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Actualizar
            </button>
          </div>
        </header>

        {errorRequest && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorRequest}
          </p>
        )}

        {cargando || !resumen ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-white shadow"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              titulo="Ventas hoy"
              valor={formatearMoneda(Number(resumen.ventas_hoy))}
            />
            <KpiCard
              titulo="Ticket promedio"
              valor={formatearMoneda(Number(resumen.ticket_promedio))}
            />
            <KpiCard
              titulo="Pedidos activos"
              valor={String(resumen.pedidos_activos)}
            />
            <KpiCard
              titulo="Ventas del mes"
              valor={formatearMoneda(Number(resumen.ventas_mes_actual))}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Ventas por período
            </h2>
            <div className="h-72">
              {cargando ? (
                <div className="h-full animate-pulse rounded-xl bg-slate-100" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ventas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="monto" tick={{ fontSize: 12 }} />
                    <YAxis
                      yAxisId="cantidad"
                      orientation="right"
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(valor, nombre) =>
                        nombre === "total_ventas"
                          ? formatearMoneda(Number(valor))
                          : valor
                      }
                    />
                    <Legend />
                    <Line
                      yAxisId="monto"
                      type="monotone"
                      dataKey="total_ventas"
                      name="Total ventas"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="cantidad"
                      type="monotone"
                      dataKey="cantidad_pedidos"
                      name="Cantidad pedidos"
                      stroke="#16a34a"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Top productos
            </h2>
            <div className="h-72">
              {cargando ? (
                <div className="h-full animate-pulse rounded-xl bg-slate-100" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombreCorto" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(valor, nombre, item) => {
                        if (nombre === "ingresos") {
                          return formatearMoneda(Number(valor));
                        }
                        if (nombre === "cantidad_vendida") {
                          return [`${valor} u.`, "Cantidad vendida"];
                        }
                        return valor;
                      }}
                      labelFormatter={(_, payload) =>
                        payload?.[0]?.payload?.nombre ?? ""
                      }
                    />
                    <Bar dataKey="ingresos" name="Ingresos" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Pedidos por estado
            </h2>
            <div className="h-72">
              {cargando ? (
                <div className="h-full animate-pulse rounded-xl bg-slate-100" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pedidosEstado}
                      dataKey="cantidad"
                      nameKey="estado_codigo"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ estado_codigo, cantidad }) =>
                        `${estado_codigo}: ${cantidad}`
                      }
                    >
                      {pedidosEstado.map((item) => (
                        <Cell
                          key={item.estado_codigo}
                          fill={
                            ESTADOS_COLORES[item.estado_codigo] ?? "#94a3b8"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              Ingresos por forma de pago
            </h2>
            <div className="h-72">
              {cargando ? (
                <div className="h-full animate-pulse rounded-xl bg-slate-100" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingresos} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="forma_pago_codigo"
                      width={110}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(valor, nombre, item) => {
                        if (nombre === "total") {
                          return formatearMoneda(Number(valor));
                        }
                        return valor;
                      }}
                    />
                    <Bar dataKey="total" name="Total" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
