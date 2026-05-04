import { useEffect, useState } from "react";
import type { Column } from "../../components/Tabla";
import { useNavigate } from "react-router-dom";
import { useProductos } from "../../context/ProductoContext";
import type { Filter } from "../../components/Filtros";
import Filtros from "../../components/Filtros";
import Tabla from "../../components/Tabla";
import type { ProductoRead } from "../../models/Producto";

const productosColumnas: Column<ProductoRead>[] = [
  //   { header: "ID", accessor: "id" },
  { header: "Nombre", accessor: "nombre" },
  { header: "Descripcion", accessor: "descripcion" },
  { header: "Stock", accessor: "stock_cantidad" },
  { header: "Precio Base", accessor: "precio_base" },
  { header: "Disponible", accessor: "disponible" },
];

const initialFiltros = {
  nombre: "",
  descripcion: "",
  disponible: "",
};

export default function ProductoPage() {
  const navigate = useNavigate();

  const { productos, eliminar, setProductoEditar, cargarProductos, total } =
    useProductos();

  const [filtros, setFiltros] = useState(initialFiltros);
  const [filtrosDebounced, setFiltrosDebounced] = useState(initialFiltros);

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;
  const totalPaginas = Math.ceil(total / elementosPorPagina);
  const productosFiltros: Filter[] = [
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
      name: "disponible",
      value: filtros.disponible,
      type: "select",
      label: "Disponible",
      options: [
        { label: "Esta disponible", value: "true" },
        { label: "No esta disponible", value: "false" },
      ],
    },
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFiltrosDebounced(filtros);
      setPaginaActual(1);
    }, 500);

    return () => clearTimeout(timeout);
  }, [filtros]);

  useEffect(() => {
    cargarProductos(
      paginaActual,
      elementosPorPagina,
      filtrosDebounced.nombre,
      filtrosDebounced.descripcion,
      filtrosDebounced.disponible,
    );
  }, [
    paginaActual,
    filtrosDebounced.nombre,
    filtrosDebounced.descripcion,
    filtrosDebounced.disponible,
  ]);

  const handleEdit = (producto: ProductoRead) => {
    setProductoEditar(producto);
    navigate(`/productos/editar/${producto.id}`);
  };

  const handleCreate = () => {
    setProductoEditar(null);
    navigate("/productos/nuevo");
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
              filters={productosFiltros}
              onChange={(name, value) =>
                setFiltros((prev) => ({ ...prev, [name]: value }))
              }
              onClear={() => setFiltros(initialFiltros)}
            />

            <Tabla
              title="Productos"
              total={total}
              data={productos || []}
              columns={productosColumnas}
              getRowId={(producto) => producto.id}
              onAdd={handleCreate}
              onEdit={(producto) => handleEdit(producto)}
              onDelete={(producto) => handleDelete(producto.id)}
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
