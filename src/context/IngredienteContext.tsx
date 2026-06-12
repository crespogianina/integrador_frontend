import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useReducer,
} from "react";
import type {
  IngredienteRead,
  IngredienteCreate,
  IngredienteUpdate,
} from "../models/Ingrediente";
import { IngredientesReducer } from "../reducers/ingredienteReducer";
import { API_BASE, apiFetch } from "../config/api";

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
  resetear: () => void;
  editar: (i: IngredienteUpdate) => void;
  activar: (id: number) => void;
  desactivar: (id: number) => void;
  getIngredienteById: (id: number) => Promise<IngredienteRead>;
}

const INGREDIENTES_PATH = `${API_BASE}/ingredientes/`;

const IngredienteContext = createContext<ContextType | null>(null);

export function IngredientesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(IngredientesReducer, []);
  const [total, setTotal] = useState(0);

  async function agregar(data: IngredienteCreate) {
    const res = await apiFetch(INGREDIENTES_PATH, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Error al crear el ingrediente");
    }

    const nuevo: IngredienteRead = await res.json();
    dispatch({ type: "AGREGAR", payload: nuevo });
  }

  async function resetear() {
    await apiFetch(INGREDIENTES_PATH, {
      method: "DELETE",
      credentials: "include",
    });
    dispatch({ type: "RESET", payload: [] });
  }

  async function editar(data: IngredienteUpdate) {
    const res = await apiFetch(`${INGREDIENTES_PATH}${data.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);

      throw new Error(errorData?.detail || "Error al editar el ingrediente");
    }

    const actualizado = await res.json();

    dispatch({ type: "EDITAR", payload: actualizado });
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

    const res = await apiFetch(`${INGREDIENTES_PATH}?${params.toString()}`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Error al cargar ingredientes");
    }

    const data: ListaIngrediente = await res.json();

    dispatch({ type: "SET", payload: data.data });
    setTotal(data.total);
  }

  async function activar(id: number) {
    const res = await apiFetch(`${INGREDIENTES_PATH}${id}`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Error al activar el ingrediente");
    }

    dispatch({ type: "ACTIVAR", payload: id });
  }

  async function desactivar(id: number) {
    const res = await apiFetch(`${INGREDIENTES_PATH}${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.detail || "Error al desactivar el ingrediente",
      );
    }

    dispatch({ type: "DESACTIVAR", payload: id });
  }

  async function getIngredienteById(id: number): Promise<IngredienteRead> {
    const res = await apiFetch(`${INGREDIENTES_PATH}${id}`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.detail || "Error al desactivar el ingrediente",
      );
    }

    const ingrediente: IngredienteRead = await res.json();
    return ingrediente;
  }

  return (
    <IngredienteContext.Provider
      value={{
        ingredientes: state,
        agregar,
        resetear,
        editar,
        cargarIngredientes,
        total,
        activar,
        desactivar,
        getIngredienteById,
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
