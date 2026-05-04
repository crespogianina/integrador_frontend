export interface IngredienteCreate {
    nombre: string;
    descripcion: string;
    es_alergeno: boolean;
}

export interface IngredienteRead extends IngredienteCreate {
    id: number;
}