import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductos } from "../../context/ProductoContext";
import type { Filter } from "../../components/Filtros";
import Filtros from "../../components/Filtros";
import type { ProductoRead } from "../../models/Producto";
import CardGrid from "../../components/CardGrid";

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
  const [errorRequest, setErrorRequest] = useState<string>("");
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
    console.log(producto);
    setProductoEditar(producto);
    navigate(`/productos/editar/${producto.id}`);
  };

  const handleCreate = () => {
    setProductoEditar(null);
    navigate("/productos/nuevo");
  };

  const handleDelete = async (id: number) => {
    try {
      await eliminar(id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al eliminar el producto",
      );
    }
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

            <CardGrid<ProductoRead>
              title="Productos"
              total={total}
              data={productos || []}
              getRowId={(producto) => producto.id}
              getTitle={(producto) => producto.nombre}
              getDescription={(producto) => producto.descripcion}
              badge={(producto) =>
                producto.disponible ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Disponible
                  </span>
                ) : (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    No disponible
                  </span>
                )
              }
              fields={[
                {
                  label: "Precio",
                  render: (producto) => `$${producto.precio_base}`,
                },
                {
                  label: "Stock",
                  render: (producto) => producto.stock_cantidad,
                },
                {
                  label: "Categorías",
                  render: (producto) =>
                    producto.categorias?.length
                      ? producto.categorias.map((c) => c.nombre).join(", ")
                      : "Sin categorías",
                },
                {
                  label: "Ingredientes",
                  render: (producto) =>
                    producto.ingredientes?.length
                      ? producto.ingredientes.map((i) => i.nombre).join(", ")
                      : "Sin ingredientes",
                },
              ]}
              onAdd={handleCreate}
              onEdit={handleEdit}
              onDelete={(producto) => handleDelete(producto.id)}
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
