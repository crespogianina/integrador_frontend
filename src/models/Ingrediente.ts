export interface IngredienteCreate {
    nombre: string;
    descripcion: string;
    es_alergeno: boolean;
}

export interface IngredienteRead extends IngredienteCreate {
    activo: boolean
    id: number;
}