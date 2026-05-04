import type { CategoriaRead } from "../models/Categoria";

export type Action =
    | { type: "SET"; payload: CategoriaRead[] }
    | { type: "AGREGAR"; payload: CategoriaRead }
    | { type: "ELIMINAR"; payload: number }
    | { type: "RESET"; payload: CategoriaRead[] }
    | { type: "EDITAR"; payload: CategoriaRead };

export function CategoriasReducer(
    state: CategoriaRead[],
    action: Action
): CategoriaRead[] {
    switch (action.type) {
        case "SET":
        case "RESET":
            return action.payload;

        case "AGREGAR":
            return [...state, action.payload];

        case "ELIMINAR":
            return state.filter((categoria) => categoria.id !== action.payload);

        case "EDITAR":
            return state.map((categoria) =>
                categoria.id === action.payload.id ? action.payload : categoria
            );

        default:
            return state;
    }
}