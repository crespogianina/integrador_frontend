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

export interface ProductoUpdate extends ProductoCreate {
    id: number;
}

export interface CategoriaResumen {
    id: number;
    nombre: string;
    es_principal: boolean;
}

export interface IngredienteResumen {
    id: number;
    nombre: string;
    es_removible: boolean;
}

export interface ProductoRead {
    id: number;
    nombre: string;
    descripcion: string;
    precio_base: number;
    imagenes_url: string[];
    stock_cantidad: number;
    disponible: boolean;
    categorias: CategoriaResumen[];
    ingredientes: IngredienteResumen[];
}