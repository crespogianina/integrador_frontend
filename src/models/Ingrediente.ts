export interface IngredienteCreate {
    nombre: string;
    descripcion: string;
    es_alergeno: boolean;
    stock_cantidad: number;
    precio_base: number;
    unidad_medida_id: number;
}

export interface IngredienteUpdate extends IngredienteCreate {
    id: number;
}

export interface IngredienteRead {
    id: number;
    activo?: boolean;
    nombre: string;
    descripcion: string;
    es_alergeno: boolean;
    stock_cantidad: string;
    precio_base: string;
    unidad_medida_id: number;
}