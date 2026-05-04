import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useReducer,
} from "react";
import type { IngredienteRead, IngredienteCreate } from "../models/Ingrediente";
import { IngredientesReducer } from "../reducers/ingredienteReducer";
import { API_BASE, jsonAuthHeaders } from "../config/api";
import { useAuth } from "./AuthContext";

export interface ListaIngrediente {
  data: IngredienteRead[];
  total: number;
}

interface ContextType {
  ingredientes: IngredienteRead[];
  total: number;
  agregar: (i: IngredienteCreate) => void;
  cargarIngredientes: (
    page: number,
    limit: number,
    es_alergeno?: string,
    nombre?: string,
    descripcion?: string,
  ) => void;
  eliminar: (id: number) => void;
  resetear: () => void;
  editar: (i: IngredienteRead) => void;
  ingredienteEditar: IngredienteRead | null;
  setIngredienteEditar: (i: IngredienteRead | null) => void;
}

const INGREDIENTES_PATH = `${API_BASE}/ingredientes/`;

const IngredienteContext = createContext<ContextType | null>(null);

export function IngredientesProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [state, dispatch] = useReducer(IngredientesReducer, []);
  const [ingredienteEditar, setIngredienteEditar] =
    useState<IngredienteRead | null>(null);
  const [total, setTotal] = useState(0);

  async function agregar(data: IngredienteCreate) {
    const res = await fetch(INGREDIENTES_PATH, {
      method: "POST",
      headers: jsonAuthHeaders(token),
      body: JSON.stringify(data),
    });

    const nuevo: IngredienteRead = await res.json();
    dispatch({ type: "AGREGAR", payload: nuevo });
  }

  async function eliminar(id: number) {
    await fetch(`${INGREDIENTES_PATH}${id}`, {
      method: "DELETE",
      headers: jsonAuthHeaders(token),
    });
    dispatch({ type: "ELIMINAR", payload: id });
  }

  async function resetear() {
    await fetch(INGREDIENTES_PATH, {
      method: "DELETE",
      headers: jsonAuthHeaders(token),
    });
    dispatch({ type: "RESET", payload: [] });
  }

  async function editar(data: IngredienteRead) {
    const res = await fetch(`${INGREDIENTES_PATH}${data.id}`, {
      method: "PUT",
      headers: jsonAuthHeaders(token),
      body: JSON.stringify(data),
    });

    const actualizado = await res.json();

    dispatch({ type: "EDITAR", payload: actualizado });
    setIngredienteEditar(null);
  }

  async function cargarIngredientes(
    page: number,
    limit: number,
    es_alergeno?: string,
    nombre?: string,
    descripcion?: string,
  ) {
    const offset = (page - 1) * limit;

    const params = new URLSearchParams({
      offset: String(offset),
      limit: String(limit),
    });

    if (es_alergeno) {
      params.append("es_alergeno", es_alergeno);
    }

    if (nombre?.trim()) {
      params.append("nombre", nombre.trim());
    }

    if (descripcion?.trim()) {
      params.append("descripcion", descripcion.trim());
    }

    const res = await fetch(`${INGREDIENTES_PATH}?${params.toString()}`);

    if (!res.ok) {
      throw new Error("Error al cargar ingredientes");
    }

    const data: ListaIngrediente = await res.json();

    dispatch({ type: "SET", payload: data.data });
    setTotal(data.total);
  }

  return (
    <IngredienteContext.Provider
      value={{
        ingredientes: state,
        agregar,
        eliminar,
        resetear,
        editar,
        ingredienteEditar,
        cargarIngredientes,
        setIngredienteEditar,
        total,
      }}
    >
      {children}
    </IngredienteContext.Provider>
  );
}

export function useIngredientes() {
  const context = useContext(IngredienteContext);
  if (!context)
    throw new Error(
      "useIngredientes debe usarse dentro de IngredientesProvider",
    );
  return context;
}
