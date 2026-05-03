import { useMemo, useState } from "react";
import Tabla from "../components/Tabla";
import Filters from "../components/Filtros";

type Insumo = {
  id: number;
  nombre: string;
  categoria: string;
  stock: number;
  unidad: string;
  precio: number;
  estado: "Activo" | "Inactivo";
};

//cambiarlo por producto pero va despues

export default function InsumoPage() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [form, setForm] = useState<Omit<Insumo, "id">>();
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  const insumosFiltrados = useMemo(() => {
    return insumos.filter((insumo) => {
      const coincideNombre = insumo.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      const coincideCategoria =
        !categoriaFiltro || insumo.categoria === categoriaFiltro;

      const coincideEstado = !estadoFiltro || insumo.estado === estadoFiltro;

      return coincideNombre && coincideCategoria && coincideEstado;
    });
  }, [insumos, busqueda, categoriaFiltro, estadoFiltro]);

  const totalPaginas = Math.ceil(insumosFiltrados.length / elementosPorPagina);

  const insumosPaginados = insumosFiltrados.slice(
    (paginaActual - 1) * elementosPorPagina,
    paginaActual * elementosPorPagina,
  );

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    // const { name, value } = event.target;
    // setForm({
    //   ...form,
    //   [name]: name === "stock" || name === "precio" ? Number(value) : value,
    // });
  }

  function handleSubmit(event: React.FormEvent) {
    // event.preventDefault();
    // if (!form.nombre || !form.categoria || !form.unidad) {
    //   alert("Completa los campos obligatorios");
    //   return;
    // }
    // if (editandoId) {
    //   setInsumos((prev) =>
    //     prev.map((insumo) =>
    //       insumo.id === editandoId ? { ...form, id: editandoId } : insumo,
    //     ),
    //   );
    //   setEditandoId(null);
    // } else {
    //   const nuevoInsumo: Insumo = {
    //     ...form,
    //     id: Date.now(),
    //   };
    //   setInsumos((prev) => [...prev, nuevoInsumo]);
    // }
    // setForm(insumoVacio);
  }

  function editarInsumo(insumo: Insumo) {
    // setForm({
    //   nombre: insumo.nombre,
    //   categoria: insumo.categoria,
    //   stock: insumo.stock,
    //   unidad: insumo.unidad,
    //   precio: insumo.precio,
    //   estado: insumo.estado,
    // });
    // setEditandoId(insumo.id);
  }

  function eliminarInsumo(id: number) {
    // const confirmar = confirm("¿Seguro que querés eliminar este insumo?");
    // if (!confirmar) return;
    // setInsumos((prev) => prev.filter((insumo) => insumo.id !== id));
  }

  function limpiarFiltros() {
    // setBusqueda("");
    // setCategoriaFiltro("");
    // setEstadoFiltro("");
    // setPaginaActual(1);
  }

  const categorias = Array.from(
    new Set(insumos.map((insumo) => insumo.categoria)),
  );

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="">
          <section className="space-y-4">
            <Filters
              filters={[
                {
                  type: "input",
                  value: busqueda,
                  placeholder: "Buscar por nombre...",
                  onChange: (value) => {
                    setBusqueda(value);
                    setPaginaActual(1);
                  },
                },
                {
                  type: "select",
                  value: categoriaFiltro,
                  onChange: (value) => {
                    setCategoriaFiltro(value);
                    setPaginaActual(1);
                  },
                  options: [
                    { label: "Todas las categorías", value: "" },
                    ...categorias.map((categoria) => ({
                      label: categoria,
                      value: categoria,
                    })),
                  ],
                },
                {
                  type: "select",
                  value: estadoFiltro,
                  onChange: (value) => {
                    setEstadoFiltro(value);
                    setPaginaActual(1);
                  },
                  options: [
                    { label: "Todos los estados", value: "" },
                    { label: "Activo", value: "Activo" },
                    { label: "Inactivo", value: "Inactivo" },
                  ],
                },
              ]}
              onClear={limpiarFiltros}
            />

            {/* Tabla\ */}

            <Tabla
              title="Listado de insumos"
              total={insumosFiltrados.length}
              data={insumosPaginados}
              getRowId={(insumo) => insumo.id}
              columns={[
                {
                  header: "Nombre",
                  accessor: "nombre",
                  className: "font-medium text-slate-800",
                },
                {
                  header: "Categoría",
                  accessor: "categoria",
                },
                {
                  header: "Stock",
                  accessor: "stock",
                  render: (insumo) => `${insumo.stock} ${insumo.unidad}`,
                },
                {
                  header: "Precio",
                  accessor: "precio",
                  render: (insumo) => `$${insumo.precio}`,
                },
                {
                  header: "Estado",
                  accessor: "estado",
                  render: (insumo) => (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        insumo.estado === "Activo"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {insumo.estado}
                    </span>
                  ),
                },
              ]}
              renderActions={(insumo) => (
                <>
                  <button
                    onClick={() => editarInsumo(insumo)}
                    className="rounded-lg bg-amber-100 px-3 py-1 font-medium text-amber-700 hover:bg-amber-200"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarInsumo(insumo.id)}
                    className="rounded-lg bg-red-100 px-3 py-1 font-medium text-red-700 hover:bg-red-200"
                  >
                    Eliminar
                  </button>
                </>
              )}
              pagination={{
                page: paginaActual,
                totalPages: totalPaginas,
                onPrevious: () => setPaginaActual((prev) => prev - 1),
                onNext: () => setPaginaActual((prev) => prev + 1),
                onPageChange: (page) => setPaginaActual(page),
              }}
            />
          </section>
        </div>
      </section>
    </main>
  );
}
