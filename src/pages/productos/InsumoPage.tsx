import { useMemo, useState } from "react";
import Tabla from "../../components/Tabla";
import Filtros from "../../components/Filtros";

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

  const [filters, setFilters] = useState({
    nombre: "",
    categoria: "",
  });

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="">
          <section className="space-y-4">
            <Filtros
              filters={[
                {
                  name: "nombre",
                  value: filters.nombre,
                  type: "input",
                  placeholder: "Buscar nombre",
                },
                {
                  name: "categoria",
                  value: filters.categoria,
                  type: "select",
                  options: [],
                },
              ]}
              onChange={(name, value) =>
                setFilters((prev) => ({ ...prev, [name]: value }))
              }
              onClear={() => setFilters({ nombre: "", categoria: "" })}
            />

            {/* Tabla\ */}

            <Tabla
              title="Ingredientes"
              total={insumos.length}
              data={insumos}
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Nombre", accessor: "nombre" },
              ]}
              getRowId={(item) => item.id}
              onAdd={() => console.log("Agregar")}
              onEdit={(item) => console.log("Editar", item)}
              onDelete={(item) => console.log("Eliminar", item)}
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
