import type { IngredienteRead } from "../models/Ingrediente";

export type Action =
    | { type: "SET"; payload: IngredienteRead[] }
    | { type: "AGREGAR"; payload: IngredienteRead }
    | { type: "ELIMINAR"; payload: number }
    | { type: "RESET"; payload: IngredienteRead[] }
    | { type: "EDITAR"; payload: IngredienteRead };

export function IngredientesReducer(
    state: IngredienteRead[],
    action: Action
): IngredienteRead[] {
    switch (action.type) {
        case "SET":
        case "RESET":
            return action.payload;

        case "AGREGAR":
            return [...state, action.payload];

        case "ELIMINAR":
            return state.filter((ingrediente) => ingrediente.id !== action.payload);

        case "EDITAR":
            return state.map((ingrediente) =>
                ingrediente.id === action.payload.id ? action.payload : ingrediente
            );

        default:
            return state;
    }
}