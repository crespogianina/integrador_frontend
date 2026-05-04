import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Filter } from "../../components/Filtros";
import type { CategoriaRead } from "../../models/Categoria";
import type { Column } from "../../components/Tabla";
import { useCategorias } from "../../context/CategoriaContext";
import Filtros from "../../components/Filtros";
import Tabla from "../../components/Tabla";

const categoriaColumnas: Column<CategoriaRead>[] = [
  //   { header: "ID", accessor: "id" },
  { header: "Nombre", accessor: "nombre" },
  { header: "Descripcion", accessor: "descripcion" },
];

const initialFiltros = {
  nombre: "",
  descripcion: "",
};

export default function CategoriaPage() {
  const navigate = useNavigate();

  const { categorias, eliminar, setCategoriaEditar, cargarCategorias, total } =
    useCategorias();

  const [filtros, setFiltros] = useState(initialFiltros);

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;
  const totalPaginas = Math.ceil(total / elementosPorPagina);
  const categoriasFiltros: Filter[] = [
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
  ];

  useEffect(() => {
    cargarCategorias(paginaActual, elementosPorPagina);
  }, [paginaActual]);

  const handleEdit = (categoria: CategoriaRead) => {
    setCategoriaEditar(categoria);
    console.log(categoria.id);
    navigate(`/categorias/editar/${categoria.id}`);
  };

  const handleCreate = () => {
    setCategoriaEditar(null);
    navigate("/categorias/nuevo");
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
              filters={categoriasFiltros}
              onChange={(name, value) =>
                setFiltros((prev) => ({ ...prev, [name]: value }))
              }
              onClear={() => setFiltros(initialFiltros)}
            />

            <Tabla
              title="Categorias"
              total={total}
              data={categorias || []}
              columns={categoriaColumnas}
              getRowId={(categoria) => categoria.id}
              onAdd={handleCreate}
              onEdit={(categoria) => handleEdit(categoria)}
              onDelete={(categoria) => handleDelete(categoria.id)}
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
