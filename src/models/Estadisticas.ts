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

export type PedidosEstadoItem = {
  estado_codigo: string;
  cantidad: number;
};

export type IngresoFormaPagoItem = {
  forma_pago_codigo: string;
  total: number;
  cantidad: number;
};

export type AgrupacionVentas = "day" | "week" | "month";

export const ESTADOS_COLORES: Record<string, string> = {
  PENDIENTE: "#eab308",
  CONFIRMADO: "#3b82f6",
  EN_PREPARACION: "#f97316",
  EN_PREP: "#f97316",
  EN_CAMINO: "#8b5cf6",
  ENTREGADO: "#22c55e",
  CANCELADO: "#ef4444",
};

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
