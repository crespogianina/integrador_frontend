import type { CategoriaRead } from "../models/Categoria";

export type Action =
    | { type: "SET"; payload: CategoriaRead[] }
    | { type: "AGREGAR"; payload: CategoriaRead }
    | { type: "RESET"; payload: CategoriaRead[] }
    | { type: "EDITAR"; payload: CategoriaRead }
    | { type: "ACTIVAR"; payload: number }
    | { type: "DESACTIVAR"; payload: number };

export function CategoriasReducer(
    state: CategoriaRead[],
    action: Action,
): CategoriaRead[] {
    switch (action.type) {
        case "SET":
        case "RESET":
            return action.payload;

        case "AGREGAR":
            return [...state, action.payload];

        case "EDITAR":
            return state.map((categoria) =>
                categoria.id === action.payload.id ? action.payload : categoria,
            );

        case "ACTIVAR":
            return state.map((producto) => {
                if (producto.id === action.payload) {
                    producto.activo = true;
                }

                return producto;
            });

        case "DESACTIVAR":
            return state.map((producto) => {
                if (producto.id === action.payload) {
                    producto.activo = false;
                }

                return producto;
            });

        default:
            return state;
    }
}
