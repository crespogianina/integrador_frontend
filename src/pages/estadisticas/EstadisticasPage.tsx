import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PeriodoSelector } from "../../components/estadisticas/PeriodoSelector";
import { apiFetch, API_BASE } from "../../config/api";
import {
  agrupacionAutomatica,
  calcularKpisPeriodo,
  etiquetaFormaPago,
  formatearMoneda,
  initialFiltrosEstadisticas,
  rangoDesdePreset,
  truncarNombre,
  type FiltrosEstadisticas,
  type IngresoFormaPagoItem,
  type PeriodoPreset,
  type ProductoTopItem,
  type ResumenEstadisticas,
  type VentasPeriodoItem,
} from "../../models/Estadisticas";

const BASE = `${API_BASE}/estadisticas`;

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
  const [filtros, setFiltros] = useState<FiltrosEstadisticas>(
    initialFiltrosEstadisticas,
  );

  const [resumen, setResumen] = useState<ResumenEstadisticas | null>(null);
  const [ventas, setVentas] = useState<VentasPeriodoItem[]>([]);
  const [productosTop, setProductosTop] = useState<ProductoTopItem[]>([]);
  const [ingresos, setIngresos] = useState<IngresoFormaPagoItem[]>([]);

  const [cargando, setCargando] = useState(true);
  const [errorRequest, setErrorRequest] = useState("");

  const { desde, hasta, periodo } = filtros;
  const agrupacion = useMemo(
    () => agrupacionAutomatica(periodo, desde, hasta),
    [periodo, desde, hasta],
  );

  const kpisPeriodo = useMemo(() => calcularKpisPeriodo(ventas), [ventas]);

  const ingresosGrafico = useMemo(
    () =>
      ingresos.map((item) => ({
        ...item,
        etiqueta: etiquetaFormaPago(item.forma_pago_codigo),
      })),
    [ingresos],
  );

  const productosGrafico = useMemo(
    () =>
      productosTop.map((item) => ({
        ...item,
        nombreCorto: truncarNombre(item.nombre),
      })),
    [productosTop],
  );

  const handleSelectPreset = (preset: PeriodoPreset) => {
    const rango = rangoDesdePreset(preset);
    setFiltros((prev) =>
      rango
        ? { periodo: preset, desde: rango.desde, hasta: rango.hasta }
        : { ...prev, periodo: preset },
    );
  };

  const handleChangeFecha = (campo: "desde" | "hasta", valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      periodo: "rango",
      [campo]: valor,
    }));
  };

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorRequest("");

    try {
      const params = new URLSearchParams({ desde, hasta });
      const paramsVentas = new URLSearchParams({
        desde,
        hasta,
        agrupacion,
      });
      const paramsTop = new URLSearchParams({ desde, hasta, limit: "8" });

      const [resResumen, resVentas, resTop, resIngresos] = await Promise.all([
        apiFetch(`${BASE}/resumen`),
        apiFetch(`${BASE}/ventas?${paramsVentas}`),
        apiFetch(`${BASE}/productos-top?${paramsTop}`),
        apiFetch(`${BASE}/ingresos?${params}`),
      ]);

      if (
        !resResumen.ok ||
        !resVentas.ok ||
        !resTop.ok ||
        !resIngresos.ok
      ) {
        const errorBody = await resResumen.json().catch(() => null);
        throw new Error(
          errorBody?.detail || "No se pudieron cargar las estadísticas",
        );
      }

      setResumen(await resResumen.json());
      setVentas(await resVentas.json());
      setProductosTop(await resTop.json());
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
    const timeout = setTimeout(() => setErrorRequest(""), 4000);
    return () => clearTimeout(timeout);
  }, [errorRequest]);

  const mostrarLineaVentas = periodo !== "hoy" || ventas.length > 1;

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-slate-800">
            Panel de estadísticas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Métricas del negocio según el período seleccionado
          </p>
        </header>

        <PeriodoSelector
          filtros={filtros}
          onSelectPreset={handleSelectPreset}
          onChangeFecha={handleChangeFecha}
          onLimpiar={() => setFiltros(initialFiltrosEstadisticas())}
        />

        <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Los montos incluyen pedidos <strong>confirmados o en curso</strong>{" "}
          (confirmado, en preparación, en camino, entregado). No cuentan pedidos{" "}
          <strong>pendientes de pago</strong> ni cancelados.
        </p>

        {errorRequest && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorRequest}
          </p>
        )}

        {cargando ? (
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
              titulo="Ventas del período"
              valor={formatearMoneda(kpisPeriodo.totalVentas)}
              detalle="Pedidos confirmados o posteriores"
            />
            <KpiCard
              titulo="Pedidos del período"
              valor={String(kpisPeriodo.cantidadPedidos)}
              detalle="Confirmados o posteriores"
            />
            <KpiCard
              titulo="Ticket promedio"
              valor={formatearMoneda(kpisPeriodo.ticketPromedio)}
            />
            <KpiCard
              titulo="Pedidos activos ahora"
              valor={String(resumen?.pedidos_activos ?? 0)}
              detalle="Operación en curso (sin filtro de fecha)"
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {mostrarLineaVentas && (
            <article className="rounded-2xl bg-white p-5 shadow lg:col-span-2">
              <h2 className="mb-1 text-lg font-semibold text-slate-800">
                Evolución de ventas
              </h2>
              <p className="mb-4 text-sm text-slate-500">
                Pedidos confirmados o posteriores, agrupados por fecha
              </p>
              <div className="h-80">
                {cargando ? (
                  <div className="h-full animate-pulse rounded-xl bg-slate-100" />
                ) : ventas.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No hay ventas en este período
                  </div>
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
                        dot={{ r: 3 }}
                      />
                      <Line
                        yAxisId="cantidad"
                        type="monotone"
                        dataKey="cantidad_pedidos"
                        name="Cantidad pedidos"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </article>
          )}

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-1 text-lg font-semibold text-slate-800">
              Ingresos por forma de pago
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Total cobrado o confirmado, según forma de pago
            </p>
            <div className="h-72">
              {cargando ? (
                <div className="h-full animate-pulse rounded-xl bg-slate-100" />
              ) : ingresos.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Sin ingresos confirmados en este período
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ingresosGrafico} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="etiqueta"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(valor) => formatearMoneda(Number(valor))}
                    />
                    <Bar dataKey="total" name="Total" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="mb-1 text-lg font-semibold text-slate-800">
              Productos más vendidos
            </h2>
            <p className="mb-4 text-sm text-slate-500">
              Unidades e ingresos de pedidos confirmados o posteriores
            </p>
            <div className="h-72">
              {cargando ? (
                <div className="h-full animate-pulse rounded-xl bg-slate-100" />
              ) : productosTop.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No hay productos vendidos en este período
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombreCorto" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(valor, nombre) => {
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
                    <Bar
                      dataKey="ingresos"
                      name="Ingresos"
                      fill="#2563eb"
                      radius={[6, 6, 0, 0]}
                    />
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
