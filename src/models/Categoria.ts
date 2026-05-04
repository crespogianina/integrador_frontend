export interface CategoriaCreate {
    nombre: string;
    descripcion: string;
    imagen_url?: string;
    parent_id?: string | null;
    hijos?: string[] | null;
}

export interface CategoriaRead extends CategoriaCreate {
    id: number;
}