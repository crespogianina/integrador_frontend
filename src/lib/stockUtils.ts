import type { IngredienteRead } from "../models/Ingrediente";
import type { IngredienteResumen, ProductoRead } from "../models/Producto";
import type { UnidadMedida } from "../models/UnidadMedida";

type RecetaItem = Pick<
  IngredienteResumen,
  "id" | "cantidad" | "unidad_medida_id"
>;

export function calcularStockMaximoProducto(
  receta: RecetaItem[],
  ingredientes: IngredienteRead[],
  unidadesMedida: UnidadMedida[],
): number | null {
  if (!receta.length) return null;

  const factorDe = (unidadId: number) =>
    Number(unidadesMedida.find((u) => u.id === unidadId)?.factor ?? 1);

  const unidadesPosibles: number[] = [];

  for (const item of receta) {
    const ing = ingredientes.find((i) => i.id === item.id);
    const cantidad = Number(item.cantidad);

    if (!ing || !cantidad || cantidad <= 0) continue;

    const stockEnBase =
      Number(ing.stock_cantidad) * factorDe(ing.unidad_medida_id);
    const necesarioEnBase = cantidad * factorDe(item.unidad_medida_id);

    unidadesPosibles.push(Math.floor(stockEnBase / necesarioEnBase));
  }

  return unidadesPosibles.length > 0 ? Math.min(...unidadesPosibles) : 0;
}

export function stockMaximoDeProducto(
  producto: ProductoRead,
  ingredientes: IngredienteRead[],
  unidadesMedida: UnidadMedida[],
): number | null {
  return calcularStockMaximoProducto(
    producto.ingredientes ?? [],
    ingredientes,
    unidadesMedida,
  );
}
