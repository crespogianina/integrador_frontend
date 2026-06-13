import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Direccion } from "../../models/Direccion";
import type { Column } from "../../components/Tabla";
import { useDirecciones } from "../../context/DireccionesContext";
import Tabla from "../../components/Tabla";

const ELEMENTOS_POR_PAGINA = 10;

const columns: Column<Direccion>[] = [
  {
    header: "Alias",
    accessor: "alias",
    customLabelFn: (alias?: string | null) => alias || "-",
  },
  {
    header: "Dirección",
    accessor: "linea1",
  },
  {
    header: "Ciudad",
    accessor: "ciudad",
  },
  {
    header: "Provincia",
    accessor: "provincia",
    customLabelFn: (provincia?: string | null) => provincia || "-",
  },
  {
    header: "CP",
    accessor: "codigo_postal",
    customLabelFn: (cp?: string | null) => cp || "-",
  },
  {
    header: "Principal",
    accessor: "es_principal",
    customLabelFn: (value: boolean) => (value ? "Sí" : "No"),
  },
];

export default function DireccionesPage() {
  const navigate = useNavigate();

  const { direcciones, total, cargarDirecciones, eliminar, marcarPrincipal } =
    useDirecciones();

  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [errorRequest, setErrorRequest] = useState("");
  const [accionando, setAccionando] = useState<number | null>(null);

  const totalPaginas = Math.ceil(total / ELEMENTOS_POR_PAGINA);

  useEffect(() => {
    const cargar = async () => {
      try {
        setCargando(true);

        await cargarDirecciones(paginaActual, ELEMENTOS_POR_PAGINA);
      } catch (error) {
        setErrorRequest(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las direcciones",
        );
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [paginaActual]);

  useEffect(() => {
    if (!errorRequest) return;

    const timer = setTimeout(() => {
      setErrorRequest("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [errorRequest]);

  const handleEliminar = async (direccion: Direccion) => {
    try {
      setAccionando(direccion.id);
      await eliminar(direccion.id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la dirección",
      );
    } finally {
      setAccionando(null);
    }
  };

  const handlePrincipal = async (direccion: Direccion) => {
    try {
      setAccionando(direccion.id);
      await marcarPrincipal(direccion.id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "No se pudo marcar la dirección como principal",
      );
    } finally {
      setAccionando(null);
    }
  };

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Mis Direcciones
            </h1>

            <p className="text-sm text-slate-500">
              Administrá tus direcciones de entrega.
            </p>
          </div>

          <button
            onClick={() => navigate("/direcciones/nueva")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Nueva dirección
          </button>
        </div>

        {cargando ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-slate-200"
              />
            ))}
          </div>
        ) : (
          <Tabla
            title="Direcciones"
            total={total}
            data={direcciones}
            columns={columns}
            getRowId={(d) => d.id}
            page={paginaActual}
            totalPages={totalPaginas}
            onPrevious={() => setPaginaActual((p) => p - 1)}
            onNext={() => setPaginaActual((p) => p + 1)}
            onPageChange={setPaginaActual}
            emptyMessage="No hay direcciones registradas."
            onEdit={(direccion: Direccion) =>
              navigate(`/direcciones/editar/${direccion.id}`)
            }
            onDelete={handleEliminar}
            customAction={{
              label: (direccion: Direccion) =>
                accionando === direccion.id
                  ? "Procesando..."
                  : direccion.es_principal
                    ? "Principal"
                    : "Marcar principal",
              actionCallback: handlePrincipal,
            }}
          />
        )}

        {errorRequest && (
          <div className="fixed bottom-10 right-5 z-50">
            <div className="rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
              {errorRequest}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
