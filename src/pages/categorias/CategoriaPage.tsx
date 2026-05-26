import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Filter } from "../../components/Filtros";
import type { CategoriaRead } from "../../models/Categoria";
import { useCategorias } from "../../context/CategoriaContext";
import Filtros from "../../components/Filtros";
import { useAuth } from "../../context/AuthContext";
import Tabla, { type Column } from "../../components/Tabla";

const initialFiltros = {
  nombre: "",
  descripcion: "",
};

const columnasCategoria: Column<CategoriaRead>[] = [
  { header: "Nombre", accessor: "nombre" },
  { header: "Descripción", accessor: "descripcion" },
  {
    header: "Categoria padre",
    accessor: "parent_id",
    customLabelFn: (parentId: number, categorias: CategoriaRead[]) => {
      const categoriaPadre = categorias?.find((c) => c.id === parentId)?.nombre;
      return categoriaPadre || "-";
    },
  },
  {
    header: "Activo",
    accessor: "activo",
    customLabelFn: (activo: boolean) => (activo ? "Activo" : "Inactivo"),
  },
];

export default function CategoriaPage() {
  const navigate = useNavigate();

  const { hasRol } = useAuth();
  const puedeModificar = hasRol("ADMIN");

  const {
    categorias,
    setCategoriaEditar,
    cargarCategorias,
    total,
    activar,
    desactivar,
  } = useCategorias();

  const [filtros, setFiltros] = useState(initialFiltros);
  const [filtrosDebounced, setFiltrosDebounced] = useState(initialFiltros);
  const [errorRequest, setErrorRequest] = useState<string>("");
  const [paginaActual, setPaginaActual] = useState(1);

  const elementosPorPagina = 10;
  const totalPaginas = Math.ceil(total / elementosPorPagina);
  const categoriasFiltros: Filter[] = [
    {
      name: "nombre",
      value: filtros.nombre,
      type: "input",
      placeholder: "Buscar por nombre",
      label: "Nombre",
    },
    {
      name: "descripcion",
      value: filtros.descripcion,
      type: "input",
      placeholder: "Buscar por descripcion",
      label: "Descripción",
    },
  ];

  useEffect(() => {
    if (!errorRequest) return;

    const timer = setTimeout(() => {
      setErrorRequest("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [errorRequest]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFiltrosDebounced(filtros);
      setPaginaActual(1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [filtros]);

  useEffect(() => {
    cargarCategorias(
      paginaActual,
      elementosPorPagina,
      filtrosDebounced.nombre,
      filtrosDebounced.descripcion,
    );
  }, [paginaActual, filtrosDebounced.nombre, filtrosDebounced.descripcion]);

  const handleEdit = (categoria: CategoriaRead) => {
    setCategoriaEditar(categoria);
    navigate(`/categorias/editar/${categoria.id}`);
  };

  const handleCreate = () => {
    setCategoriaEditar(null);
    navigate("/categorias/nuevo");
  };

  const getCustomActionLabel = (categoria: CategoriaRead): string => {
    return categoria.activo ? "Desactivar" : "Activar";
  };

  const customAction = (categoria: CategoriaRead) => {
    if (categoria.activo) {
      deactivateProduct(categoria);
    } else {
      activateProduct(categoria);
    }
  };

  const activateProduct = async (categoria: CategoriaRead) => {
    try {
      await activar(categoria.id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al activar el categoria",
      );
    }
  };

  const deactivateProduct = async (categoria: CategoriaRead) => {
    try {
      await desactivar(categoria.id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al desactivar el categoria",
      );
    }
  };

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <section className="space-y-4">
          <Filtros
            filters={categoriasFiltros}
            onChange={(name, value) =>
              setFiltros((prev) => ({ ...prev, [name]: value }))
            }
            onClear={() => setFiltros(initialFiltros)}
          />

          <Tabla
            title="Categorías"
            total={total}
            data={categorias || []}
            columns={columnasCategoria}
            getRowId={(c) => c.id}
            onAdd={puedeModificar ? handleCreate : undefined}
            onEdit={puedeModificar ? handleEdit : undefined}
            showEditButtonCondition={(categoria) => categoria?.activo ?? true}
            page={paginaActual}
            totalPages={totalPaginas}
            onPrevious={() => setPaginaActual(paginaActual - 1)}
            onNext={() => setPaginaActual(paginaActual + 1)}
            onPageChange={setPaginaActual}
            customAction={{
              label: getCustomActionLabel,
              actionCallback: customAction,
            }}
          />
        </section>

        {errorRequest && (
          <div className="fixed bottom-10 right-5 z-50">
            <div className="animate-slide-in rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
              {errorRequest}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
