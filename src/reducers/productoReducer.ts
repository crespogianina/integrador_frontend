import type { ProductoRead } from "../models/Producto";

export type Action =
    | { type: "SET"; payload: ProductoRead[] }
    | { type: "AGREGAR"; payload: ProductoRead }
    | { type: "ELIMINAR"; payload: number }
    | { type: "RESET"; payload: ProductoRead[] }
    | { type: "EDITAR"; payload: ProductoRead };

export function ProductosReducer(
    state: ProductoRead[],
    action: Action
): ProductoRead[] {
    switch (action.type) {
        case "SET":
        case "RESET":
            return action.payload;

        case "AGREGAR":
            return [...state, action.payload];

        case "ELIMINAR":
            return state.filter((producto) => producto.id !== action.payload);

        case "EDITAR":
            return state.map((producto) =>
                producto.id === action.payload.id ? action.payload : producto
            );

        default:
            return state;
    }
}