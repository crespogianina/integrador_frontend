import type { Column } from "../components/Tabla";

export interface Cliente {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    roles: string[];
    deleted_at: string | null;
}

export const clienteColumnasTabla: Column<Cliente>[] = [
    {
        header: "Nombre",
        accessor: "nombre",
        customLabelFn: (nombre: string, data: Cliente[]) => {
            const cliente = data.find((c) => c.nombre === nombre);
            return `${nombre} ${cliente?.apellido ?? ""}`;
        },
    },
    { header: "Email", accessor: "email" },
    {
        header: "Roles",
        accessor: "roles",
        customLabelFn: (roles: string[]) => roles.join(", "),
    },
    {
        header: "Estado",
        accessor: "deleted_at",
        customLabelFn: (deleted_at: string | null) =>
            deleted_at ? "Inactivo" : "Activo",
    },
];

export const initialFiltrosClientePage = {
    nombre: "",
    email: "",
    estado: "",
    rol: "",
};