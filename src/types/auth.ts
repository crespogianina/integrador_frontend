export type Rol = "ADMIN" | "CONSULTA";

export type AuthUser = {
  id: number;
  email: string;
  rol: Rol;
};

export type LoginForm = {
  email: string;
  password: string;
};

export type LoginResult =
  | { ok: true }
  | { ok: false; message: string };
