import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, getApiBaseUrl } from "../lib/api";
import type { AuthUser, LoginCredentials, RolCodigo } from "../types/auth";
import {
  clearPersistedAuth,
  loadPersistedAuth,
  persistAuth,
} from "../types/auth";

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextType = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /** True si el usuario tiene al menos uno de los roles indicados */
  hasAnyRole: (...roles: RolCodigo[]) => boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

type TokenResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const hydrateFromStorage = useCallback(() => {
    const saved = loadPersistedAuth();
    if (saved?.accessToken && saved.user) {
      setAccessToken(saved.accessToken);
      setUser(saved.user);
    } else {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const refreshUser = useCallback(async () => {
    const token = loadPersistedAuth()?.accessToken;
    if (!token) return;

    const res = await apiFetch("/api/v1/auth/me", { method: "GET" });
    if (!res.ok) {
      clearPersistedAuth();
      setAccessToken(null);
      setUser(null);
      return;
    }
    const me = (await res.json()) as AuthUser;
    persistAuth({ accessToken: token, user: me });
    setUser(me);
  }, []);

  useEffect(() => {
    const saved = loadPersistedAuth();
    if (saved?.accessToken) {
      void refreshUser();
    }
  }, [refreshUser]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: "Email o contraseña incorrectos." };
    }

    if (!res.ok) {
      let detail = "No se pudo iniciar sesión.";
      try {
        const body = (await res.json()) as { detail?: string | { msg: string }[] };
        if (typeof body.detail === "string") detail = body.detail;
      } catch {
        /* ignore */
      }
      return { ok: false, error: detail };
    }

    const data = (await res.json()) as TokenResponse;
    persistAuth({ accessToken: data.access_token, user: data.user });
    setAccessToken(data.access_token);
    setUser(data.user);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    clearPersistedAuth();
    setAccessToken(null);
    setUser(null);
  }, []);

  const hasAnyRole = useCallback(
    (...roles: RolCodigo[]) => {
      if (!user?.roles?.length) return false;
      return roles.some((r) => user.roles.includes(r));
    },
    [user],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      hasAnyRole,
      login,
      logout,
      refreshUser,
    }),
    [user, accessToken, hasAnyRole, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
