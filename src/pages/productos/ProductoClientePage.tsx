import { useEffect, useState } from "react";
import { useProductos } from "../../context/ProductoContext";
import Filtros from "../../components/Filtros";
import type { Filter } from "../../components/Filtros";
import CardGrid from "../../components/CardGrid";
import type { CardField } from "../../components/CardGrid";
import type { IngredienteResumen, ProductoRead } from "../../models/Producto";
import { useCart } from "../../context/CartContext";
import AgregarCarritoModal from "../../components/AgregarCarritoModal";
import IngredientesDesplegable from "../../components/IngredientesDesplegable";
import { brand } from "../../lib/brand";

const initialFiltros = { nombre: "", descripcion: "", disponible: "true" };

function puedeComprarProducto(producto: ProductoRead): boolean {
  return producto.disponible && (producto.stock_cantidad ?? 0) > 0;
}

function etiquetaNoComprable(producto: ProductoRead): string {
  if (!producto.disponible) return "No disponible";
  if ((producto.stock_cantidad ?? 0) <= 0) return "Sin stock";
  return "No disponible";
}

function mensajeStockBajo(stock: number): string | null {
  if (stock <= 0 || stock > 2) return null;
  if (stock === 1) return "¡Último disponible!";
  return `¡Últimos ${stock} disponibles!`;
}

const fields: CardField<ProductoRead>[] = [
  {
    label: "Precio",
    hideLabel: true,
    valueClassName: "text-xl font-bold text-slate-900",
    render: (p) => `$${p.precio_base.toFixed(2)}`,
  },
  {
    label: "Stock",
    hideLabel: true,
    valueClassName: "text-xs font-semibold text-amber-600",
    render: (p) => mensajeStockBajo(p.stock_cantidad ?? 0),
  },
];

export default function ProductoClientePage() {
  const { productos, cargarProductos, total } = useProductos();

  const [filtros, setFiltros] = useState(initialFiltros);
  const [filtrosDebounced, setFiltrosDebounced] = useState(initialFiltros);
  const [paginaActual, setPaginaActual] = useState(1);
  const [productoModal, setProductoModal] = useState<ProductoRead | null>(null);
  const [errorCarrito, setErrorCarrito] = useState("");

  const elementosPorPagina = 9;
  const totalPaginas = Math.ceil(total / elementosPorPagina);
  const { addItem, cantidadEnCarrito } = useCart();

  const productosFiltros: Filter[] = [
    {
      name: "nombre",
      value: filtros.nombre,
      type: "input",
      placeholder: "Buscar hamburguesas, postres...",
      label: "",
    },
  ];

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

  useEffect(() => {
    if (!errorCarrito) return;
    const timer = setTimeout(() => setErrorCarrito(""), 3000);
    return () => clearTimeout(timer);
  }, [errorCarrito]);

  const confirmarAgregar = (
    producto: ProductoRead,
    removidos: IngredienteResumen[],
  ) => {
    const stock = producto.stock_cantidad ?? 0;
    const enCarrito = cantidadEnCarrito(producto.id);

    if (enCarrito >= stock) {
      setErrorCarrito(
        `Ya tenés el máximo disponible de "${producto.nombre}" (${stock}).`,
      );
      return;
    }

    const agregado = addItem(
      {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio_base,
        imagen: producto.imagenes_url[0] ?? undefined,
        personalizacion: removidos.map((i) => i.id),
        removidos_nombres: removidos.map((i) => i.nombre),
      },
      1,
      stock,
    );

    if (!agregado) {
      setErrorCarrito(
        `No hay más stock disponible para "${producto.nombre}".`,
      );
    }
  };

  const abrirModal = (producto: ProductoRead) => {
    if (!puedeComprarProducto(producto)) return;
    if (cantidadEnCarrito(producto.id) >= (producto.stock_cantidad ?? 0)) {
      setErrorCarrito(
        `Ya tenés el máximo disponible de "${producto.nombre}".`,
      );
      return;
    }
    setProductoModal(producto);
  };

  const puedeAgregarAlCarrito = (producto: ProductoRead) => {
    if (!puedeComprarProducto(producto)) return false;
    return cantidadEnCarrito(producto.id) < (producto.stock_cantidad ?? 0);
  };

  return (
    <main className={`relative min-h-screen w-lvw p-6 ${brand.pageBg}`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: brand.catalogPattern,
          backgroundSize: "72px 72px",
        }}
        aria-hidden
      />
      <section className="relative mx-auto max-w-6xl space-y-6">
        <Filtros
          title="¡Hola! ¿Qué se te antoja hoy?"
          titleClassName="text-2xl font-bold text-slate-800 md:text-3xl"
          inputFocusClassName={brand.inputFocus}
          filters={productosFiltros}
          onChange={(name, value) =>
            setFiltros((prev) => ({ ...prev, [name]: value }))
          }
          onClear={() => setFiltros(initialFiltros)}
        />

        <CardGrid
          title="Productos"
          total={total}
          data={productos || []}
          getRowId={(p) => p.id}
          getTitle={(p) => p.nombre}
          getImage={(p) => p.imagenes_url[0] ?? null}
          getDescription={(p) => p.descripcion}
          fields={fields}
          extraContent={(p) => <IngredientesDesplegable producto={p} />}
          addToCartActiveClassName={brand.solid}
          paginationActiveClassName={brand.paginationActive}
          page={paginaActual}
          totalPages={totalPaginas}
          onAddToCart={abrirModal}
          canAddToCart={puedeAgregarAlCarrito}
          addToCartDisabledLabel={(p) =>
            cantidadEnCarrito(p.id) >= (p.stock_cantidad ?? 0) &&
            p.disponible &&
            (p.stock_cantidad ?? 0) > 0
              ? "Máximo en carrito"
              : etiquetaNoComprable(p)
          }
          onPrevious={() => setPaginaActual((p) => p - 1)}
          onNext={() => setPaginaActual((p) => p + 1)}
          onPageChange={setPaginaActual}
        />
      </section>

      <AgregarCarritoModal
        producto={productoModal}
        onClose={() => setProductoModal(null)}
        onConfirm={confirmarAgregar}
      />

      {errorCarrito && (
        <div className="fixed bottom-10 right-5 z-50">
          <div className="rounded-b-md bg-red-500 px-4 py-3 text-white shadow-lg">
            {errorCarrito}
          </div>
        </div>
      )}
    </main>
  );
}
