import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useReducer,
  useEffect,
} from "react";
import { ProductosReducer } from "../reducers/productoReducer";
import type {
  ProductoCreate,
  ProductoRead,
  ProductoUpdate,
} from "../models/Producto";
import { apiFetch } from "../config/api";
import type { UnidadMedida } from "../models/UnidadMedida";
export interface ListaProducto {
  data: ProductoRead[];
  total: number;
}

interface ContextType {
  productos: ProductoRead[];
  unidadesMedida: UnidadMedida[];
  total: number;
  agregar: (i: ProductoCreate) => Promise<ProductoRead>;
  cargarProductos: (
    page: number,
    limit: number,
    nombre?: string,
    descripcion?: string,
    disponible?: string,
  ) => void;
  eliminar: (id: number) => void;
  resetear: () => void;
  editar: (i: ProductoUpdate) => Promise<ProductoRead>;
  actualizarImagenes: (
    id: number,
    imagenes_url: string[],
  ) => Promise<ProductoRead>;
  productoEditar: ProductoRead | null;
  setProductoEditar: (i: ProductoRead | null) => void;
  activar: (id: number) => void;
  desactivar: (id: number) => void;
}

const API = "http://localhost:8000/api/v1/productos/";

const ProductoContext = createContext<ContextType | null>(null);

export function ProductosProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ProductosReducer, []);
  const [productoEditar, setProductoEditar] = useState<ProductoRead | null>(
    null,
  );
  const [total, setTotal] = useState(0);
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([]);

  useEffect(() => {
    if (!unidadesMedida.length) {
      obtenerUnidadesMedida();
    }
  }, []);

  async function agregar(data: ProductoCreate) {
    const res = await apiFetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Error al crear el producto");
    }

    const nuevo: ProductoRead = await res.json();
    dispatch({ type: "AGREGAR", payload: nuevo });
    return nuevo;
  }

  async function eliminar(id: number) {
    const res = await apiFetch(`${API}${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Error al eliminar el producto");
    }

    dispatch({ type: "ELIMINAR", payload: id });
  }

  async function resetear() {
    await apiFetch(API, { method: "DELETE", credentials: "include" });
    dispatch({ type: "RESET", payload: [] });
  }

  async function editar(data: ProductoUpdate) {
    const res = await apiFetch(`${API}${data.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Error al editar el producto");
    }

    const actualizado = await res.json();

    dispatch({ type: "EDITAR", payload: actualizado });
    setProductoEditar(null);
    return actualizado;
  }

  async function actualizarImagenes(id: number, imagenes_url: string[]) {
    const res = await apiFetch(`${API}${id}/imagenes`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagenes_url }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.detail || "Error al actualizar las imágenes del producto",
      );
    }

    const actualizado: ProductoRead = await res.json();
    dispatch({ type: "EDITAR", payload: actualizado });
    return actualizado;
  }

  async function activar(id: number) {
    const res = await apiFetch(`${API}${id}/activar`, {
      method: "PATCH",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Error al activar el producto");
    }

    dispatch({ type: "ACTIVAR", payload: id });
  }

  async function desactivar(id: number) {
    const res = await apiFetch(`${API}${id}/desactivar`, {
      method: "PATCH",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Error al desactivar el producto");
    }

    dispatch({ type: "DESACTIVAR", payload: id });
  }

  async function obtenerUnidadesMedida(): Promise<void> {
    const res = await apiFetch(`${API}unidades-medida`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Error al desactivar el producto");
    }

    const unidades: UnidadMedida[] = await res.json();
    setUnidadesMedida(unidades);
  }

  async function cargarProductos(
    page: number,
    limit: number,
    nombre?: string,
    descripcion?: string,
    disponible?: string,
  ) {
    const offset = (page - 1) * limit;

    const params = new URLSearchParams({
      offset: String(offset),
      limit: String(limit),
    });

    if (nombre?.trim()) {
      params.append("nombre", nombre.trim());
    }

    if (descripcion?.trim()) {
      params.append("descripcion", descripcion.trim());
    }

    if (disponible?.trim()) {
      params.append("disponible", disponible.trim());
    }

    const res = await apiFetch(`${API}?${params.toString()}`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Error al cargar productos");
    }

    const data: ListaProducto = await res.json();

    dispatch({ type: "SET", payload: data.data });
    setTotal(data.total);
  }

  return (
    <ProductoContext.Provider
      value={{
        productos: state,
        agregar,
        eliminar,
        resetear,
        editar,
        actualizarImagenes,
        productoEditar,
        cargarProductos,
        setProductoEditar,
        total,
        activar,
        desactivar,
        unidadesMedida,
      }}
    >
      {children}
    </ProductoContext.Provider>
  );
}

export function useProductos() {
  const context = useContext(ProductoContext);
  if (!context)
    throw new Error("useProductos debe usarse dentro de ProductoProvider");
  return context;
}
