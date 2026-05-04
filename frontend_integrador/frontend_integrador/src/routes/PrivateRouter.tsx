import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { RolCodigo } from "../types/auth";

type PrivateRouteProps = {
  children: React.ReactNode;
  /** Si se define, hace falta al menos uno de estos roles */
  roles?: RolCodigo[];
};

/**
 * Wrapper legado para proteger un árbol concreto por roles.
 * Preferí `RequireAuth` + rutas anidadas; este componente sigue útil para envolver vistas puntuales.
 */
export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, isAuthenticated, hasAnyRole } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !hasAnyRole(...roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
