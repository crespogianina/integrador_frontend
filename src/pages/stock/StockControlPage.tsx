import { useEffect, useMemo, useState } from "react";
import Filtros, { type Filter } from "../../components/Filtros";
import Tabla, { type Column } from "../../components/Tabla";
import { useProductos } from "../../context/ProductoContext";
import { useIngredientes } from "../../context/IngredienteContext";
import type { ProductoRead } from "../../models/Producto";
import type { IngredienteRead } from "../../models/Ingrediente";
import StockBadge, {
  matchesStockLevel,
  STOCK_LEVEL_OPTIONS,
  stockLevelStyle,
  type StockLevelFilter,
} from "../../components/StockBadge";
import { stockMaximoDeProducto } from "../../lib/stockUtils";

type Tab = "productos" | "ingredientes" | "alergenos";

const elementosPorPagina = 10;
const maxItemsConFiltroNivel = 50;

function paginar<T>(items: T[], page: number, perPage: number): T[] {
  const inicio = (page - 1) * perPage;
  return items.slice(inicio, inicio + perPage);
}

const productoFiltrosIniciales = {
  nombre: "",
  descripcion: "",
  disponible: "",
};

const ingredienteFiltrosIniciales = {
  nombre: "",
  descripcion: "",
};

const productoColumns: Column<ProductoRead>[] = [
  { header: "Nombre", accessor: "nombre" },
  { header: "Descripción", accessor: "descripcion" },
  {
    header: "Stock",
    accessor: "stock_cantidad",
    customLabelFn: (stock: number) => <StockBadge stock={stock ?? 0} />,
  },
  {
    header: "Disponible",
    accessor: "disponible",
    customLabelFn: (disponible: boolean) => (
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          disponible
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {disponible ? "Disponible" : "No disponible"}
      </span>
    ),
  },
];

const ingredienteColumns: Column<IngredienteRead>[] = [
  { header: "Nombre", accessor: "nombre" },
  { header: "Descripción", accessor: "descripcion" },
  {
    header: "Stock",
    accessor: "stock_cantidad",
    customLabelFn: (stock: string) => (
      <StockBadge stock={Number(stock) || 0} />
    ),
  },
  {
    header: "Alérgeno",
    accessor: "es_alergeno",
    customLabelFn: (esAlergeno: boolean) => (esAlergeno ? "Sí" : "No"),
  },
  {
    header: "Estado",
    accessor: "activo",
    customLabelFn: (activo: boolean) => (activo ? "Activo" : "Inactivo"),
  },
];

const alergenoColumns: Column<IngredienteRead>[] = [
  { header: "Nombre", accessor: "nombre" },
  { header: "Descripción", accessor: "descripcion" },
  {
    header: "Stock",
    accessor: "stock_cantidad",
    customLabelFn: (stock: string) => (
      <StockBadge stock={Number(stock) || 0} />
    ),
  },
  {
    header: "Estado",
    accessor: "activo",
    customLabelFn: (activo: boolean) => (activo ? "Activo" : "Inactivo"),
  },
];

