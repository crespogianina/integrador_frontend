import { useState } from "react";
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

// cambiarlo por producto pero va despues

export default function InsumoPage() {
  const [insumos] = useState<Insumo[]>([]);

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  const totalPaginas = Math.max(
    1,
    Math.ceil(insumos.length / elementosPorPagina),
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
