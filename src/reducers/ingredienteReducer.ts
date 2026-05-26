import type { IngredienteRead } from "../models/Ingrediente";

export type Action =
    | { type: "SET"; payload: IngredienteRead[] }
    | { type: "AGREGAR"; payload: IngredienteRead }
    | { type: "RESET"; payload: IngredienteRead[] }
    | { type: "EDITAR"; payload: IngredienteRead }
    | { type: "ACTIVAR"; payload: number }
    | { type: "DESACTIVAR"; payload: number };

export function IngredientesReducer(
    state: IngredienteRead[],
    action: Action,
): IngredienteRead[] {
    switch (action.type) {
        case "SET":
        case "RESET":
            return action.payload;

        case "AGREGAR":
            return [...state, action.payload];

        case "EDITAR":
            return state.map((ingrediente) =>
                ingrediente.id === action.payload.id ? action.payload : ingrediente,
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
