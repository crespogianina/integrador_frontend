export type Rol = "ADMIN" | "CONSULTA";

export type AuthUser = {
  id: number;
  username: string;
  rol: Rol;
};

export type LoginForm = {
  username: string;
  password: string;
};

export type LoginResult =
  | { ok: true }
  | { ok: false; message: string };
