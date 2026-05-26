export interface CategoriaCreate {
    nombre: string;
    descripcion?: string | null;
    imagen_url?: string | null;
    parent_id?: number | null;
}

export interface CategoriaRead extends CategoriaCreate {
    id: number;
    activo?: boolean;
}

export interface CategoriaTreeRead {
    id: number;
    nombre: string;
    descripcion?: string | null;
    imagen_url?: string | null;
    parent_id?: number | null;
    hijos: CategoriaTreeRead[];
}