import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useReducer,
} from "react";
import { ProductosReducer } from "../reducers/productoReducer";
import type {
  ProductoCreate,
  ProductoRead,
  ProductoUpdate,
} from "../models/Producto";
export interface ListaProducto {
  data: ProductoRead[];
  total: number;
}

interface ContextType {
  productos: ProductoRead[];
  total: number;
  agregar: (i: ProductoCreate) => void;
  cargarProductos: (
    page: number,
    limit: number,
    nombre?: string,
    descripcion?: string,
    disponible?: string,
  ) => void;
  eliminar: (id: number) => void;
  resetear: () => void;
  editar: (i: ProductoUpdate) => void;
  productoEditar: ProductoRead | null;
  setProductoEditar: (i: ProductoRead | null) => void;
}

const API = "http://localhost:8000/productos/";

const ProductoContext = createContext<ContextType | null>(null);

export function ProductosProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ProductosReducer, []);
  const [productoEditar, setProductoEditar] = useState<ProductoRead | null>(
    null,
  );
  const [total, setTotal] = useState(0);

  async function agregar(data: ProductoCreate) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Error al crear el producto");
    }

    const nuevo: ProductoRead = await res.json();
    dispatch({ type: "AGREGAR", payload: nuevo });
  }

  async function eliminar(id: number) {
    const res = await fetch(`${API}${id}`, { method: "DELETE" });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Error al eliminar el producto");
    }

    dispatch({ type: "ELIMINAR", payload: id });
  }

  async function resetear() {
    await fetch(API, { method: "DELETE" });
    dispatch({ type: "RESET", payload: [] });
  }

  async function editar(data: ProductoUpdate) {
    const res = await fetch(`${API}${data.id}`, {
      method: "PUT",
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

    const res = await fetch(`${API}?${params.toString()}`);

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
        productoEditar,
        cargarProductos,
        setProductoEditar,
        total,
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
