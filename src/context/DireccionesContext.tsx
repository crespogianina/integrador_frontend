import {
  createContext,
  useContext,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type {
  Direccion,
  DireccionCreate,
  DireccionList,
  DireccionUpdate,
} from "../models/Direccion";
import { DireccionReducer } from "../reducers/direccionReducer";
import { API_BASE, apiFetch } from "../config/api";

interface ContextType {
  direcciones: Direccion[];
  total: number;
  direccionEditar: Direccion | null;
  setDireccionEditar: (d: Direccion | null) => void;
  cargarDirecciones: (page: number, limit: number) => Promise<void>;
  cargarDireccion: (id: number) => Promise<void>;
  agregar: (data: DireccionCreate) => Promise<Direccion>;
  editar: (id: number, data: DireccionUpdate) => Promise<Direccion>;
  eliminar: (id: number) => Promise<void>;
  marcarPrincipal: (id: number) => Promise<Direccion>;
}

const API = `${API_BASE}/direcciones/`;

const DireccionesContext = createContext<ContextType | null>(null);

export function DireccionesProvider({ children }: { children: ReactNode }) {
  const [direcciones, dispatch] = useReducer(DireccionReducer, []);

  const [direccionEditar, setDireccionEditar] = useState<Direccion | null>(
    null,
  );

  const [total, setTotal] = useState(0);

  async function cargarDirecciones(page: number, limit: number) {
    const offset = (page - 1) * limit;

    const res = await apiFetch(`${API}?offset=${offset}&limit=${limit}`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Error al cargar direcciones");
    }

    const data: DireccionList = await res.json();

    dispatch({
      type: "SET",
      payload: data.data,
    });
    setTotal(data.total);
  }

  async function cargarDireccion(id: number) {
    const res = await apiFetch(`${API}${id}`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Error al cargar dirección");
    }

    const data: Direccion = await res.json();

    setDireccionEditar(data);
  }
  async function agregar(data: DireccionCreate) {
    const res = await apiFetch(API, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);

      throw new Error(error?.detail || "Error al crear dirección");
    }

    const nueva = await res.json();

    dispatch({
      type: "AGREGAR",
      payload: nueva,
    });

    return nueva;
  }

  async function editar(id: number, data: DireccionUpdate) {
    const res = await apiFetch(`${API}${id}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);

      throw new Error(error?.detail || "Error al editar dirección");
    }

    const actualizada = await res.json();

    dispatch({
      type: "EDITAR",
      payload: actualizada,
    });

    return actualizada;
  }

  async function eliminar(id: number) {
    const res = await apiFetch(`${API}${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);

      throw new Error(error?.detail || "Error al eliminar dirección");
    }

    await cargarDirecciones(1, 10);
  }

  async function marcarPrincipal(id: number) {
    const res = await apiFetch(`${API}${id}/principal`, {
      method: "PATCH",
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => null);

      throw new Error(error?.detail || "Error al marcar dirección principal");
    }

    const actualizada = await res.json();

    dispatch({
      type: "PRINCIPAL",
      payload: actualizada,
    });

    return actualizada;
  }

  return (
    <DireccionesContext.Provider
      value={{
        direcciones: direcciones,
        total,
        direccionEditar,
        setDireccionEditar,
        editar,
        cargarDirecciones,
        cargarDireccion,
        agregar,
        eliminar,
        marcarPrincipal,
      }}
    >
      {children}
    </DireccionesContext.Provider>
  );
}

export function useDirecciones() {
  const context = useContext(DireccionesContext);
  if (!context)
    throw new Error("useDirecciones debe usarse dentro de DireccionesProvider");
  return context;
}
