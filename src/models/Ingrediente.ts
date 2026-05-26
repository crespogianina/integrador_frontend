export interface IngredienteCreate {
    nombre: string;
    descripcion: string;
    es_alergeno: boolean;
    stock: string;
    precio: string;
    unidad_medida: string;
}

export interface IngredienteRead {
    id: number;
    activo?: boolean;
    nombre: string;
    descripcion: string;
    es_alergeno: boolean;
    stock: string;
    precio: string;
    unidad_medida: string;
}