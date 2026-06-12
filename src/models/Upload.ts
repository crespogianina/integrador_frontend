export interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

export interface ImagenCategoriaUpdate {
  imagen_url: string | null;
}

export interface ImagenProductoUpdate {
  imagenes_url: string[];
}
