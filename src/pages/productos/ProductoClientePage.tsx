import { useEffect, useState } from "react";
import { useProductos } from "../../context/ProductoContext";
import Filtros from "../../components/Filtros";
import type { Filter } from "../../components/Filtros";
import CardGrid from "../../components/CardGrid";
import type { CardField } from "../../components/CardGrid";
import type { ProductoRead } from "../../models/Producto";
import { useCart } from "../../context/CartContext";

const initialFiltros = { nombre: "", descripcion: "", disponible: "true" };

function puedeComprarProducto(producto: ProductoRead): boolean {
  return producto.disponible && (producto.stock_cantidad ?? 0) > 0;
}

function etiquetaNoComprable(producto: ProductoRead): string {
  if (!producto.disponible) return "No disponible";
  if ((producto.stock_cantidad ?? 0) <= 0) return "Sin stock";
  return "No disponible";
}

const fields: CardField<ProductoRead>[] = [
  {
    label: "Precio",
    render: (p) => `$${p.precio_base.toFixed(2)}`,
  },
  {
    label: "Stock",
    render: (p) => p.stock_cantidad,
  },
];

export default function ProductoClientePage() {
  const { productos, cargarProductos, total } = useProductos();

  const [filtros, setFiltros] = useState(initialFiltros);
  const [filtrosDebounced, setFiltrosDebounced] = useState(initialFiltros);
  const [paginaActual, setPaginaActual] = useState(1);

  const elementosPorPagina = 9;
  const totalPaginas = Math.ceil(total / elementosPorPagina);
  const { addItem, cantidadEnCarrito } = useCart();
  const [errorCarrito, setErrorCarrito] = useState("");
  const productosFiltros: Filter[] = [
    {
      name: "nombre",
      value: filtros.nombre,
      type: "input",
      placeholder: "Buscar por nombre",
      label: "Nombre",
    },
    {
      name: "disponible",
      value: filtros.disponible,
      type: "select",
      label: "Disponible",
      options: [
        { label: "Disponible", value: "true" },
        { label: "No disponible", value: "false" },
      ],
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

  const handleAddToCart = (producto: ProductoRead) => {
    if (!puedeComprarProducto(producto)) return;

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
        personalizacion: [],
        removidos_nombres: [],
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

  const puedeAgregarAlCarrito = (producto: ProductoRead) => {
    if (!puedeComprarProducto(producto)) return false;
    return cantidadEnCarrito(producto.id) < (producto.stock_cantidad ?? 0);
  };
  return (
    <main className="min-h-screen w-lvw bg-slate-100 p-6">
      <section className="mx-auto max-w-6xl space-y-6">
        <Filtros
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
          badge={(p) => (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                p.disponible
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {p.disponible ? "Disponible" : "No disponible"}
            </span>
          )}
          page={paginaActual}
          totalPages={totalPaginas}
          onAddToCart={handleAddToCart}
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
