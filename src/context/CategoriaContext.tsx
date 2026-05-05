import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useReducer,
} from "react";
import type { CategoriaRead, CategoriaCreate } from "../models/Categoria";
import { CategoriasReducer } from "../reducers/categoriaReducer";
export interface ListaCategoria {
  data: CategoriaRead[];
  total: number;
}

interface ContextType {
  categorias: CategoriaRead[];
  total: number;
  agregar: (i: CategoriaCreate) => void;
  cargarCategorias: (
    page: number,
    limit: number,
    nombre?: string,
    descripcion?: string,
  ) => void;
  eliminar: (id: number) => void;
  resetear: () => void;
  editar: (i: CategoriaRead) => void;
  categoriaEditar: CategoriaRead | null;
  setCategoriaEditar: (i: CategoriaRead | null) => void;
}

const API = "http://localhost:8000/categorias/";

const CategoriaContext = createContext<ContextType | null>(null);

export function CategoriasProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(CategoriasReducer, []);
  const [categoriaEditar, setCategoriaEditar] = useState<CategoriaRead | null>(
    null,
  );
  const [total, setTotal] = useState(0);

  async function agregar(data: CategoriaCreate) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);

      throw new Error(errorData?.detail || "Error al crear la categoría");
    }

    const nuevo: CategoriaRead = await res.json();

    dispatch({ type: "AGREGAR", payload: nuevo });
  }

  async function eliminar(id: number) {
    const res = await fetch(`${API}${id}`, { method: "DELETE" });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);

      throw new Error(errorData?.detail || "Error al eliminar la categoría");
    }

    dispatch({ type: "ELIMINAR", payload: id });
  }

  async function resetear() {
    await fetch(API, { method: "DELETE" });
    dispatch({ type: "RESET", payload: [] });
  }

  async function editar(data: CategoriaRead) {
    const res = await fetch(`${API}${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);

      throw new Error(errorData?.detail || "Error al editar la categoría");
    }

    const actualizado = await res.json();

    dispatch({ type: "EDITAR", payload: actualizado });
    setCategoriaEditar(null);
  }

  async function cargarCategorias(
    page: number,
    limit: number,
    nombre?: string,
    descripcion?: string,
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

    const res = await fetch(`${API}?${params.toString()}`);

    if (!res.ok) {
      throw new Error("Error al cargar categorías");
    }

    const data: ListaCategoria = await res.json();

    dispatch({ type: "SET", payload: data.data });
    setTotal(data.total);
  }

  return (
    <CategoriaContext.Provider
      value={{
        categorias: state,
        agregar,
        eliminar,
        resetear,
        editar,
        categoriaEditar,
        cargarCategorias,
        setCategoriaEditar,
        total,
      }}
    >
      {children}
    </CategoriaContext.Provider>
  );
}

export function useCategorias() {
  const context = useContext(CategoriaContext);
  if (!context)
    throw new Error("useCategorias debe usarse dentro de CategoriaProvider");
  return context;
}
