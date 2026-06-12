

export type EstadoPedido =
    | "PENDIENTE"
    | "CONFIRMADO"
    | "EN_PREPARACION"
    | "EN_CAMINO"
    | "ENTREGADO"
    | "CANCELADO";

export const ESTADOS_FLUJO: EstadoPedido[] = [
    "PENDIENTE",
    "CONFIRMADO",
    "EN_PREPARACION",
    "EN_CAMINO",
    "ENTREGADO",
];

export const ESTADO_LABEL: Record<EstadoPedido, string> = {
    PENDIENTE: "Pendiente de pago",
    CONFIRMADO: "Confirmado",
    EN_PREPARACION: "En preparación",
    EN_CAMINO: "En camino",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
};


export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
    PENDIENTE: ["CONFIRMADO", "CANCELADO"],
    CONFIRMADO: ["EN_PREPARACION", "CANCELADO"],
    EN_PREPARACION: ["EN_CAMINO", "CANCELADO"],
    EN_CAMINO: ["ENTREGADO"],
    ENTREGADO: [],
    CANCELADO: [],
};

export const CANCELABLES_POR_CLIENTE: EstadoPedido[] = ["PENDIENTE", "CONFIRMADO"];



export interface DetallePedidoRead {
    producto_id: number;
    nombre_snapshot: string;
    cantidad: number;
    precio_snapshot: number;
    subtotal_snap: number;
    personalizacion: number[] | null;
}

export interface HistorialEstadoRead {
    id: number;
    estado_desde: EstadoPedido | null;
    estado_hacia: EstadoPedido;
    usuario_id: number | null;
    motivo: string | null;
    created_at: string;
}

export interface PagoRead {
    id: number;
    monto: number;
    mp_payment_id: number | null;
    mp_status: string;
    creado_en: string;
}

export interface PedidoRead {
    id: number;
    estado_codigo: EstadoPedido;
    subtotal: number;
    descuento: number;
    costo_envio: number;
    total: number;
    created_at: string;
}

export interface PedidoDetail extends PedidoRead {
    usuario_id: number;
    direccion_id: number | null;
    forma_pago_codigo: string;
    notas: string | null;
    estado: { codigo: EstadoPedido; descripcion: string };
    forma_pago: { codigo: string; descripcion: string };
    usuario: { id: number; nombre: string; apellido: string; email: string };
    direccion: { id: number; linea1: string; ciudad: string } | null;
    detalles: DetallePedidoRead[];
    historial_estados: HistorialEstadoRead[];
    pagos: PagoRead[];
}

export interface PaginatedPedidos {
    items: PedidoRead[];
    total: number;
}


export interface ItemPedidoRequest {
    producto_id: number;
    cantidad: number;
    personalizacion?: number[];
}

export interface CrearPedidoRequest {
    items: ItemPedidoRequest[];
    forma_pago_codigo: string;
    direccion_id?: number | null;
    notas?: string | null;
}


export interface WSEventoPedido {
    event: string;
    pedido_id: number;
    estado_anterior: EstadoPedido | null;
    estado_nuevo: EstadoPedido;
    usuario_id: number | null;
    motivo: string | null;
    timestamp: string;
}