export default function StockControlPage() {
  const {
    productos,
    cargarProductos,
    total: totalProductos,
    activar,
    desactivar,
    actualizarStock,
    unidadesMedida,
    obtenerUnidadesMedida,
  } = useProductos();

  const {
    ingredientes,
    cargarIngredientes,
    cargarAlergenos,
    total,
  } = useIngredientes();

  const [ingredientesStock, setIngredientesStock] = useState<IngredienteRead[]>(
    [],
  );

  const [tabActiva, setTabActiva] = useState<Tab>("productos");
  const [paginaActual, setPaginaActual] = useState(1);
  const [errorRequest, setErrorRequest] = useState("");
  const [productoEditandoStock, setProductoEditandoStock] =
    useState<ProductoRead | null>(null);
  const [nuevoStock, setNuevoStock] = useState("");
  const [guardandoStock, setGuardandoStock] = useState(false);

  const [filtrosProducto, setFiltrosProducto] = useState(productoFiltrosIniciales);
  const [filtrosProductoDebounced, setFiltrosProductoDebounced] =
    useState(productoFiltrosIniciales);

  const [filtrosIngrediente, setFiltrosIngrediente] = useState(
    ingredienteFiltrosIniciales,
  );
  const [filtrosIngredienteDebounced, setFiltrosIngredienteDebounced] =
    useState(ingredienteFiltrosIniciales);
  const [filtroNivelStock, setFiltroNivelStock] =
    useState<StockLevelFilter>("all");

  const filtroNivelActivo = filtroNivelStock !== "all";

  const productosFiltros: Filter[] = [
    {
      name: "nombre",
      value: filtrosProducto.nombre,
      type: "input",
      placeholder: "Buscar por nombre",
      label: "Nombre",
    },
    {
      name: "descripcion",
      value: filtrosProducto.descripcion,
      type: "input",
      placeholder: "Buscar por descripción",
      label: "Descripción",
    },
    {
      name: "disponible",
      value: filtrosProducto.disponible,
      type: "select",
      label: "Disponible",
      options: [
        { label: "Disponible", value: "true" },
        { label: "No disponible", value: "false" },
      ],
    },
  ];

  const ingredientesFiltros: Filter[] = [
    {
      name: "nombre",
      value: filtrosIngrediente.nombre,
      type: "input",
      placeholder: "Buscar por nombre",
      label: "Nombre",
    },
    {
      name: "descripcion",
      value: filtrosIngrediente.descripcion,
      type: "input",
      placeholder: "Buscar por descripción",
      label: "Descripción",
    },
  ];

  useEffect(() => {
    if (!errorRequest) return;
    const timer = setTimeout(() => setErrorRequest(""), 3000);
    return () => clearTimeout(timer);
  }, [errorRequest]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFiltrosProductoDebounced(filtrosProducto);
      setPaginaActual(1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [filtrosProducto]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFiltrosIngredienteDebounced(filtrosIngrediente);
      setPaginaActual(1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [filtrosIngrediente]);

  useEffect(() => {
    setPaginaActual(1);
  }, [tabActiva, filtroNivelStock]);

  useEffect(() => {
    if (tabActiva !== "productos") return;

    obtenerUnidadesMedida();
    cargarIngredientes(1, maxItemsConFiltroNivel);
  }, [tabActiva]);

  useEffect(() => {
    if (tabActiva === "productos" && ingredientes.length > 0) {
      setIngredientesStock(ingredientes);
    }
  }, [tabActiva, ingredientes]);

  const stockMaximoModal = useMemo(() => {
    if (!productoEditandoStock) return null;
    return stockMaximoDeProducto(
      productoEditandoStock,
      ingredientesStock,
      unidadesMedida,
    );
  }, [productoEditandoStock, ingredientesStock, unidadesMedida]);

  useEffect(() => {
    if (tabActiva !== "productos") return;

    cargarProductos(
      filtroNivelActivo ? 1 : paginaActual,
      filtroNivelActivo ? maxItemsConFiltroNivel : elementosPorPagina,
      filtrosProductoDebounced.nombre,
      filtrosProductoDebounced.descripcion,
      filtrosProductoDebounced.disponible,
    );
  }, [
    tabActiva,
    paginaActual,
    filtroNivelActivo,
    filtrosProductoDebounced.nombre,
    filtrosProductoDebounced.descripcion,
    filtrosProductoDebounced.disponible,
  ]);

  useEffect(() => {
    if (tabActiva !== "ingredientes") return;

    cargarIngredientes(
      filtroNivelActivo ? 1 : paginaActual,
      filtroNivelActivo ? maxItemsConFiltroNivel : elementosPorPagina,
      undefined,
      filtrosIngredienteDebounced.nombre,
      filtrosIngredienteDebounced.descripcion,
    );
  }, [
    tabActiva,
    paginaActual,
    filtroNivelActivo,
    filtrosIngredienteDebounced.nombre,
    filtrosIngredienteDebounced.descripcion,
  ]);

  useEffect(() => {
    if (tabActiva !== "alergenos") return;

    cargarAlergenos(
      filtroNivelActivo ? 1 : paginaActual,
      filtroNivelActivo ? maxItemsConFiltroNivel : elementosPorPagina,
    );
  }, [tabActiva, paginaActual, filtroNivelActivo]);

  const productosFiltrados = useMemo(() => {
    if (!filtroNivelActivo) return productos;
    return productos.filter((p) =>
      matchesStockLevel(p.stock_cantidad ?? 0, filtroNivelStock),
    );
  }, [productos, filtroNivelStock, filtroNivelActivo]);

  const ingredientesFiltrados = useMemo(() => {
    if (!filtroNivelActivo) return ingredientes;
    return ingredientes.filter((i) =>
      matchesStockLevel(Number(i.stock_cantidad) || 0, filtroNivelStock),
    );
  }, [ingredientes, filtroNivelStock, filtroNivelActivo]);

  const productosPagina = filtroNivelActivo
    ? paginar(productosFiltrados, paginaActual, elementosPorPagina)
    : productos;

  const ingredientesPagina = filtroNivelActivo
    ? paginar(ingredientesFiltrados, paginaActual, elementosPorPagina)
    : ingredientes;

  const totalProductosVista = filtroNivelActivo
    ? productosFiltrados.length
    : totalProductos;

  const totalIngredientesVista = filtroNivelActivo
    ? ingredientesFiltrados.length
    : total;

  const totalPaginasProductos = Math.ceil(
    totalProductosVista / elementosPorPagina,
  );
  const totalPaginasIngredientes = Math.ceil(
    totalIngredientesVista / elementosPorPagina,
  );

  const toggleFiltroNivel = (nivel: StockLevelFilter) => {
    setFiltroNivelStock((prev) => (prev === nivel ? "all" : nivel));
  };

  const toggleDisponibilidad = async (producto: ProductoRead) => {
    try {
      if (producto.disponible) {
        await desactivar(producto.id);
      } else {
        await activar(producto.id);
      }
    } catch (error) {
      setErrorRequest(
        error instanceof Error
          ? error.message
          : "Error al cambiar la disponibilidad",
      );
    }
  };

  const abrirModalStock = (producto: ProductoRead) => {
    setProductoEditandoStock(producto);
    setNuevoStock(String(producto.stock_cantidad ?? 0));
  };

  const cerrarModalStock = () => {
    setProductoEditandoStock(null);
    setNuevoStock("");
    setGuardandoStock(false);
  };

  const guardarStock = async () => {
    if (!productoEditandoStock) return;

    const stock = Number(nuevoStock);
    if (
      !nuevoStock.trim() ||
      isNaN(stock) ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setErrorRequest("Ingrese un stock válido (entero ≥ 0)");
      return;
    }

    if (stockMaximoModal !== null && stock > stockMaximoModal) {
      setErrorRequest(
        `El stock no puede superar ${stockMaximoModal} unidades según los ingredientes disponibles.`,
      );
      return;
    }

    setGuardandoStock(true);
    try {
      await actualizarStock(productoEditandoStock.id, stock);
      cerrarModalStock();
    } catch (error) {
      setErrorRequest(
        error instanceof Error ? error.message : "Error al actualizar el stock",
      );
      setGuardandoStock(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "productos", label: "Productos" },
    { id: "ingredientes", label: "Ingredientes" },
    { id: "alergenos", label: "Alérgenos" },
  ];

  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl bg-white p-5 shadow">
          <h1 className="text-2xl font-semibold text-slate-800">
            Control de Stock
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500">Filtrar por nivel:</span>
            {STOCK_LEVEL_OPTIONS.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                onClick={() => toggleFiltroNivel(opcion.id)}
                className={`rounded-full px-2.5 py-0.5 font-semibold transition hover:opacity-90 ${stockLevelStyle(
                  opcion.id,
                  filtroNivelStock === opcion.id,
                )}`}
              >
                {opcion.label} · {opcion.description}
              </button>
            ))}
            {filtroNivelActivo && (
              <button
                type="button"
                onClick={() => setFiltroNivelStock("all")}
                className="rounded-full bg-slate-200 px-2.5 py-0.5 font-semibold text-slate-700 hover:bg-slate-300"
              >
                Ver todos
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 rounded-2xl bg-white p-2 shadow">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabActiva(tab.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tabActiva === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {tabActiva === "productos" && (
          <section className="space-y-4">
            <Filtros
              filters={productosFiltros}
              onChange={(name, value) =>
                setFiltrosProducto((prev) => ({ ...prev, [name]: value }))
              }
              onClear={() => setFiltrosProducto(productoFiltrosIniciales)}
            />

            <Tabla
              title="Productos"
              total={totalProductosVista}
              data={productosPagina}
              columns={productoColumns}
              getRowId={(p) => p.id}
              onEdit={abrirModalStock}
              editLabel="Editar stock"
              page={paginaActual}
              totalPages={totalPaginasProductos || 1}
              onPrevious={() => setPaginaActual((p) => p - 1)}
              onNext={() => setPaginaActual((p) => p + 1)}
              onPageChange={setPaginaActual}
              emptyMessage={
                filtroNivelActivo
                  ? "No hay productos con ese nivel de stock."
                  : "No se encontraron productos."
              }
              customAction={{
                label: (p) => (p.disponible ? "Desactivar" : "Activar"),
                actionCallback: toggleDisponibilidad,
              }}
            />
          </section>
        )}

        {tabActiva === "ingredientes" && (
          <section className="space-y-4">
            <Filtros
              filters={ingredientesFiltros}
              onChange={(name, value) =>
                setFiltrosIngrediente((prev) => ({ ...prev, [name]: value }))
              }
              onClear={() => setFiltrosIngrediente(ingredienteFiltrosIniciales)}
            />

            <Tabla
              title="Ingredientes"
              total={totalIngredientesVista}
              data={ingredientesPagina}
              columns={ingredienteColumns}
              getRowId={(i) => i.id}
              page={paginaActual}
              totalPages={totalPaginasIngredientes || 1}
              onPrevious={() => setPaginaActual((p) => p - 1)}
              onNext={() => setPaginaActual((p) => p + 1)}
              onPageChange={setPaginaActual}
              emptyMessage={
                filtroNivelActivo
                  ? "No hay ingredientes con ese nivel de stock."
                  : "No se encontraron ingredientes."
              }
            />
          </section>
        )}

        {tabActiva === "alergenos" && (
          <Tabla
            title="Alérgenos"
            total={totalIngredientesVista}
            data={ingredientesPagina}
            columns={alergenoColumns}
            getRowId={(i) => i.id}
            page={paginaActual}
            totalPages={totalPaginasIngredientes || 1}
            onPrevious={() => setPaginaActual((p) => p - 1)}
            onNext={() => setPaginaActual((p) => p + 1)}
            onPageChange={setPaginaActual}
            emptyMessage={
              filtroNivelActivo
                ? "No hay alérgenos con ese nivel de stock."
                : "No se encontraron alérgenos."
            }
          />
        )}
      </section>

      {productoEditandoStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-800">
              Actualizar stock
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {productoEditandoStock.nombre}
            </p>

            {stockMaximoModal !== null && (
              <p className="mt-2 text-sm text-slate-600">
                Máximo según ingredientes:{" "}
                <span className="font-semibold text-slate-800">
                  {stockMaximoModal}
                </span>
              </p>
            )}

            <label
              htmlFor="stock-cantidad"
              className="mt-4 block text-sm font-medium text-slate-700"
            >
              Cantidad en stock
            </label>
            <input
              id="stock-cantidad"
              type="number"
              min={0}
              max={stockMaximoModal ?? undefined}
              step={1}
              value={nuevoStock}
              onChange={(e) => setNuevoStock(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-blue-500 focus:outline-none"
            />
            {stockMaximoModal !== null && (
              <p className="mt-1 text-xs text-slate-500">
                Podés asignar menos por merma o reserva, pero no más del máximo.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={cerrarModalStock}
                disabled={guardandoStock}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarStock}
                disabled={guardandoStock}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {guardandoStock ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {errorRequest && (
        <div className="fixed bottom-10 right-5 z-50">
          <div className="animate-slide-in rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
            {errorRequest}
          </div>
        </div>
      )}
    </main>
  );
}
