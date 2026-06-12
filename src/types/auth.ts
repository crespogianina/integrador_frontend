export type Rol = "ADMIN" | "STOCK" | "PEDIDOS" | "CLIENT";

export type AuthUser = {
  id: number;
  username: string;
  roles: Rol[];
};

export type LoginForm = {
  username: string;
  password: string;
};

export type LoginResult =
  | { ok: true }
  | { ok: false; message: string };
