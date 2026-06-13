import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RootRedirect() {
  const { isAuthenticated, hasRol } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (hasRol("CLIENT")) return <Navigate to="/catalogo" replace />;
  if (hasRol("ADMIN")) return <Navigate to="/productos" replace />;
  if (hasRol(["STOCK", "PEDIDOS"]))
    return <Navigate to="/admin/pedidos" replace />;

  return <Navigate to="/catalogo" replace />;
}
