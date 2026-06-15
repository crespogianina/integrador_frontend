export type ResumenEstadisticas = {
  ventas_hoy: number;
  ticket_promedio: number;
  pedidos_activos: number;
  ventas_mes_actual: number;
};

export type VentasPeriodoItem = {
  periodo: string;
  total_ventas: number;
  cantidad_pedidos: number;
};

export type ProductoTopItem = {
  producto_id: number;
  nombre: string;
  cantidad_vendida: number;
  ingresos: number;
};

export type IngresoFormaPagoItem = {
  forma_pago_codigo: string;
  total: number;
  cantidad: number;
};

export type AgrupacionVentas = "day" | "week" | "month";

export type PeriodoPreset = "hoy" | "semana" | "mes" | "anio" | "rango";

export type FiltrosEstadisticas = {
  periodo: PeriodoPreset;
  desde: string;
  hasta: string;
};

export const PERIODO_BOTONES: { label: string; value: PeriodoPreset }[] = [
  { label: "Hoy", value: "hoy" },
  { label: "Última semana", value: "semana" },
  { label: "Último mes", value: "mes" },
  { label: "Último año", value: "anio" },
  { label: "Seleccionar rango", value: "rango" },
];

export const PERIODO_ETIQUETAS: Record<PeriodoPreset, string> = {
  hoy: "Hoy",
  semana: "Última semana",
  mes: "Mes anterior (completo)",
  anio: "Último año",
  rango: "Rango personalizado",
};

function toIsoLocal(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function hoyIso(): string {
  return toIsoLocal(new Date());
}

export function rangoDesdePreset(
  preset: PeriodoPreset,
): { desde: string; hasta: string } | null {
  if (preset === "rango") return null;

  const hoy = new Date();
  const hasta = toIsoLocal(hoy);

  if (preset === "hoy") {
    return { desde: hasta, hasta };
  }

  if (preset === "semana") {
    const desde = new Date(hoy);
    desde.setDate(desde.getDate() - 6);
    return { desde: toIsoLocal(desde), hasta };
  }

  if (preset === "mes") {
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    return {
      desde: toIsoLocal(inicioMesAnterior),
      hasta: toIsoLocal(finMesAnterior),
    };
  }

  const desde = new Date(hoy);
  desde.setDate(desde.getDate() - 364);
  return { desde: toIsoLocal(desde), hasta };
}

export function agrupacionAutomatica(
  preset: PeriodoPreset,
  desde: string,
  hasta: string,
): AgrupacionVentas {
  if (preset === "hoy") return "day";
  if (preset === "semana") return "day";
  if (preset === "mes") return "day";
  if (preset === "anio") return "month";

  const inicio = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T00:00:00`);
  const dias =
    Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  if (dias <= 31) return "day";
  if (dias <= 120) return "week";
  return "month";
}

export function initialFiltrosEstadisticas(): FiltrosEstadisticas {
  const rango = rangoDesdePreset("mes")!;
  return {
    periodo: "mes",
    desde: rango.desde,
    hasta: rango.hasta,
  };
}

export function calcularKpisPeriodo(ventas: VentasPeriodoItem[]) {
  const totalVentas = ventas.reduce(
    (acc, item) => acc + Number(item.total_ventas),
    0,
  );
  const cantidadPedidos = ventas.reduce(
    (acc, item) => acc + Number(item.cantidad_pedidos),
    0,
  );
  const ticketPromedio =
    cantidadPedidos > 0 ? totalVentas / cantidadPedidos : 0;

  return { totalVentas, cantidadPedidos, ticketPromedio };
}

export function formatearRango(desde: string, hasta: string): string {
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (desde === hasta) return fmt(desde);
  return `${fmt(desde)} – ${fmt(hasta)}`;
}

export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(valor);
}

export function truncarNombre(nombre: string, max = 18): string {
  if (nombre.length <= max) return nombre;
  return `${nombre.slice(0, max - 1)}…`;
}

export function etiquetaFormaPago(codigo: string): string {
  const mapa: Record<string, string> = {
    MERCADOPAGO: "Mercado Pago",
    EFECTIVO: "Efectivo",
    TRANSFERENCIA: "Transferencia",
  };
  return mapa[codigo] ?? codigo;
}
