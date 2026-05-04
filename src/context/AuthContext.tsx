import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { API_BASE } from "../config/api";
import { parseUserFromJwt } from "../lib/jwtUser";
import type { AuthUser, LoginForm, LoginResult, Rol } from "../types/auth";

const TOKEN_KEY = "token";
const USER_KEY = "user";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  rol: Rol | null;
  isAuthenticated: boolean;
  hasRol: (roles: Rol | Rol[]) => boolean;
  login: (formularioLogin: LoginForm) => Promise<LoginResult>;
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

function normalizeApiUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;

  const data = raw as Record<string, unknown>;

  const id = typeof data.id === "number" ? data.id : null;
  const email = typeof data.email === "string" ? data.email : null;
  const rol = data.rol;

  if (id === null || email === null || !isRol(rol)) {
    return null;
  }

  return {
    id,
    email,
    rol,
  };
}

function saveAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function readInitialAuth(): {
  user: AuthUser | null;
  token: string | null;
} {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
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
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      if (!response.ok) {
        return {
          ok: false,
          message: await getErrorMessage(response),
        };
      }

      const data = await response.json();

      const accessToken = data.access_token ?? data.token;

      if (!accessToken || typeof accessToken !== "string") {
        return {
          ok: false,
          message: "Respuesta del servidor sin token",
        };
      }

      const nextUser =
        normalizeApiUser(data.user) ?? parseUserFromJwt(accessToken);

      if (!nextUser) {
        return {
          ok: false,
          message: "No se pudo leer el usuario",
        };
      }

      saveAuth(accessToken, nextUser);

      setToken(accessToken);
      setUser(nextUser);

      return { ok: true };
    } catch {
      return {
        ok: false,
        message: "No se pudo conectar con el servidor",
      };
    }
  }, []);

  const logout = useCallback((): void => {
    clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  const rol = user?.rol ?? null;
  const isAuthenticated = Boolean(user && token);

  const hasRol = useCallback(
    (roles: Rol | Rol[]): boolean => {
      if (!user) return false;

      const rolesPermitidos = Array.isArray(roles) ? roles : [roles];

      return rolesPermitidos.includes(user.rol);
    },
    [user],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      rol,
      isAuthenticated,
      hasRol,
      login,
      logout,
    }),
    [user, token, rol, isAuthenticated, hasRol, login, logout],
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
