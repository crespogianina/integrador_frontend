import { API_BASE, apiFetch } from "../config/api";
import type { EstadoPedido } from "../models/Pedido";
import type { Rol } from "../types/auth";

export const precio = (n: number) =>
  Number(n).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

export const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const AVANCE_STAFF: Partial<
  Record<EstadoPedido, { destino: EstadoPedido; roles: Rol[] }[]>
> = {
  CONFIRMADO: [{ destino: "EN_PREPARACION", roles: ["ADMIN", "PEDIDOS"] }],
  EN_PREPARACION: [{ destino: "EN_CAMINO", roles: ["ADMIN", "PEDIDOS"] }],
  EN_CAMINO: [{ destino: "ENTREGADO", roles: ["ADMIN", "PEDIDOS"] }],
};

export function accionesAvanceStaff(
  estado: EstadoPedido,
  roles: Rol[],
): EstadoPedido[] {
  const opciones = AVANCE_STAFF[estado] ?? [];
  return opciones
    .filter((o) => o.roles.some((r) => roles.includes(r)))
    .map((o) => o.destino);
}

export function puedeCancelarStaff(
  estado: EstadoPedido,
  roles: Rol[],
): boolean {
  if (estado === "PENDIENTE" || estado === "CONFIRMADO") {
    return roles.includes("ADMIN") || roles.includes("PEDIDOS");
  }
  if (estado === "EN_PREPARACION") {
    return roles.includes("ADMIN");
  }
  return false;
}

export function esStaff(roles: Rol[]): boolean {
  return roles.includes("ADMIN") || roles.includes("PEDIDOS");
}

export async function iniciarPagoMercadoPago(pedidoId: number): Promise<void> {
  const res = await apiFetch(`${API_BASE}/pagos/create-preference`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pedido_id: pedidoId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "No se pudo iniciar el pago");
  }

  const pago = await res.json();
  const url = pago.sandbox_init_point ?? pago.init_point;
  if (!url) throw new Error("MercadoPago no devolvió URL de pago");
  window.location.href = url;
}

export async function cargarMapaIngredientes(): Promise<Map<number, string>> {
  const mapa = new Map<number, string>();
  try {
    const res = await apiFetch(`${API_BASE}/ingredientes/?offset=0&limit=100`, {
      credentials: "include",
    });
    if (!res.ok) return mapa;
    const body = await res.json();
    const items = Array.isArray(body) ? body : (body.items ?? []);
    for (const ing of items) {
      if (typeof ing.id === "number" && typeof ing.nombre === "string") {
        mapa.set(ing.id, ing.nombre);
      }
    }
  } catch {
    /* listado opcional */
  }
  return mapa;
}

export function nombresExclusion(
  ids: number[] | null | undefined,
  mapa: Map<number, string>,
): string {
  if (!ids?.length) return "";
  return ids
    .map((id) => mapa.get(id) ?? `#${id}`)
    .join(", ");
}
