export interface Direccion {
    id: number;
    usuario_id: number;
    alias?: string | null;
    linea1: string;
    linea2?: string | null;
    ciudad: string;
    provincia?: string | null;
    codigo_postal?: string | null;
    latitud?: number | null;
    longitud?: number | null;
    es_principal: boolean;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface DireccionCreate {
    alias?: string | null;
    linea1: string;
    linea2?: string | null;
    ciudad: string;
    provincia?: string | null;
    codigo_postal?: string | null;
    latitud?: number | null;
    longitud?: number | null;
    es_principal?: boolean;
}

export interface DireccionUpdate {
    alias?: string | null;
    linea1?: string;
    linea2?: string | null;
    ciudad?: string;
    provincia?: string | null;
    codigo_postal?: string | null;
    latitud?: number | null;
    longitud?: number | null;
}

export interface DireccionList {
    data: Direccion[];
    total: number;
}