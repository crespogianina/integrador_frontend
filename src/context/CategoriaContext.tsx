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
  cargarCategorias: (page: number, limit: number) => void;
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

    const nuevo: CategoriaRead = await res.json();
    dispatch({ type: "AGREGAR", payload: nuevo });
  }

  async function eliminar(id: number) {
    await fetch(`${API}${id}`, { method: "DELETE" });
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

    const actualizado = await res.json();

    dispatch({ type: "EDITAR", payload: actualizado });
    setCategoriaEditar(null);
  }

  async function cargarCategorias(page: number, limit: number) {
    const offset = (page - 1) * limit;

    let url = `${API}?offset=${offset}&limit=${limit}`;

    const res = await fetch(url);
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
