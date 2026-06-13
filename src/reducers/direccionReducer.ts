import type { Direccion } from "../models/Direccion";

type DireccionAction =
    | { type: "SET"; payload: Direccion[] }
    | { type: "AGREGAR"; payload: Direccion }
    | { type: "EDITAR"; payload: Direccion }
    | { type: "ELIMINAR"; payload: number }
    | { type: "PRINCIPAL"; payload: Direccion };

export function DireccionReducer(
    state: Direccion[],
    action: DireccionAction,
): Direccion[] {
    switch (action.type) {
        case "SET":
            return action.payload;

        case "AGREGAR":
            return [...state, action.payload];

        case "EDITAR":
            return state.map((direccion) =>
                direccion.id === action.payload.id
                    ? action.payload
                    : direccion,
            );

        case "ELIMINAR":
            return state.filter(
                (direccion) => direccion.id !== action.payload,
            );

        case "PRINCIPAL":
            return state.map((direccion) => ({
                ...direccion,
                es_principal:
                    direccion.id === action.payload.id,
            }));

        default:
            return state;
    }
}