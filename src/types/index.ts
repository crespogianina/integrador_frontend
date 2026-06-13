export interface UnidadMedida {
    id: number;
    nombre: string;
    simbolo: string;
    tipo: string;
}

export interface Ingrediente {
    id: number;
    nombre: string;
    descripcion?: string | null;
    es_alergeno: boolean;
}

export interface ProductoIngrediente {
    ingrediente: Ingrediente;
    es_removible: boolean;
    cantidad: number;
    unidad_medida: UnidadMedida;
}

export interface Categoria {
    id: number;
    parent_id: number | null;
    nombre: string;
    descripcion?: string | null;
    imagen_url?: string | null;
}

export interface Producto {
    id: number;
    nombre: string;
    descripcion?: string | null;
    precio_base: number;
    imagenes_url: string[] | null;
    stock_cantidad: number;
    disponible: boolean;
    unidad_venta?: UnidadMedida | null;
}

export interface ProductoDetail extends Producto {
    ingredientes: ProductoIngrediente[];
    categorias: Categoria[];
}

export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

export type EstadoPedido =
    | 'PENDIENTE'
    | 'CONFIRMADO'
    | 'EN_PREP'
    | 'ENTREGADO'
    | 'CANCELADO';

export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
    PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
    CONFIRMADO: ['EN_PREP', 'CANCELADO'],
    EN_PREP: ['ENTREGADO', 'CANCELADO'],
    ENTREGADO: [],
    CANCELADO: [],
};

export const ESTADOS_FLUJO: EstadoPedido[] = ['PENDIENTE', 'CONFIRMADO', 'EN_PREP', 'ENTREGADO'];

export const ESTADO_LABEL: Record<EstadoPedido, string> = {
    PENDIENTE: 'Pendiente de pago',
    CONFIRMADO: 'Confirmado',
    EN_PREP: 'En preparación',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
};

export interface DetallePedido {
    producto_id: number;
    nombre_snapshot: string;
    precio_snapshot: number;
    subtotal_snap: number;
    cantidad: number;
    personalizacion: number[] | null;
}

export interface HistorialEstado {
    estado_desde: EstadoPedido | null;
    estado_hacia: EstadoPedido;
    motivo?: string | null;
    created_at: string;
}

export interface Pago {
    mp_payment_id?: number | null;
    mp_status: string;
    mp_status_detail?: string | null;
    transaction_amount: number;
    payment_method_id?: string | null;
}

export interface Pedido {
    id: number;
    estado_codigo: EstadoPedido;
    subtotal: number;
    descuento: number;
    costo_envio: number;
    total: number;
    created_at: string;
}

export interface PedidoDetail extends Pedido {
    items: DetallePedido[];
    historial: HistorialEstado[];
    pago?: Pago | null;
}

export type Rol = 'ADMIN' | 'STOCK' | 'PEDIDOS' | 'CLIENT';

export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    roles: Rol[];
    created_at?: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
}
export interface WSEvento {
    event: 'estado_cambiado' | 'pedido_cancelado' | 'pago_confirmado';
    pedido_id: number;
    estado_anterior: EstadoPedido | null;
    estado_nuevo: EstadoPedido;
    usuario_id: number | null;
    motivo: string | null;
    timestamp: string;
}

export interface CartItem {
    producto_id: number;
    nombre: string;
    precio: number;
    imagen?: string;
    unidad?: string;
    cantidad: number;
    personalizacion: number[];
    removidos_nombres: string[];
}

export interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
}
