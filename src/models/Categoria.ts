export interface CategoriaCreate {
    nombre: string;
    descripcion: string;
    imagen_url?: string;
    parent_id: number | null;
    hijos?: string[] | null;
}

export interface CategoriaRead extends CategoriaCreate {
    id: number;
}