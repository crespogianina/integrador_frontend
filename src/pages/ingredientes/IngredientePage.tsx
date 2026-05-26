import { useEffect, useState } from "react";
import Filtros, { type Filter } from "../../components/Filtros";
import { useIngredientes } from "../../context/IngredienteContext";
import { useNavigate } from "react-router-dom";
import type { IngredienteRead } from "../../models/Ingrediente";
import { useAuth } from "../../context/AuthContext";
import type { Column } from "../../components/Tabla";
import Tabla from "../../components/Tabla";

const initialFiltros = {
  nombre: "",
  descripcion: "",
  es_alergeno: "",
};

const columns: Column<IngredienteRead>[] = [
  { header: "Nombre", accessor: "nombre" },
  { header: "Descripción", accessor: "descripcion" },
  { header: "Alérgeno", accessor: "es_alergeno" },
  {
    header: "Activo",
    accessor: "activo",
    customLabelFn: (activo: boolean) => (activo ? "Activo" : "Inactivo"),
  },
];

export default function IngredientePage() {
  const navigate = useNavigate();

  const { hasRol } = useAuth();
  const puedeModificar = hasRol("ADMIN");

  const {
    ingredientes,
    setIngredienteEditar,
    cargarIngredientes,
    total,
    activar,
    desactivar,
  } = useIngredientes();

  const [filtros, setFiltros] = useState(initialFiltros);
  const [filtrosDebounced, setFiltrosDebounced] = useState(initialFiltros);
  const [errorRequest, setErrorRequest] = useState<string>("");

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;
  const totalPaginas = Math.ceil(total / elementosPorPagina);
  const ingredientesFiltros: Filter[] = [
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
    {
      name: "es_alergeno",
      value: filtros.es_alergeno,
      type: "select",
      label: "Alergeno",
      options: [
        { label: "Es alergeno", value: "true" },
        { label: "No es alergeno", value: "false" },
      ],
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
    cargarIngredientes(
      paginaActual,
      elementosPorPagina,
      filtrosDebounced.es_alergeno,
      filtrosDebounced.nombre,
      filtrosDebounced.descripcion,
    );
  }, [
    paginaActual,
    filtrosDebounced.es_alergeno,
    filtrosDebounced.descripcion,
    filtrosDebounced.nombre,
  ]);

  const handleEdit = (ingrediente: IngredienteRead) => {
    setIngredienteEditar(ingrediente);
    navigate(`/ingredientes/editar/${ingrediente.id}`);
  };

  const handleCreate = () => {
    setIngredienteEditar(null);
    navigate("/ingredientes/nuevo");
  };

  const getCustomActionLabel = (ingrediente: IngredienteRead): string => {
    return ingrediente.activo ? "Desactivar" : "Activar";
  };

  const customAction = (ingrediente: IngredienteRead) => {
    if (ingrediente.activo) {
      deactivateProduct(ingrediente);
    } else {
      activateProduct(ingrediente);
    }
  };

  const activateProduct = async (ingrediente: IngredienteRead) => {
    try {
      await activar(ingrediente.id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al activar el ingrediente",
      );
    }
  };

  const deactivateProduct = async (ingrediente: IngredienteRead) => {
    try {
      await desactivar(ingrediente.id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al desactivar el ingrediente",
      );
    }
  };

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="">
          <section className="space-y-4">
            <Filtros
              filters={ingredientesFiltros}
              onChange={(name, value) =>
                setFiltros((prev) => ({ ...prev, [name]: value }))
              }
              onClear={() => setFiltros(initialFiltros)}
            />

            <Tabla
              title="Ingredientes"
              total={total}
              data={ingredientes || []}
              columns={columns}
              getRowId={(i) => i.id}
              onAdd={puedeModificar ? handleCreate : undefined}
              onEdit={puedeModificar ? handleEdit : undefined}
              showEditButtonCondition={(ingrediente) => ingrediente.activo}
              page={paginaActual}
              totalPages={totalPaginas}
              onPrevious={() => setPaginaActual((p) => p - 1)}
              onNext={() => setPaginaActual((p) => p + 1)}
              onPageChange={setPaginaActual}
              customAction={{
                label: getCustomActionLabel,
                actionCallback: customAction,
              }}
            />
          </section>
        </div>

        {errorRequest && (
          <div className="fixed bottom-10 right-5 z-50">
            <div className="bg-red-500 text-white px-4 py-3 rounded-b-md shadow-lg animate-slide-in">
              {errorRequest}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
