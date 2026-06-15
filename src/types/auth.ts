export type Rol = "ADMIN" | "STOCK" | "PEDIDOS" | "CLIENT";

export type AuthUser = {
  id: number;
  username: string;
  nombre?: string;
  roles: Rol[];
};

export type LoginForm = {
  username: string;
  password: string;
};

export type RegisterForm = {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  celular: string;
  password: string;
};

export type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false; message: string };

export type RegisterResult =
  | { ok: true }
  | { ok: false; message: string };