import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductos } from "../../context/ProductoContext";
import type { Filter } from "../../components/Filtros";
import Filtros from "../../components/Filtros";
import type { ProductoRead } from "../../models/Producto";
import { useAuth } from "../../context/AuthContext";
import type { Column } from "../../components/Tabla";
import Tabla from "../../components/Tabla";

const initialFiltros = {
  nombre: "",
  descripcion: "",
  disponible: "",
};

const columns: Column<ProductoRead>[] = [
  { header: "Nombre", accessor: "nombre" },
  { header: "Descripción", accessor: "descripcion" },
  { header: "Precio", accessor: "precio_base" },
  { header: "Stock", accessor: "stock_cantidad" },
  {
    header: "Estado",
    accessor: "disponible",
    customLabelFn: (disponible: boolean) =>
      disponible ? "Activo" : "Inactivo",
  },
];

export default function ProductoPage() {
  const navigate = useNavigate();

  const { hasRol } = useAuth();
  const puedeModificar = hasRol("ADMIN");

  const {
    productos,
    setProductoEditar,
    cargarProductos,
    total,
    activar,
    desactivar,
  } = useProductos();

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
    }, 1000);

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

  const customAction = (producto: ProductoRead) => {
    if (producto.disponible) {
      deactivateProduct(producto);
    } else {
      activateProduct(producto);
    }
  };

  const activateProduct = async (producto: ProductoRead) => {
    try {
      await activar(producto.id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al activar el producto",
      );
    }
  };

  const deactivateProduct = async (producto: ProductoRead) => {
    try {
      await desactivar(producto.id);
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al desactivar el producto",
      );
    }
  };

  const getCustomActionLabel = (producto: ProductoRead): string => {
    return producto.disponible ? "Desactivar" : "Activar";
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
              columns={columns}
              getRowId={(producto) => producto.id}
              onAdd={puedeModificar ? handleCreate : undefined}
              onEdit={puedeModificar ? handleEdit : undefined}
              showEditButtonCondition={(producto) => producto.disponible}
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
