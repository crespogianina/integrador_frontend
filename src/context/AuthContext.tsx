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

function isRol(value: unknown): value is Rol {
  return value === "ADMIN" || value === "CONSULTA";
}

function normalizeApiUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "number" ? o.id : null;
  const username = typeof o.username === "string" ? o.username : null;
  const rol = o.rol;
  if (id == null || username == null || !isRol(rol)) return null;
  return { id, username, rol };
}

function readInitialAuth(): { user: AuthUser | null; token: string | null } {
  const token = localStorage.getItem("token");
  if (!token) return { user: null, token: null };

  const rawUser = localStorage.getItem("user");
  if (rawUser) {
    try {
      const parsed = JSON.parse(rawUser) as unknown;
      const u = normalizeApiUser(parsed);
      if (u) return { user: u, token };
    } catch {
      /* continuar con JWT */
    }
  }

  const fromJwt = parseUserFromJwt(token);
  if (fromJwt) {
    localStorage.setItem("user", JSON.stringify(fromJwt));
    return { user: fromJwt, token };
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return { user: null, token: null };
}

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initial = readInitialAuth();
  const [user, setUser] = useState<AuthUser | null>(initial.user);
  const [token, setToken] = useState<string | null>(initial.token);

  const login = useCallback(async (form: LoginForm): Promise<LoginResult> => {
    const username = form.username.trim();
    const password = form.password;

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      let message = "Credenciales inválidas o error del servidor";
      try {
        const err = (await response.json()) as { detail?: unknown };
        if (typeof err.detail === "string") {
          message = err.detail;
        } else if (Array.isArray(err.detail) && err.detail[0]) {
          const first = err.detail[0] as { msg?: string };
          if (typeof first?.msg === "string") message = first.msg;
        }
      } catch {
        /* mensaje por defecto */
      }
      return { ok: false, message };
    }

    const data = (await response.json()) as {
      token?: string;
      access_token?: string;
      user?: unknown;
    };

    const accessToken = data.token ?? data.access_token;
    if (!accessToken || typeof accessToken !== "string") {
      return { ok: false, message: "Respuesta del servidor sin token" };
    }

    let nextUser = normalizeApiUser(data.user);
    if (!nextUser) {
      nextUser = parseUserFromJwt(accessToken);
    }
    if (!nextUser) {
      return {
        ok: false,
        message: "No se pudo leer el usuario (token o datos incompletos)",
      };
    }

    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    setToken(accessToken);
    setUser(nextUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const rol = user?.rol ?? null;
  const isAuthenticated = Boolean(user && token);

  const hasRol = useCallback(
    (roles: Rol | Rol[]) => {
      if (!user) return false;
      const list = Array.isArray(roles) ? roles : [roles];
      return list.includes(user.rol);
    },
    [user],
  );

  const value = useMemo(
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

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
