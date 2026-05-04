/** Roles alineados con el backend (Food Store / integrador). */
export type RolCodigo = "ADMIN" | "STOCK" | "PEDIDOS" | "CLIENT";

export type AuthUser = {
  id: number;
  email: string;
  nombre: string;
  apellido: string | null;
  roles: RolCodigo[];
};

export type LoginCredentials = {
  email: string;
  password: string;
};

const STORAGE_KEY = "food-store-auth";

export type PersistedAuth = {
  accessToken: string;
  user: AuthUser;
};

export function loadPersistedAuth(): PersistedAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedAuth;
  } catch {
    return null;
  }
}

export function persistAuth(data: PersistedAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearPersistedAuth() {
  localStorage.removeItem(STORAGE_KEY);
}
