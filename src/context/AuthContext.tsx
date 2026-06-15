import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE, registerLogout } from "../config/api";
import { parseUserFromJwt } from "../lib/jwtUser";
import type { AuthUser, LoginForm, LoginResult, RegisterForm, RegisterResult, Rol } from "../types/auth";

const TOKEN_KEY = "token";
const USER_KEY = "user";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  rol: Rol | null;
  isAuthenticated: boolean;
  hasRol: (roles: Rol | Rol[]) => boolean;
  login: (formularioLogin: LoginForm) => Promise<LoginResult>;
  register: (formulario: RegisterForm) => Promise<RegisterResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function isRol(value: unknown): value is Rol {
  return (
    value === "ADMIN" ||
    value === "STOCK" ||
    value === "PEDIDOS" ||
    value === "CLIENT"
  );
}

function isTokenVigente(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function normalizeApiUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Record<string, unknown>;

  const id = typeof data.id === "number" ? data.id : null;
  const username = typeof data.username === "string" ? data.username : null;
  const nombre = typeof data.nombre === "string" ? data.nombre : undefined;
  const roles = Array.isArray(data.roles) ? data.roles.filter(isRol) : [];

  if (id === null || username === null || roles.length === 0) {
    return null;
  }

  return { id, username, roles, ...(nombre ? { nombre } : {}) };
}

function saveAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function readInitialAuth(): { user: AuthUser | null; token: string | null } {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token || !isTokenVigente(token)) {
    clearAuth();
    return { user: null, token: null };
  }

  const rawUser = localStorage.getItem(USER_KEY);

  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser);
      const user = normalizeApiUser(parsed);

      if (user) {
        return { user, token };
      }
    } catch {
      clearAuth();
    }
  }

  const userFromJwt = parseUserFromJwt(token);

  if (userFromJwt) {
    saveAuth(token, userFromJwt);
    return { user: userFromJwt, token };
  }

  clearAuth();

  return { user: null, token: null };
}

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const error = await response.json();

    if (typeof error.detail === "string") {
      return error.detail;
    }

    if (Array.isArray(error.detail) && error.detail[0]?.msg) {
      return error.detail[0].msg;
    }

    if (typeof error.message === "string") {
      return error.message;
    }
  } catch {
    return "Credenciales inválidas o error del servidor";
  }

  return "Credenciales inválidas o error del servidor";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialAuth = readInitialAuth();

  const [user, setUser] = useState<AuthUser | null>(initialAuth.user);
  const [token, setToken] = useState<string | null>(initialAuth.token);

  const login = useCallback(async (form: LoginForm): Promise<LoginResult> => {
    try {
      const body = new URLSearchParams({
        username: form.username,
        password: form.password,
      });

      const response = await fetch(`${API_BASE}/usuario/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: body.toString(),
      });

      if (!response.ok) {
        return { ok: false, message: await getErrorMessage(response) };
      }

      const data = await response.json();
      const accessToken = data.access_token ?? data.token;

      if (!accessToken || typeof accessToken !== "string") {
        return { ok: false, message: "Respuesta del servidor sin token" };
      }

      const meResponse = await fetch(`${API_BASE}/usuario/me`, {
        credentials: "include",
      });

      if (!meResponse.ok) {
        return { ok: false, message: "No se pudo obtener el usuario" };
      }

      const nextUser = normalizeApiUser(await meResponse.json());

      if (!nextUser) {
        return { ok: false, message: "No se pudo leer el usuario" };
      }

      saveAuth(accessToken, nextUser);
      setToken(accessToken);
      setUser(nextUser);

      return { ok: true, user: nextUser };
    } catch {
      return { ok: false, message: "No se pudo conectar con el servidor" };
    }
  }, []);

  const register = useCallback(async (form: RegisterForm): Promise<RegisterResult> => {
    try {
      const body: Record<string, string> = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      if (form.celular.trim()) {
        body.celular = form.celular.trim();
      }

      const response = await fetch(`${API_BASE}/usuario/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        return { ok: false, message: await getErrorMessage(response) };
      }

      return { ok: true };
    } catch {
      return { ok: false, message: "No se pudo conectar con el servidor" };
    }
  }, []);

  const logout = useCallback((): void => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    registerLogout(logout);
  }, [logout]);

  const rol = user?.roles[0] ?? null;

  const hasRol = useCallback(
    (roles: Rol | Rol[]): boolean => {
      if (!user) return false;
      const rolesPermitidos = Array.isArray(roles) ? roles : [roles];
      return user.roles.some((r) => rolesPermitidos.includes(r));
    },
    [user],
  );

  const isAuthenticated = Boolean(user && token);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      rol,
      isAuthenticated,
      hasRol,
      login,
      register,
      logout,
    }),
    [user, token, rol, isAuthenticated, hasRol, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
