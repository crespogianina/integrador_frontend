export interface ProductoCategoriaCreate {
    categoria_id: number;
    es_principal: boolean;
}

export interface ProductoIngredienteCreate {
    ingrediente_id: number;
    es_removible: boolean;
}

export interface ProductoCreate {
    nombre: string;
    descripcion: string;
    precio_base: number;
    imagenes_url: string[];
    stock_cantidad: number;
    disponible: boolean;
    categorias: ProductoCategoriaCreate[];
    ingredientes?: ProductoIngredienteCreate[];
}

export interface ProductoRead extends ProductoCreate {
    id: number;
}