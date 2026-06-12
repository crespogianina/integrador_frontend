import type { EstadoPedido } from "../models/Pedido";
import { ESTADO_LABEL } from "../models/Pedido";

const COLORS: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  EN_PREPARACION: "bg-violet-100 text-violet-800",
  EN_CAMINO: "bg-cyan-100 text-cyan-800",
  ENTREGADO: "bg-emerald-100 text-emerald-700",
  CANCELADO: "bg-red-100 text-red-700",
};

export function EstadoBadge({ estado }: { estado: EstadoPedido }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[estado]}`}
    >
      {ESTADO_LABEL[estado]}
    </span>
  );
}
