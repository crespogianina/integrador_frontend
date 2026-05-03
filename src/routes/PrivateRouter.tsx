import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Rol = "ADMIN" | "CONSULTA";

type PrivateRouteProps = {
  children: React.ReactNode;
  rol?: Rol;
};

export default function PrivateRoute({ children, rol }: PrivateRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (rol && user.rol !== rol) {
    return <Navigate to="/" />;
  }

  return children;
}
