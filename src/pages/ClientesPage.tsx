import { useCallback, useEffect, useState } from "react";
import { apiFetch, API_BASE } from "../config/api";
import Filtros, { type Filter } from "../components/Filtros";
import Tabla, { type Column } from "../components/Tabla";

const USUARIOS_PATH = `${API_BASE}/usuario/admin/usuarios`;
const ELEMENTOS_POR_PAGINA = 10;

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
  deleted_at: string | null;
}

const initialFiltros = {
  nombre: "",
  email: "",
  estado: "",
};

const columns: Column<Cliente>[] = [
  {
    header: "Nombre",
    accessor: "nombre",
    customLabelFn: (nombre: string, data: Cliente[]) => {
      const cliente = data.find((c) => c.nombre === nombre);
      return `${nombre} ${cliente?.apellido ?? ""}`;
    },
  },
  { header: "Email", accessor: "email" },
  {
    header: "Roles",
    accessor: "roles",
    customLabelFn: (roles: string[]) => roles.join(", "),
  },
  {
    header: "Estado",
    accessor: "deleted_at",
    customLabelFn: (deleted_at: string | null) =>
      deleted_at ? "Inactivo" : "Activo",
  },
];

export function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtros, setFiltros] = useState(initialFiltros);
  const [filtrosDebounced, setFiltrosDebounced] = useState(initialFiltros);
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState<number | null>(null);
  const [errorRequest, setErrorRequest] = useState("");

  const totalPaginas = Math.ceil(total / ELEMENTOS_POR_PAGINA);

  const cargarClientes = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        offset: String((paginaActual - 1) * ELEMENTOS_POR_PAGINA),
        limit: String(ELEMENTOS_POR_PAGINA),
        rol: "CLIENT",
      });

      // NUEVO: Agregamos los filtros del debounced si tienen texto
      if (filtrosDebounced.nombre) params.append("nombre", filtrosDebounced.nombre);
      if (filtrosDebounced.email) params.append("email", filtrosDebounced.email);

      const res = await apiFetch(`${USUARIOS_PATH}?${params}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "Error al cargar los clientes");
      }

      const body = await res.json();

      if (Array.isArray(body)) {
        setClientes(body);
        setTotal(body.length);
      } else {
        setClientes(body.items ?? body);
        setTotal(body.total ?? (body.items ?? body).length);
      }
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al cargar los clientes",
      );
    } finally {
      setCargando(false);
    }
  }, [paginaActual, filtrosDebounced.nombre, filtrosDebounced.email]);

  useEffect(() => {
    cargarClientes();
  }, [cargarClientes]);

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 2000);
    return () => clearTimeout(timer);
  }, [errorRequest]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFiltrosDebounced(filtros);
      setPaginaActual(1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [filtros]);

  const toggleEstado = async (cliente: Cliente) => {
    const esActivo = !cliente.deleted_at;
    const accion = esActivo ? "desactivar" : "activar";
    setAccionando(cliente.id);
    try {
      const res = await apiFetch(
        `${USUARIOS_PATH}/${cliente.id}/${accion}`,
        { method: "POST", credentials: "include" },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || `No se pudo ${accion} el usuario`);
      }

      await cargarClientes();
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : `No se pudo ${accion} el usuario`,
      );
    } finally {
      setAccionando(null);
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
  
    const coincideEstado =
      !filtrosDebounced.estado ||
      (filtrosDebounced.estado === "activo" && !c.deleted_at) ||
      (filtrosDebounced.estado === "inactivo" && !!c.deleted_at);

    return coincideEstado;
  });

  const clientesFiltros: Filter[] = [
  {
    name: "nombre",
    value: filtros.nombre,
    type: "input",
    placeholder: "Ej: Juan Pérez",
    label: "Nombre o Apellido",
  },
  {
    name: "email",
    value: filtros.email,
    type: "input",
    placeholder: "Ej: correo@ejemplo.com",
    label: "Email",
  },
  {
    name: "estado",
    value: filtros.estado,
    type: "select",
    label: "Estado",
    options: [
      { label: "Activo", value: "activo" },
      { label: "Inactivo", value: "inactivo" },
    ],
  },
];

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-4">
          <Filtros
            filters={clientesFiltros}
            onChange={(name, value) =>
              setFiltros((prev) => ({ ...prev, [name]: value }))
            }
            onClear={() => setFiltros(initialFiltros)}
          />

          {cargando ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          ) : (
            <Tabla
                title="Clientes"
                total={clientesFiltrados.length}
                data={clientesFiltrados}
                columns={columns}
                getRowId={(c) => c.id}
                page={paginaActual}
                totalPages={totalPaginas}
                onPrevious={() => setPaginaActual((p) => p - 1)}
                onNext={() => setPaginaActual((p) => p + 1)}
                onPageChange={setPaginaActual}
                emptyMessage="No se encontraron clientes."
                onEdit={() => {}}
                showEditButtonCondition={() => false}
                customAction={{
                    label: (cliente) =>
                    accionando === cliente.id
                        ? "Procesando..."
                        : cliente.deleted_at
                        ? "Activar"
                        : "Desactivar",
                    actionCallback: toggleEstado,
                }}
                />
          )}
        </div>

        {errorRequest && (
          <div className="fixed bottom-10 right-5 z-50">
            <div className="bg-red-500 text-white px-4 py-3 rounded-b-md shadow-lg">
              {errorRequest}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
