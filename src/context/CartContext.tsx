// context/CartContext.tsx — el carrito vive 100% en el front (tu backend no
// tiene endpoints de carrito: recién se entera en POST /pedidos/)
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
  /** IDs de ingredientes removidos ("sin cebolla") */
  personalizacion: number[];
  /** Nombres para mostrar en el carrito */
  removidos_nombres: string[];
}

// Espejo de _calcular_costo_envio del backend (solo para MOSTRAR un estimado;
// el valor real lo calcula y guarda el backend al crear el pedido)
export const UMBRAL_ENVIO_GRATIS = 10000;
export const COSTO_ENVIO_FIJO = 500;

const STORAGE_KEY = "foodstore-cart";

/** Mismo producto + misma personalización (ordenada) = misma línea */
const keyOf = (productoId: number, pers: number[]) =>
  `${productoId}:${[...pers].sort((a, b) => a - b).join(",")}`;

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  costoEnvio: number;
  total: number;
  itemKey: (item: CartItem) => string;
  addItem: (item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  setCantidad: (key: string, cantidad: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

function normalizarItem(raw: Partial<CartItem> & Pick<CartItem, "producto_id">): CartItem | null {
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
      .map((item) => normalizarItem(item as Partial<CartItem> & Pick<CartItem, "producto_id">))
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(leerCarrito);

  // Persistencia: cada cambio se espeja a localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "cantidad">, cantidad = 1) => {
      setItems((prev) => {
        const key = keyOf(item.producto_id, item.personalizacion ?? []);
        const existente = prev.find(
          (i) => keyOf(i.producto_id, i.personalizacion ?? []) === key,
        );
        if (existente) {
          return prev.map((i) =>
            keyOf(i.producto_id, i.personalizacion ?? []) === key
              ? { ...i, cantidad: i.cantidad + cantidad }
              : i,
          );
        }
        return [
          ...prev,
          {
            ...item,
            personalizacion: item.personalizacion ?? [],
            removidos_nombres: item.removidos_nombres ?? [],
            cantidad,
          },
        ];
      });
    },
    [],
  );

  const setCantidad = useCallback((key: string, cantidad: number) => {
    setItems((prev) =>
      cantidad <= 0
        ? prev.filter((i) => keyOf(i.producto_id, i.personalizacion) !== key)
        : prev.map((i) =>
            keyOf(i.producto_id, i.personalizacion) === key
              ? { ...i, cantidad }
              : i,
          ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) =>
      prev.filter((i) => keyOf(i.producto_id, i.personalizacion) !== key),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

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
      itemKey: (item) => keyOf(item.producto_id, item.personalizacion),
      addItem,
      setCantidad,
      removeItem,
      clear,
    };
  }, [items, addItem, setCantidad, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
