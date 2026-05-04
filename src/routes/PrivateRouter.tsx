import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Rol } from "../types/auth";

type PrivateRouteProps = {
  children: React.ReactNode;
  /** Si se define, solo ese rol puede acceder */
  roles?: Rol | Rol[];
};

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, hasRol } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles !== undefined && !hasRol(roles)) {
    return <Navigate to="/productos" replace />;
  }

  return children;
}
