import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio: number;
  imagen?: string;
  cantidad: number;
  personalizacion: number[];
  removidos_nombres: string[];
}

export const UMBRAL_ENVIO_GRATIS = 30000;
export const COSTO_ENVIO_FIJO = 500;

const STORAGE_KEY = "foodstore-cart";

export const keyOf = (productoId: number, pers: number[]) =>
  `${productoId}:${[...pers].sort((a, b) => a - b).join(",")}`;

export function cantidadEnCarritoPorProducto(
  items: CartItem[],
  productoId: number,
): number {
  return items
    .filter((i) => i.producto_id === productoId)
    .reduce((acc, i) => acc + i.cantidad, 0);
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  costoEnvio: number;
  total: number;
  stockPorProducto: Record<number, number>;
  itemKey: (item: CartItem) => string;
  cantidadEnCarrito: (productoId: number) => number;
  puedeAgregarMas: (productoId: number) => boolean;
  stockDisponible: (productoId: number) => number | null;
  actualizarStocks: (stocks: Record<number, number>) => void;
  addItem: (
    item: Omit<CartItem, "cantidad">,
    cantidad?: number,
    stockDisponible?: number,
  ) => boolean;
  setCantidad: (key: string, cantidad: number) => boolean;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

function normalizarItem(
  raw: Partial<CartItem> & Pick<CartItem, "producto_id">,
): CartItem | null {
  if (!raw.producto_id || !raw.nombre) return null;
  const cantidad = Number(raw.cantidad) || 1;
  const precio = Number(raw.precio) || 0;
  return {
    producto_id: raw.producto_id,
    nombre: raw.nombre,
    precio,
    imagen: raw.imagen,
    cantidad,
    personalizacion: raw.personalizacion ?? [],
    removidos_nombres: raw.removidos_nombres ?? [],
  };
}

function leerCarrito(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<CartItem>[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) =>
        normalizarItem(
          item as Partial<CartItem> & Pick<CartItem, "producto_id">,
        ),
      )
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

function maxCantidadLinea(
  items: CartItem[],
  productoId: number,
  lineKey: string,
  stock: number,
): number {
  const enOtrasLineas = items
    .filter(
      (i) =>
        i.producto_id === productoId &&
        keyOf(i.producto_id, i.personalizacion) !== lineKey,
    )
    .reduce((acc, i) => acc + i.cantidad, 0);

  return Math.max(0, stock - enOtrasLineas);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(leerCarrito);
  const [stockPorProducto, setStockPorProducto] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const actualizarStocks = useCallback((stocks: Record<number, number>) => {
    setStockPorProducto((prev) => ({ ...prev, ...stocks }));
  }, []);

  const cantidadEnCarrito = useCallback(
    (productoId: number) => cantidadEnCarritoPorProducto(items, productoId),
    [items],
  );

  const stockDisponible = useCallback(
    (productoId: number) =>
      stockPorProducto[productoId] !== undefined
        ? stockPorProducto[productoId]
        : null,
    [stockPorProducto],
  );

  const puedeAgregarMas = useCallback(
    (productoId: number) => {
      const stock = stockPorProducto[productoId];
      if (stock === undefined) return true;
      return cantidadEnCarritoPorProducto(items, productoId) < stock;
    },
    [items, stockPorProducto],
  );

  const addItem = useCallback(
    (
      item: Omit<CartItem, "cantidad">,
      cantidad = 1,
      stockDisponible?: number,
    ): boolean => {
      let agregado = false;

      setItems((prev) => {
        const stock =
          stockDisponible ?? stockPorProducto[item.producto_id] ?? null;

        if (stock !== null && stock <= 0) return prev;

        const totalActual = cantidadEnCarritoPorProducto(
          prev,
          item.producto_id,
        );
        const espacio =
          stock === null ? cantidad : Math.max(0, stock - totalActual);

        if (espacio <= 0) return prev;

        const aAgregar = Math.min(cantidad, espacio);
        agregado = aAgregar > 0;

        const lineKey = keyOf(item.producto_id, item.personalizacion ?? []);
        const existente = prev.find(
          (i) => keyOf(i.producto_id, i.personalizacion ?? []) === lineKey,
        );

        if (existente) {
          return prev.map((i) =>
            keyOf(i.producto_id, i.personalizacion ?? []) === lineKey
              ? { ...i, cantidad: i.cantidad + aAgregar }
              : i,
          );
        }

        return [
          ...prev,
          {
            ...item,
            personalizacion: item.personalizacion ?? [],
            removidos_nombres: item.removidos_nombres ?? [],
            cantidad: aAgregar,
          },
        ];
      });

      if (stockDisponible !== undefined) {
        setStockPorProducto((prev) => ({
          ...prev,
          [item.producto_id]: stockDisponible,
        }));
      }

      return agregado;
    },
    [stockPorProducto],
  );

  const setCantidad = useCallback(
    (lineKey: string, cantidad: number): boolean => {
      let actualizado = false;

      setItems((prev) => {
        const item = prev.find(
          (i) => keyOf(i.producto_id, i.personalizacion) === lineKey,
        );

        if (!item) return prev;

        if (cantidad <= 0) {
          actualizado = true;
          return prev.filter(
            (i) => keyOf(i.producto_id, i.personalizacion) !== lineKey,
          );
        }

        const stock = stockPorProducto[item.producto_id];
        const cantidadFinal =
          stock === undefined
            ? cantidad
            : Math.min(
                cantidad,
                maxCantidadLinea(prev, item.producto_id, lineKey, stock),
              );

        if (cantidadFinal <= 0) {
          actualizado = true;
          return prev.filter(
            (i) => keyOf(i.producto_id, i.personalizacion) !== lineKey,
          );
        }

        actualizado = cantidadFinal === cantidad || cantidadFinal > 0;

        return prev.map((i) =>
          keyOf(i.producto_id, i.personalizacion) === lineKey
            ? { ...i, cantidad: cantidadFinal }
            : i,
        );
      });

      return actualizado;
    },
    [stockPorProducto],
  );

  const removeItem = useCallback((lineKey: string) => {
    setItems((prev) =>
      prev.filter((i) => keyOf(i.producto_id, i.personalizacion) !== lineKey),
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setStockPorProducto({});
  }, []);

  const value = useMemo<CartContextType>(() => {
    const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const costoEnvio =
      items.length === 0 || subtotal >= UMBRAL_ENVIO_GRATIS
        ? 0
        : COSTO_ENVIO_FIJO;

    return {
      items,
      itemCount: items.reduce((acc, i) => acc + i.cantidad, 0),
      subtotal,
      costoEnvio,
      total: subtotal + costoEnvio,
      stockPorProducto,
      itemKey: (item) => keyOf(item.producto_id, item.personalizacion),
      cantidadEnCarrito,
      puedeAgregarMas,
      stockDisponible,
      actualizarStocks,
      addItem,
      setCantidad,
      removeItem,
      clear,
    };
  }, [
    items,
    stockPorProducto,
    cantidadEnCarrito,
    puedeAgregarMas,
    stockDisponible,
    actualizarStocks,
    addItem,
    setCantidad,
    removeItem,
    clear,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
