import { useEffect, useState } from "react";
import Filtros, { type Filter } from "../../components/Filtros";
import { useIngredientes } from "../../context/IngredienteContext";
import { useNavigate } from "react-router-dom";
import type { IngredienteRead } from "../../models/Ingrediente";
import CardGrid from "../../components/CardGrid";

const initialFiltros = {
  nombre: "",
  descripcion: "",
  es_alergeno: "",
};

export default function IngredientePage() {
  const navigate = useNavigate();

  const {
    ingredientes,
    eliminar,
    setIngredienteEditar,
    cargarIngredientes,
    total,
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
    }, 500);

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

  const handleDelete = async (id: number) => {
    try {
      await eliminar(id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al eliminar el ingrediente",
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

            <CardGrid
              title="Ingredientes"
              total={total}
              data={ingredientes || []}
              getRowId={(i) => i.id}
              getTitle={(i) => i.nombre}
              getDescription={(i) => i.descripcion}
              badge={(i) =>
                i.es_alergeno ? (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Alérgeno
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    No alérgeno
                  </span>
                )
              }
              onAdd={handleCreate}
              onEdit={handleEdit}
              onDelete={(i) => handleDelete(i.id)}
              page={paginaActual}
              totalPages={totalPaginas}
              onPrevious={() => setPaginaActual(paginaActual - 1)}
              onNext={() => setPaginaActual(paginaActual + 1)}
              onPageChange={setPaginaActual}
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
