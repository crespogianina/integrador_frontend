import { useEffect, useState } from "react";
import Filtros, { type Filter } from "../../components/Filtros";
import Tabla, { type Column } from "../../components/Tabla";
import { useIngredientes } from "../../context/IngredienteContext";
import { useNavigate } from "react-router-dom";
import type { IngredienteRead } from "../../models/Ingrediente";

const ingredientesColumnas: Column<IngredienteRead>[] = [
  //   { header: "ID", accessor: "id" },
  { header: "Nombre", accessor: "nombre" },
  { header: "Descripcion", accessor: "descripcion" },
  { header: "Es alergeno", accessor: "es_alergeno" },
];

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

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;
  const totalPaginas = Math.ceil(total / elementosPorPagina);
  const ingredientesFiltros: Filter[] = [
    {
      name: "nombre",
      value: filtros.nombre,
      type: "input",
      placeholder: "Buscar por nombre",
    },
    {
      name: "description",
      value: filtros.descripcion,
      type: "input",
      placeholder: "Buscar por descripcion",
    },
    {
      name: "es_alergeno",
      value: filtros.es_alergeno,
      type: "select",
      options: [
        { label: "Es alergeno", value: "true" },
        { label: "No es alergeno", value: "false" },
      ],
    },
  ];

  useEffect(() => {
    cargarIngredientes(paginaActual, elementosPorPagina, filtros.es_alergeno);
  }, [paginaActual, filtros.es_alergeno]);

  const handleEdit = (ingrediente: IngredienteRead) => {
    setIngredienteEditar(ingrediente);
    navigate(`/ingredientes/editar/${ingrediente.id}`);
  };

  const handleCreate = () => {
    setIngredienteEditar(null);
    navigate("/ingredientes/nuevo");
  };

  const handleDelete = (id: number) => {
    eliminar(id);
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
              columns={ingredientesColumnas}
              getRowId={(ingrediente) => ingrediente.id}
              onAdd={handleCreate}
              onEdit={(ingrediente) => handleEdit(ingrediente)}
              onDelete={(ingrediente) => handleDelete(ingrediente.id)}
              page={paginaActual}
              totalPages={totalPaginas}
              onPrevious={() => setPaginaActual(paginaActual - 1)}
              onNext={() => setPaginaActual(paginaActual + 1)}
              onPageChange={(page) => setPaginaActual(page)}
            />
          </section>
        </div>
      </section>
    </main>
  );
}
